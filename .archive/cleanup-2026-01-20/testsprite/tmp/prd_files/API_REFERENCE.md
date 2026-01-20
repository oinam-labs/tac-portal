# TAC Cargo API Reference

Complete reference for all types, interfaces, stores, and utility functions in the TAC Cargo Enterprise Portal.

---

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [Stores API](#stores-api)
3. [Mock Database API](#mock-database-api)
4. [Utility Functions](#utility-functions)
5. [Constants](#constants)

---

## Type Definitions

### Enums & Type Aliases

#### HubLocation

```typescript
type HubLocation = 'IMPHAL' | 'NEW_DELHI';
```

#### ShipmentMode

```typescript
type ShipmentMode = 'AIR' | 'TRUCK';
```

#### ServiceLevel

```typescript
type ServiceLevel = 'STANDARD' | 'EXPRESS';
```

#### PaymentMode

```typescript
type PaymentMode = 'PAID' | 'TO_PAY' | 'TBB';
```

#### ShipmentStatus

```typescript
type ShipmentStatus = 
    | 'CREATED'
    | 'PICKED_UP'
    | 'RECEIVED_AT_ORIGIN_HUB'
    | 'LOADED_FOR_LINEHAUL'
    | 'IN_TRANSIT_TO_DESTINATION'
    | 'RECEIVED_AT_DEST_HUB'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELLED'
    | 'DAMAGED'
    | 'EXCEPTION_RAISED'
    | 'EXCEPTION_RESOLVED';
```

#### ManifestStatus

```typescript
type ManifestStatus = 'OPEN' | 'CLOSED' | 'DEPARTED' | 'ARRIVED';
```

#### InvoiceStatus

```typescript
type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'OVERDUE';
```

#### ExceptionType

```typescript
type ExceptionType = 'DAMAGED' | 'LOST' | 'DELAYED' | 'OVERWEIGHT' | 'MISROUTED' | 'CUSTOMS';
```

#### ExceptionSeverity

```typescript
type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

#### UserRole

```typescript
type UserRole = 'ADMIN' | 'MANAGER' | 'WAREHOUSE_STAFF' | 'OPS_STAFF' | 'FINANCE_STAFF';
```

#### NavItem

```typescript
enum NavItem {
    DASHBOARD = 'Dashboard',
    ANALYTICS = 'Analytics',
    SHIPMENTS = 'Shipments',
    TRACKING = 'Tracking',
    MANIFESTS = 'Manifests',
    SCANNING = 'Scanning',
    INVENTORY = 'Inventory',
    EXCEPTIONS = 'Exceptions',
    FINANCE = 'Finance', 
    INVOICES = 'Invoices',
    CUSTOMERS = 'Customers',
    MANAGEMENT = 'Management',
    SETTINGS = 'Settings'
}
```

---

### Interfaces

#### Address

```typescript
interface Address {
    line1: string;
    city: string;
    state: string;
    zip: string;
}
```

#### Hub

```typescript
interface Hub {
    id: HubLocation;
    name: string;
    code: string;
    address: string;
    sortCode: string;
}
```

#### Customer

```typescript
interface Customer {
    id: string;
    type: 'INDIVIDUAL' | 'BUSINESS';
    name: string;
    companyName?: string;
    phone: string;
    email: string;
    address: string;
    addressDetails?: Address;
    gstin?: string;
    tier: 'STANDARD' | 'PRIORITY' | 'ENTERPRISE';
    createdAt: string;
    activeContracts?: number;
    contactPerson?: string;
}
```

#### Package

```typescript
interface Package {
    id: string;
    shipmentId: string;
    packageIndex: number;
    weight: {
        dead: number;
        volumetric: number;
        chargeable: number;
    };
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    currentHubId: HubLocation;
    binLocation?: string;
    status: ShipmentStatus;
    description?: string;
}
```

#### Shipment

```typescript
interface Shipment {
    id: string;
    awb: string;
    customerId: string;
    customerName: string;
    originHub: HubLocation;
    destinationHub: HubLocation;
    mode: ShipmentMode;
    serviceLevel: ServiceLevel;
    totalPackageCount: number;
    totalWeight: {
        dead: number;
        volumetric: number;
        chargeable: number;
    };
    status: ShipmentStatus;
    invoiceId?: string;
    manifestId?: string;
    createdAt: string;
    updatedAt: string;
    eta: string;
    lastUpdate?: string;
    consignor?: {
        name: string;
        phone: string;
        address: string;
        gstin?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
    consignee?: {
        name: string;
        phone: string;
        address: string;
        gstin?: string;
        city?: string;
        state?: string;
        zip?: string;
    };
    contentsDescription?: string;
    declaredValue?: number;
    bookingDate?: string;
    paymentMode?: PaymentMode;
}
```

#### TrackingEvent

```typescript
interface TrackingEvent {
    id: string;
    shipmentId: string;
    awb: string;
    eventCode: ShipmentStatus;
    hubId?: HubLocation;
    description: string;
    timestamp: string;
    actorId: string;
    meta?: Record<string, any>;
}
```

#### Manifest

```typescript
interface Manifest {
    id: string;
    reference: string;
    type: ShipmentMode;
    originHub: HubLocation;
    destinationHub: HubLocation;
    status: ManifestStatus;
    vehicleMeta: {
        vehicleId?: string;
        driverName?: string;
        driverPhone?: string;
        flightNumber?: string;
        carrier?: string;
    };
    shipmentIds: string[];
    shipmentCount: number;
    totalWeight: number;
    createdBy: string;
    createdAt: string;
    departedAt?: string;
    arrivedAt?: string;
}
```

#### Invoice

```typescript
interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    shipmentId: string;
    awb: string;
    status: InvoiceStatus;
    paymentMode: PaymentMode;
    financials: {
        ratePerKg: number;
        baseFreight: number;
        docketCharge: number;
        pickupCharge: number;
        packingCharge: number;
        fuelSurcharge: number;
        handlingFee: number;
        insurance: number;
        tax: {
            cgst: number;
            sgst: number;
            igst: number;
            total: number;
        };
        discount: number;
        totalAmount: number;
        advancePaid: number;
        balance: number;
    };
    dueDate: string;
    paidAt?: string;
    pdfUrl?: string;
    createdAt: string;
}
```

#### Exception

```typescript
interface Exception {
    id: string;
    shipmentId: string;
    awb: string;
    type: ExceptionType;
    severity: ExceptionSeverity;
    description: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    reportedAt: string;
    resolvedAt?: string;
    assignedTo?: string;
}
```

#### User

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    assignedHub?: HubLocation;
    active: boolean;
    lastLogin: string;
}
```

#### AuditLog

```typescript
interface AuditLog {
    id: string;
    actorId: string;
    action: string;
    entityType: 'SHIPMENT' | 'MANIFEST' | 'INVOICE' | 'USER' | 'CUSTOMER';
    entityId: string;
    timestamp: string;
    payload?: any;
}
```

---

## Stores API

### Main App Store (`store/index.ts`)

```typescript
interface AppState {
    user: User | null;
    currentNav: NavItem;
    sidebarCollapsed: boolean;
    isAuthenticated: boolean;
    theme: 'dark' | 'light';
    
    login: (user: User) => void;
    logout: () => void;
    setNav: (nav: NavItem) => void;
    toggleSidebar: () => void;
    toggleTheme: () => void;
}
```

**Usage:**
```typescript
import { useStore } from './store';

const { user, isAuthenticated, login, logout } = useStore();
```

---

### Shipment Store (`store/shipmentStore.ts`)

```typescript
interface ShipmentState {
    shipments: Shipment[];
    customers: Customer[];
    currentShipmentEvents: TrackingEvent[];
    isLoading: boolean;
    
    fetchShipments: () => void;
    fetchCustomers: () => void;
    fetchShipmentEvents: (shipmentId: string) => void;
    createShipment: (data: Partial<Shipment>, packages: Package[]) => Promise<void>;
    addCustomer: (customer: Partial<Customer>) => Promise<void>;
}
```

**Usage:**
```typescript
import { useShipmentStore } from './store/shipmentStore';

const { shipments, fetchShipments, createShipment } = useShipmentStore();
```

---

### Manifest Store (`store/manifestStore.ts`)

```typescript
interface ManifestState {
    manifests: Manifest[];
    availableShipments: Shipment[];
    isLoading: boolean;
    
    fetchManifests: () => void;
    fetchAvailableShipments: (origin: string, dest: string) => void;
    createManifest: (data: Partial<Manifest>) => Promise<void>;
    addShipmentsToManifest: (manifestId: string, shipmentIds: string[]) => Promise<void>;
    updateManifestStatus: (manifestId: string, status: 'DEPARTED' | 'ARRIVED') => Promise<void>;
}
```

---

### Invoice Store (`store/invoiceStore.ts`)

```typescript
interface InvoiceState {
    invoices: Invoice[];
    isLoading: boolean;
    
    fetchInvoices: () => void;
    createInvoice: (data: Partial<Invoice>) => Promise<void>;
    updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
}
```

---

### Exception Store (`store/exceptionStore.ts`)

```typescript
interface ExceptionState {
    exceptions: Exception[];
    isLoading: boolean;
    
    fetchExceptions: () => void;
    raiseException: (data: Partial<Exception>) => Promise<void>;
    resolveException: (id: string, note: string) => Promise<void>;
}
```

---

### Management Store (`store/managementStore.ts`)

```typescript
interface ManagementState {
    users: User[];
    isLoading: boolean;
    
    fetchUsers: () => void;
    addUser: (user: Partial<User>) => Promise<void>;
    toggleUserStatus: (id: string, currentStatus: boolean) => Promise<void>;
}
```

---

### Audit Store (`store/auditStore.ts`)

```typescript
interface AuditState {
    logs: AuditLog[];
    isLoading: boolean;
    
    fetchLogs: () => void;
}
```

---

## Mock Database API

Located in `lib/mock-db.ts`. The `db` object is a singleton instance of `MockDB`.

### Shipment Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getShipments()` | - | `Shipment[]` | Get all shipments |
| `getShipmentByAWB(awb)` | `string` | `Shipment \| undefined` | Find shipment by AWB |
| `addShipment(shipment)` | `Shipment` | `Shipment` | Add new shipment (auto-creates invoice) |
| `updateShipmentStatus(id, status, desc, hubId?)` | `string, ShipmentStatus, string, HubLocation?` | `void` | Update shipment status |

### Manifest Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getManifests()` | - | `Manifest[]` | Get all manifests |
| `getManifestByRef(ref)` | `string` | `Manifest \| undefined` | Find manifest by reference |
| `addManifest(manifest)` | `Manifest` | `Manifest` | Add new manifest |
| `addShipmentToManifest(manifestId, shipmentId)` | `string, string` | `void` | Add shipment to manifest |
| `updateManifestStatus(id, status)` | `string, 'DEPARTED' \| 'ARRIVED'` | `void` | Update manifest status |

### Invoice Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getInvoices()` | - | `Invoice[]` | Get all invoices |
| `addInvoice(invoice)` | `Invoice` | `Invoice` | Add new invoice |
| `updateInvoiceStatus(id, status)` | `string, InvoiceStatus` | `void` | Update invoice status |

### Exception Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getExceptions()` | - | `Exception[]` | Get all exceptions |
| `addException(exception)` | `Exception` | `Exception` | Add new exception |
| `resolveException(id, note)` | `string, string` | `void` | Resolve exception |

### User & Customer Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getUsers()` | - | `User[]` | Get all users |
| `addUser(user)` | `User` | `User` | Add new user |
| `updateUserStatus(id, active)` | `string, boolean` | `void` | Enable/disable user |
| `getCustomers()` | - | `Customer[]` | Get all customers |
| `addCustomer(customer)` | `Customer` | `Customer` | Add new customer |

### Event Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getEvents(shipmentId)` | `string` | `TrackingEvent[]` | Get tracking events for shipment |
| `addEvent(event)` | `TrackingEvent` | `TrackingEvent` | Add tracking event |

### Utility Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `generateAWB()` | - | `string` | Generate unique AWB (TAC + 8 digits) |
| `getAuditLogs()` | - | `AuditLog[]` | Get all audit logs |

---

## Utility Functions

### `lib/utils.ts`

#### cn(...inputs)

Merge Tailwind CSS classes with conflict resolution.

```typescript
import { cn } from './lib/utils';

cn('px-4 py-2', isActive && 'bg-blue-500', 'text-white');
// Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
```

#### formatCurrency(amount)

Format number as Indian Rupees.

```typescript
formatCurrency(1500);    // "₹1,500.00"
formatCurrency(99999);   // "₹99,999.00"
```

#### formatDate(dateString)

Format ISO date string to readable format.

```typescript
formatDate('2024-01-15T10:30:00Z');
// "15 Jan 2024, 10:30"
```

#### calculateFreight(weight, mode, service)

Calculate shipping charges.

```typescript
const charges = calculateFreight(10, 'AIR', 'EXPRESS');

// Returns:
{
    ratePerKg: 180,        // AIR base (120) * EXPRESS multiplier (1.5)
    baseFreight: 1800,
    fuelSurcharge: 180,    // 10%
    handlingFee: 50,
    insurance: 36,         // 2%
    docketCharge: 80,
    pickupCharge: 100,
    packingCharge: 50,
    tax: { cgst: 0, sgst: 0, igst: 413, total: 413 },
    discount: 0,
    totalAmount: 2709,
    advancePaid: 0,
    balance: 2709
}
```

#### isValidTransition(current, next)

Check if shipment status transition is valid.

```typescript
isValidTransition('PICKED_UP', 'RECEIVED_AT_ORIGIN_HUB');  // true
isValidTransition('DELIVERED', 'IN_TRANSIT');              // false
isValidTransition('CREATED', 'EXCEPTION_RAISED');          // true (always allowed)
```

---

### `lib/pdf-generator.ts`

#### generateShipmentLabel(shipment)

Generate a 4x6 inch shipping label PDF.

```typescript
const pdfUrl = await generateShipmentLabel(shipment);
window.open(pdfUrl, '_blank');
```

#### generateEnterpriseInvoice(invoice)

Generate an A4 enterprise invoice PDF.

```typescript
const pdfUrl = await generateEnterpriseInvoice(invoice);
window.open(pdfUrl, '_blank');
```

---

### `lib/logger.ts`

```typescript
import { logger } from './lib/logger';

logger.info('Operation completed', { id: '123' });
logger.warn('Low inventory', { sku: 'ABC' });
logger.error('Failed to process', error);
logger.debug('Debug data', data);

// Get all logs
const allLogs = logger.getLogs();
```

---

## Constants

### `lib/constants.ts`

#### HUBS

```typescript
const HUBS: Record<HubLocation, Hub> = {
    'IMPHAL': {
        id: 'IMPHAL',
        name: 'Imphal Hub',
        code: 'IMF',
        address: 'Tulihal Airport Road, Imphal, Manipur 795001',
        sortCode: 'SUR'
    },
    'NEW_DELHI': {
        id: 'NEW_DELHI',
        name: 'New Delhi Hub',
        code: 'DEL',
        address: 'Cargo Terminal 3, IGI Airport, New Delhi 110037',
        sortCode: 'GAUA'
    }
};
```

#### SHIPMENT_MODES

```typescript
const SHIPMENT_MODES = [
    { id: 'AIR', label: 'Air Cargo' },
    { id: 'TRUCK', label: 'Truck Linehaul' }
];
```

#### SERVICE_LEVELS

```typescript
const SERVICE_LEVELS = [
    { id: 'STANDARD', label: 'Standard (3-5 Days)' },
    { id: 'EXPRESS', label: 'Express (1-2 Days)' }
];
```

#### PAYMENT_MODES

```typescript
const PAYMENT_MODES = [
    { id: 'PAID', label: 'Paid (Prepaid)' },
    { id: 'TO_PAY', label: 'To Pay (Collect)' },
    { id: 'TBB', label: 'TBB (To Be Billed)' }
];
```

#### INDIAN_STATES

Array of 36 Indian states and union territories.

#### POPULAR_CITIES

Array of 23 commonly used cities.

#### CONTENT_TYPES

```typescript
const CONTENT_TYPES = [
    "Personal Effects",
    "Documents",
    "Electronics",
    "Clothing/Garments",
    "Auto Parts",
    "Medicines/Pharma",
    "Perishables (Dry)",
    "Household Goods",
    "Books/Stationery",
    "Handicrafts",
    "Machinery Parts",
    "Sports Goods"
];
```

---

### `lib/design-tokens.ts`

#### STATUS_COLORS

Tailwind class mappings for each shipment status:

```typescript
const STATUS_COLORS: Partial<Record<ShipmentStatus, string>> = {
    'CREATED': 'text-slate-500 border-slate-500/30 bg-slate-500/10',
    'IN_TRANSIT_TO_DESTINATION': 'text-cyber-neon border-cyber-neon/30 bg-cyber-neon/10',
    'DELIVERED': 'text-cyber-success border-cyber-success/30 bg-cyber-success/10',
    'EXCEPTION_RAISED': 'text-cyber-danger border-cyber-danger/30 bg-cyber-danger/10',
    // ... more statuses
};
```

#### CHART_COLORS

```typescript
const CHART_COLORS = {
    primary: '#22d3ee',
    secondary: '#c084fc',
    success: '#10b981',
    danger: '#ef4444',
    background: 'transparent',
    grid: 'rgba(34, 211, 238, 0.1)'
};
```

#### ANIMATION_VARIANTS

Framer Motion animation presets:

```typescript
const ANIMATION_VARIANTS = {
    fadeIn: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    slideIn: {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
    }
};
```

---

*Last updated: January 2026*
