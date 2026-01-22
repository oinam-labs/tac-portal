import { supabase } from '../supabase';
import {
    DataAccessLayer,
    ShipmentRepository,
    ManifestRepository,
    UserRepository,
    InvoiceRepository,
    ExceptionRepository,
    CustomerRepository,
    EventRepository,
    AuditRepository,
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

interface ShipmentRow {
    id: string;
    awb_number: string;
    customer_id: string;
    customer?: { name: string } | null;
    origin_hub?: { code: string } | null;
    destination_hub?: { code: string } | null;
    transport_mode?: string | null;
    service_level?: string | null;
    status: string;
    package_count?: number | null;
    total_weight?: number | null;
    created_at: string | null;
    updated_at: string | null;
    invoice_id?: string | null;
}

const mapShipment = (row: ShipmentRow): Shipment => ({
    id: row.id,
    awb: row.awb_number,
    customerId: row.customer_id,
    customerName: row.customer?.name || 'Unknown',
    originHub: (row.origin_hub?.code || 'IMPHAL') as HubLocation,
    destinationHub: (row.destination_hub?.code || 'NEW_DELHI') as HubLocation,
    mode: (row.transport_mode || 'AIR') as Shipment['mode'],
    serviceLevel: (row.service_level || 'STANDARD') as Shipment['serviceLevel'],
    status: row.status as Shipment['status'],
    totalPackageCount: row.package_count || 1,
    totalWeight: {
        dead: row.total_weight || 0,
        volumetric: 0,
        chargeable: row.total_weight || 0
    },
    eta: 'TBD',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    lastUpdate: 'Synced from DB',
    invoiceId: row.invoice_id ?? undefined,
    contentsDescription: 'General Cargo', // Not in DB currently
    paymentMode: 'PAID' // Default
});

interface StaffRow {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean | null;
    updated_at?: string | null;
    hub?: { code: string } | null;
}

const mapUser = (row: StaffRow): User => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role as User['role'],
    active: row.is_active ?? true,
    lastLogin: row.updated_at || 'Never',
    assignedHub: row.hub?.code as HubLocation | undefined,
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

    async updateStatus(id: string, status: ShipmentStatus, _description: string, _hubId?: HubLocation): Promise<void> {
        const { error } = await supabase
            .from('shipments')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        // Note: Tracking event creation is handled by the proper service layer
        // This repository method only updates status; event logging omitted here
        // to avoid type conflicts with the tracking_events table schema
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
        const { error } = await supabase
            .from('staff')
            .update({ is_active: active })
            .eq('id', id);
        if (error) throw error;
    }
}

// Minimal/Empty implementations for others to satisfy interface
class NotImplementedRepository {
    async getAll(): Promise<unknown[]> { return []; }
    async create(_data: unknown): Promise<unknown> { throw new Error("Not implemented"); }
    async updateStatus(_id: string, _status: unknown): Promise<void> { }
    async resolve(_id: string, _notes: string): Promise<void> { }
    async getByShipmentId(_id: string): Promise<unknown[]> { return []; }
    async log(_action: string, _entityType: string, _entityId: string, _payload?: Record<string, unknown>): Promise<void> { }
}

export const supabaseRepository: DataAccessLayer = {
    shipments: new SupabaseShipmentRepository(),
    manifests: new SupabaseManifestRepository(),
    invoices: new NotImplementedRepository() as unknown as InvoiceRepository,
    exceptions: new NotImplementedRepository() as unknown as ExceptionRepository,
    users: new SupabaseUserRepository(),
    customers: new NotImplementedRepository() as unknown as CustomerRepository,
    events: new NotImplementedRepository() as unknown as EventRepository,
    audit: new NotImplementedRepository() as unknown as AuditRepository
};
