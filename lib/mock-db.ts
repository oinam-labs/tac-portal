
import { Shipment, Customer, HubLocation, ShipmentStatus, Package, TrackingEvent, Manifest, Exception, Invoice, User, UserRole, AuditLog, InvoiceStatus } from '../types';
import { calculateFreight } from './utils';

// Simple ID Generator
const genId = (prefix: string) => `${prefix}-${Math.floor(Math.random() * 100000)}`;

// Mock Customers
export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: 'C-001',
        companyName: 'Globex Corp',
        name: 'Hank Scorpio',
        email: 'hank@globex.com',
        phone: '555-0101',
        type: 'BUSINESS',
        tier: 'ENTERPRISE',
        address: '123 Tech Park',
        gstin: '07AABCU9603R1Z2',
        createdAt: '2023-01-01',
        activeContracts: 5,
        preferences: {
            preferredTransportMode: 'AIR',
            preferredPaymentMode: 'TO_PAY',
            gstApplicable: true,
            typicalContents: 'Electronics Parts'
        },
        lastInvoiceAt: '2024-01-15T10:00:00Z',
        invoiceCount: 45,
        avgInvoiceValue: 1500
    },
    {
        id: 'C-002',
        companyName: 'Acme Logistics',
        name: 'Wile E.',
        email: 'wile@acme.com',
        phone: '555-0102',
        type: 'BUSINESS',
        tier: 'STANDARD',
        address: '456 Desert Rd',
        gstin: '29ABCDE1234F1Z5',
        createdAt: '2023-02-15',
        activeContracts: 2,
        preferences: {
            preferredTransportMode: 'TRUCK',
            preferredPaymentMode: 'PAID',
            gstApplicable: true,
            typicalContents: 'Construction Material'
        },
        lastInvoiceAt: '2024-01-10T14:30:00Z',
        invoiceCount: 28,
        avgInvoiceValue: 2200
    },
    {
        id: 'C-003',
        name: 'John Doe',
        email: 'john@gmail.com',
        phone: '555-0103',
        type: 'INDIVIDUAL',
        tier: 'STANDARD',
        address: '789 Local St',
        createdAt: '2023-03-10',
        preferences: {
            preferredTransportMode: 'TRUCK',
            preferredPaymentMode: 'TO_PAY',
            gstApplicable: false,
            typicalContents: 'Personal Effects'
        },
        lastInvoiceAt: '2024-01-12T09:15:00Z',
        invoiceCount: 12,
        avgInvoiceValue: 800
    }
];

// Mock Shipments (Updated to consistent IDs)
export const INITIAL_SHIPMENTS: Shipment[] = [
    {
        id: 'SH-8821',
        awb: 'TAC882190',
        customerId: 'C-001',
        customerName: 'Globex Corp',
        originHub: 'IMPHAL',
        destinationHub: 'NEW_DELHI',
        mode: 'AIR',
        serviceLevel: 'EXPRESS',
        status: 'IN_TRANSIT_TO_DESTINATION',
        totalPackageCount: 1,
        totalWeight: { dead: 10, volumetric: 12, chargeable: 12 },
        eta: '2023-11-24',
        createdAt: '2023-11-20T10:00:00Z',
        updatedAt: '2023-11-20T10:00:00Z',
        lastUpdate: 'Departed Origin Hub',
        invoiceId: 'INV-2024-001',
        contentsDescription: 'ELECTRONICS PARTS'
    },
];

// Mock Invoices (Updated Financials)
export const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'INV-2024-001',
        invoiceNumber: 'INV-9921',
        customerId: 'C-001',
        customerName: 'Globex Corp',
        shipmentId: 'SH-8821',
        awb: 'TAC882190',
        status: 'ISSUED',
        paymentMode: 'TO_PAY',
        financials: {
            ratePerKg: 100,
            baseFreight: 1200,
            fuelSurcharge: 100,
            handlingFee: 50,
            insurance: 0,
            docketCharge: 80,
            pickupCharge: 0,
            packingCharge: 0,
            tax: { cgst: 0, sgst: 0, igst: 243, total: 243 },
            discount: 0,
            totalAmount: 1593,
            advancePaid: 0,
            balance: 1593
        },
        dueDate: '2023-12-20',
        createdAt: '2023-11-20T10:00:00Z'
    }
];

export const INITIAL_MANIFESTS: Manifest[] = [];
export const INITIAL_EXCEPTIONS: Exception[] = [];
export const INITIAL_USERS: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@taccargo.com', role: 'ADMIN', active: true, lastLogin: 'Just now' },
];

const DB_KEY = 'tac_cargo_db_v1';

class MockDB {
    private shipments: Shipment[] = [];
    private customers: Customer[] = [];
    private manifests: Manifest[] = [];
    private invoices: Invoice[] = [];
    private exceptions: Exception[] = [];
    private users: User[] = [];
    private events: TrackingEvent[] = [];
    private auditLogs: AuditLog[] = [];

    constructor() {
        this.load();
    }

