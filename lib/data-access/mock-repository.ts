import { db } from '../mock-db';
import {
    DataAccessLayer,
    ShipmentRepository,
    ManifestRepository,
    InvoiceRepository,
    ExceptionRepository,
    UserRepository,
    CustomerRepository,
    EventRepository,
    AuditRepository
} from './index';
import {
    Shipment,
    Manifest,
    Invoice,
    Exception,
    User,
    Customer,
    TrackingEvent,
    ShipmentStatus,
    HubLocation,
    InvoiceStatus
} from '../../types';

class MockShipmentRepository implements ShipmentRepository {
    async getAll(): Promise<Shipment[]> {
        return db.getShipments();
    }
    async getByAWB(awb: string): Promise<Shipment | null> {
        return db.getShipmentByAWB(awb) || null;
    }
    async create(data: Shipment): Promise<Shipment> {
        return db.addShipment(data);
    }
    async updateStatus(id: string, status: ShipmentStatus, description: string, hubId?: HubLocation): Promise<void> {
        db.updateShipmentStatus(id, status, description, hubId);
    }
}

class MockManifestRepository implements ManifestRepository {
    async getAll(): Promise<Manifest[]> {
        return db.getManifests();
    }
    async getByRef(ref: string): Promise<Manifest | null> {
        return db.getManifestByRef(ref) || null;
    }
    async create(data: Manifest): Promise<Manifest> {
        return db.addManifest(data);
    }
    async updateStatus(id: string, status: 'DEPARTED' | 'ARRIVED'): Promise<void> {
        db.updateManifestStatus(id, status);
    }
    async addShipment(manifestId: string, shipmentId: string): Promise<void> {
        db.addShipmentToManifest(manifestId, shipmentId);
    }
}

class MockInvoiceRepository implements InvoiceRepository {
    async getAll(): Promise<Invoice[]> {
        return db.getInvoices();
    }
    async create(data: Invoice): Promise<Invoice> {
        return db.addInvoice(data);
    }
    async updateStatus(id: string, status: InvoiceStatus): Promise<void> {
        db.updateInvoiceStatus(id, status);
    }
}

class MockExceptionRepository implements ExceptionRepository {
    async getAll(): Promise<Exception[]> {
        return db.getExceptions();
    }
    async create(data: Exception): Promise<Exception> {
        return db.addException(data);
    }
    async resolve(id: string, notes: string): Promise<void> {
        db.resolveException(id, notes);
    }
}

class MockUserRepository implements UserRepository {
    async getAll(): Promise<User[]> {
        return db.getUsers();
    }
    async create(data: User): Promise<User> {
        return db.addUser(data);
    }
    async updateStatus(id: string, active: boolean): Promise<void> {
        db.updateUserStatus(id, active);
    }
}

class MockCustomerRepository implements CustomerRepository {
    async getAll(): Promise<Customer[]> {
        return db.getCustomers();
    }
    async create(data: Customer): Promise<Customer> {
        return db.addCustomer(data);
    }
}

class MockEventRepository implements EventRepository {
    async getByShipmentId(shipmentId: string): Promise<TrackingEvent[]> {
        return db.getEvents(shipmentId);
    }
    async create(data: TrackingEvent): Promise<TrackingEvent> {
        return db.addEvent(data);
    }
}

class MockAuditRepository implements AuditRepository {
    async getAll(): Promise<any[]> {
        return db.getAuditLogs();
    }
    async log(_action: string, _entityType: string, _entityId: string, _payload?: any): Promise<void> {
        // Mock DB logs automatically via its internal 'log' method when actions are taken
        // But if explicit logging is needed:
        // db.log(action, entityType as any, entityId, payload); 
        // Note: db.log is private/internal in mock-db usually, or we can expose it.
        // For now, we assume the actions themselves handle logging in MockDB
    }
}

export const mockRepository: DataAccessLayer = {
    shipments: new MockShipmentRepository(),
    manifests: new MockManifestRepository(),
    invoices: new MockInvoiceRepository(),
    exceptions: new MockExceptionRepository(),
    users: new MockUserRepository(),
    customers: new MockCustomerRepository(),
    events: new MockEventRepository(),
    audit: new MockAuditRepository()
};
