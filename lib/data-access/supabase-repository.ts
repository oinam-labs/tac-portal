import { supabase } from '../supabase';
import {
    DataAccessLayer,
    ShipmentRepository,
    ManifestRepository,
    UserRepository,
} from './index';
import {
    Shipment,
    Manifest,
    User,
    ShipmentStatus,
    HubLocation,
} from '../../types';

// Helper types for Supabase rows

// --- Mappers ---

const mapShipment = (row: any): Shipment => ({
    id: row.id,
    awb: row.awb_number,
    customerId: row.customer_id,
    customerName: row.customer?.name || 'Unknown',
    originHub: row.origin_hub?.code as HubLocation,
    destinationHub: row.destination_hub?.code as HubLocation,
    mode: row.mode,
    serviceLevel: row.service_level,
    status: row.status,
    totalPackageCount: row.package_count,
    totalWeight: {
        dead: row.total_weight,
        volumetric: 0,
        chargeable: row.total_weight
    }, // Simplified weight map
    eta: 'TBD',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUpdate: 'Synced from DB',
    invoiceId: row.invoice_id,
    contentsDescription: 'General Cargo', // Not in DB currently
    paymentMode: 'PAID' // Default
});

const mapUser = (row: any): User => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role as any,
    active: row.is_active,
    lastLogin: row.updated_at || 'Never',
    assignedHub: row.hub?.code as any,
});

// --- Repositories ---

class SupabaseShipmentRepository implements ShipmentRepository {
    async getAll(): Promise<Shipment[]> {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                *,
                customer:customers(name),
                origin_hub:hubs!shipments_origin_hub_id_fkey(code),
                destination_hub:hubs!shipments_destination_hub_id_fkey(code)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapShipment);
    }

    async getByAWB(awb: string): Promise<Shipment | null> {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                *,
                customer:customers(name),
                origin_hub:hubs!shipments_origin_hub_id_fkey(code),
                destination_hub:hubs!shipments_destination_hub_id_fkey(code)
            `)
            .eq('awb_number', awb)
            .single();

        if (error) return null;
        return mapShipment(data);
    }

    async create(_data: Shipment): Promise<Shipment> {
        // This requires complex mapping back to DB structure (finding UUIDs for hubs etc)
        // For now, implementing simplistic version or throwing
        throw new Error("Create Shipment via Repository not fully implemented - requires relational lookups");
    }

    async updateStatus(id: string, status: ShipmentStatus, description: string, _hubId?: HubLocation): Promise<void> {
        const { error } = await (supabase
            .from('shipments') as any)
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        // Also log event
        await supabase.from('tracking_events').insert({
            shipment_id: id,
            event_code: status,
            source: 'MANUAL',
            description
        } as any);
    }
}

class SupabaseManifestRepository implements ManifestRepository {
    async getAll(): Promise<Manifest[]> {
        throw new Error("Not implemented");
    }
    async getByRef(_ref: string): Promise<Manifest | null> {
        throw new Error("Not implemented");
    }
    async create(_data: Manifest): Promise<Manifest> {
        throw new Error("Not implemented");
    }
    async updateStatus(_id: string, _status: 'DEPARTED' | 'ARRIVED'): Promise<void> {
        throw new Error("Not implemented");
    }
    async addShipment(_manifestId: string, _shipmentId: string): Promise<void> {
        throw new Error("Not implemented");
    }
}

class SupabaseUserRepository implements UserRepository {
    async getAll(): Promise<User[]> {
        const { data, error } = await supabase
            .from('staff')
            .select(`*, hub:hubs(code, name)`)
            .order('full_name');

        if (error) throw error;
        return (data || []).map(mapUser);
    }

    async create(_data: User): Promise<User> {
        throw new Error("Not implemented");
    }

    async updateStatus(id: string, active: boolean): Promise<void> {
        const { error } = await (supabase
            .from('staff') as any)
            .update({ is_active: active })
            .eq('id', id);
        if (error) throw error;
    }
}

// Minimal/Empty implementations for others to satisfy interface
class NotImplementedRepository {
    async getAll(): Promise<any[]> { return []; }
    async create(_data: any): Promise<any> { throw new Error("Not implemented"); }
    async updateStatus(_id: string, _status: any): Promise<void> { }
    async resolve(_id: string, _notes: string): Promise<void> { }
    async getByShipmentId(_id: string): Promise<any[]> { return []; }
    async log(_action: string, _entityType: string, _entityId: string, _payload?: any): Promise<void> { }
}

export const supabaseRepository: DataAccessLayer = {
    shipments: new SupabaseShipmentRepository(),
    manifests: new SupabaseManifestRepository(),
    invoices: new NotImplementedRepository() as any,
    exceptions: new NotImplementedRepository() as any,
    users: new SupabaseUserRepository(),
    customers: new NotImplementedRepository() as any,
    events: new NotImplementedRepository() as any,
    audit: new NotImplementedRepository() as any
};