    private load() {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            this.shipments = data.shipments || [...INITIAL_SHIPMENTS];
            this.customers = data.customers || [...INITIAL_CUSTOMERS];
            this.manifests = data.manifests || [...INITIAL_MANIFESTS];
            this.invoices = data.invoices || [...INITIAL_INVOICES];
            this.exceptions = data.exceptions || [...INITIAL_EXCEPTIONS];
            this.users = data.users || [...INITIAL_USERS];
            this.events = data.events || [];
            this.auditLogs = data.auditLogs || [];
        } else {
            // Initialize defaults
            this.shipments = [...INITIAL_SHIPMENTS];
            this.customers = [...INITIAL_CUSTOMERS];
            this.manifests = [...INITIAL_MANIFESTS];
            this.invoices = [...INITIAL_INVOICES];
            this.exceptions = [...INITIAL_EXCEPTIONS];
            this.users = [...INITIAL_USERS];
            this.save();
        }
    }

    private save() {
        const data = {
            shipments: this.shipments,
            customers: this.customers,
            manifests: this.manifests,
            invoices: this.invoices,
            exceptions: this.exceptions,
            users: this.users,
            events: this.events,
            auditLogs: this.auditLogs
        };
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // --- Audit Logs ---
    private log(action: string, entityType: AuditLog['entityType'], entityId: string, payload?: any) {
        const logEntry: AuditLog = {
            id: genId('LOG'),
            actorId: 'CURRENT_USER', // Mock actor
            action,
            entityType,
            entityId,
            timestamp: new Date().toISOString(),
            payload
        };
        this.auditLogs = [logEntry, ...this.auditLogs];
        this.save();
    }

    getAuditLogs() { return this.auditLogs; }

    // --- Shipments ---
    getShipments() { return this.shipments; }
    getShipmentByAWB(awb: string) { return this.shipments.find(s => s.awb === awb); }

    addShipment(shipment: Shipment) {
        // 1. Calculate Financials
        const financials = calculateFreight(
            shipment.totalWeight.chargeable,
            shipment.mode,
            shipment.serviceLevel
        );

        // 2. Create Invoice
        const invoice: Invoice = {
            id: genId('INV'),
            invoiceNumber: `INV-${Math.floor(Date.now() / 1000)}`,
            customerId: shipment.customerId,
            customerName: shipment.customerName,
            shipmentId: shipment.id,
            awb: shipment.awb,
            status: 'ISSUED',
            paymentMode: shipment.paymentMode || 'PAID',
            financials,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
            createdAt: new Date().toISOString()
        };
        this.invoices = [invoice, ...this.invoices];
        this.log('INVOICE_GENERATED', 'INVOICE', invoice.id, { amount: financials.totalAmount });

        // 3. Link Invoice to Shipment
        shipment.invoiceId = invoice.id;
        this.shipments = [shipment, ...this.shipments];

        // 4. Add Event
        this.addEvent({
            id: genId('EVT'),
            shipmentId: shipment.id,
            awb: shipment.awb,
            eventCode: 'CREATED',
            hubId: shipment.originHub,
            description: 'Shipment created and label generated',
            timestamp: new Date().toISOString(),
            actorId: 'SYSTEM'
        });

        this.log('SHIPMENT_CREATED', 'SHIPMENT', shipment.id, { awb: shipment.awb });
        this.save();
        return shipment;
    }

    updateShipmentStatus(id: string, status: ShipmentStatus, description: string, hubId?: HubLocation) {
        const shipment = this.shipments.find(s => s.id === id);
        if (shipment) {
            const oldStatus = shipment.status;
            shipment.status = status;
            shipment.lastUpdate = description;
            shipment.updatedAt = new Date().toISOString();

            this.addEvent({
                id: genId('EVT'),
                shipmentId: shipment.id,
                awb: shipment.awb,
                eventCode: status,
                hubId: hubId,
                description: description,
                timestamp: new Date().toISOString(),
                actorId: 'OPERATOR'
            });

            this.log('SHIPMENT_STATUS_UPDATE', 'SHIPMENT', shipment.id, { oldStatus, newStatus: status, description });
            this.save();
        }
    }

    // --- Manifests ---
    getManifests() { return this.manifests; }
    getManifestByRef(ref: string) { return this.manifests.find(m => m.reference === ref); }

    addManifest(manifest: Manifest) {
        this.manifests = [manifest, ...this.manifests];
        this.log('MANIFEST_CREATED', 'MANIFEST', manifest.id, { ref: manifest.reference });
        this.save();
        return manifest;
    }

    updateManifestStatus(id: string, status: 'DEPARTED' | 'ARRIVED') {
        const manifest = this.manifests.find(m => m.id === id);
        if (manifest) {
            manifest.status = status;
            const now = new Date().toISOString();
            if (status === 'DEPARTED') manifest.departedAt = now;
            if (status === 'ARRIVED') manifest.arrivedAt = now;

            // Update Shipments
            manifest.shipmentIds.forEach(sId => {
                const sStatus = status === 'DEPARTED' ? 'IN_TRANSIT_TO_DESTINATION' : 'RECEIVED_AT_DEST_HUB';
                const desc = status === 'DEPARTED' ? `Departed ${manifest.originHub}` : `Arrived at ${manifest.destinationHub}`;
                this.updateShipmentStatus(sId, sStatus, desc, status === 'DEPARTED' ? manifest.originHub : manifest.destinationHub);
            });
            this.log('MANIFEST_STATUS_UPDATE', 'MANIFEST', manifest.id, { status });
            this.save();
        }
    }

    addShipmentToManifest(manifestId: string, shipmentId: string) {
        const manifest = this.manifests.find(m => m.id === manifestId);
        const shipment = this.shipments.find(s => s.id === shipmentId);
        if (manifest && shipment) {
            if (manifest.status !== 'OPEN') throw new Error("Manifest closed");
            if (!manifest.shipmentIds.includes(shipmentId)) {
                manifest.shipmentIds.push(shipmentId);
                manifest.shipmentCount++;
                manifest.totalWeight += shipment.totalWeight.chargeable;
                shipment.manifestId = manifest.id;
                this.updateShipmentStatus(shipmentId, 'LOADED_FOR_LINEHAUL', `Added to Manifest ${manifest.reference}`, manifest.originHub);
                this.log('SHIPMENT_MANIFESTED', 'MANIFEST', manifest.id, { shipmentId });
                this.save();
            }
        }
    }

    // --- Exceptions ---
    getExceptions() { return this.exceptions; }

    addException(exception: Exception) {
        this.exceptions = [exception, ...this.exceptions];
        this.updateShipmentStatus(exception.shipmentId, 'EXCEPTION_RAISED', `Exception: ${exception.type}`);
        this.log('EXCEPTION_RAISED', 'SHIPMENT', exception.shipmentId, { type: exception.type });
        this.save();
        return exception;
    }

    resolveException(id: string, resolutionNote: string) {
        const exception = this.exceptions.find(e => e.id === id);
        if (exception) {
            exception.status = 'RESOLVED';
            exception.resolvedAt = new Date().toISOString();
            this.updateShipmentStatus(exception.shipmentId, 'EXCEPTION_RESOLVED', `Resolved: ${resolutionNote}`);
            this.log('EXCEPTION_RESOLVED', 'SHIPMENT', exception.shipmentId, { resolutionNote });
            this.save();
        }
    }

    // --- Invoices ---
    getInvoices() { return this.invoices; }

    addInvoice(invoice: Invoice) {
        this.invoices = [invoice, ...this.invoices];

        // Update linked shipment if exists
        let shipment = this.shipments.find(s => s.id === invoice.shipmentId);

        if (!shipment) {
            // Implicit Shipment Creation for Walk-In Invoices
            shipment = {
                id: invoice.shipmentId,
                awb: invoice.awb,
                customerId: invoice.customerId,
                customerName: invoice.customerName,
                originHub: 'NEW_DELHI', // Default
                destinationHub: 'IMPHAL', // Default
                mode: 'AIR',
                serviceLevel: 'STANDARD',
                totalPackageCount: 1,
                totalWeight: { dead: 1, volumetric: 1, chargeable: 1 },
                status: 'CREATED',
                paymentMode: invoice.paymentMode,
                invoiceId: invoice.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                eta: 'TBD',
                lastUpdate: 'Created via Invoice'
            };
            this.shipments = [shipment, ...this.shipments];
        } else {
            shipment.invoiceId = invoice.id;
            shipment.paymentMode = invoice.paymentMode;
        }

        this.log('INVOICE_CREATED', 'INVOICE', invoice.id, { amount: invoice.financials.totalAmount });
        this.save();
        return invoice;
    }

    updateInvoiceStatus(id: string, status: InvoiceStatus) {
        const inv = this.invoices.find(i => i.id === id);
        if (inv) {
            inv.status = status;
            if (status === 'PAID') inv.paidAt = new Date().toISOString();
            this.log('INVOICE_STATUS_UPDATE', 'INVOICE', id, { status });
            this.save();
        }
    }

    // --- Users & Customers & Events ---
    getUsers() { return this.users; }
    addUser(user: User) {
        this.users = [user, ...this.users];
        this.save();
        return user;
    }
    updateUserStatus(id: string, active: boolean) {
        const u = this.users.find(u => u.id === id);
        if (u) {
            u.active = active;
            this.save();
        }
    }
    getCustomers() { return this.customers; }
    addCustomer(customer: Customer) {
        this.customers = [customer, ...this.customers];
        this.save();
        return customer;
    }
    getEvents(shipmentId: string) {
        return this.events.filter(e => e.shipmentId === shipmentId).sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }
    addEvent(event: TrackingEvent) {
        this.events.push(event);
        this.save();
        return event;
    }
    generateAWB() { return `TAC${Math.floor(10000000 + Math.random() * 90000000)}`; }
}

export const db = new MockDB();
