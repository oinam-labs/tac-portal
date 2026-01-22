/**
 * Domain Type System
 * Centralized type definitions with branded types for type safety
 */

// ============================================================================
// BRANDED TYPES (Prevent accidental mixing of similar string types)
// ============================================================================

declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

export type AWB = Brand<string, 'AWB'>;
export type UUID = Brand<string, 'UUID'>;
export type ManifestNumber = Brand<string, 'ManifestNumber'>;
export type InvoiceNumber = Brand<string, 'InvoiceNumber'>;

// Type guards
export const isAWB = (value: string): value is AWB => /^TAC\d{8}$/.test(value);
export const isUUID = (value: string): value is UUID =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// ============================================================================
// ENUMS
// ============================================================================

export enum HubCode {
    IMPHAL = 'IMPHAL',
    NEW_DELHI = 'NEW_DELHI',
}

export enum ShipmentStatus {
    CREATED = 'CREATED',
    PICKED_UP = 'PICKED_UP',
    RECEIVED_AT_ORIGIN_HUB = 'RECEIVED_AT_ORIGIN_HUB',
    LOADED_FOR_LINEHAUL = 'LOADED_FOR_LINEHAUL',
    IN_TRANSIT_TO_DESTINATION = 'IN_TRANSIT_TO_DESTINATION',
    RECEIVED_AT_DEST_HUB = 'RECEIVED_AT_DEST_HUB',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    EXCEPTION_RAISED = 'EXCEPTION_RAISED',
    EXCEPTION_RESOLVED = 'EXCEPTION_RESOLVED',
    CANCELLED = 'CANCELLED',
}

export enum ManifestStatus {
    DRAFT = 'DRAFT',
    BUILDING = 'BUILDING',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    DEPARTED = 'DEPARTED',
    ARRIVED = 'ARRIVED',
    RECONCILED = 'RECONCILED',
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    ISSUED = 'ISSUED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    OVERDUE = 'OVERDUE',
}

export enum ExceptionType {
    DAMAGED = 'DAMAGED',
    LOST = 'LOST',
    DELAYED = 'DELAYED',
    MISMATCH = 'MISMATCH',
    PAYMENT_HOLD = 'PAYMENT_HOLD',
    MISROUTED = 'MISROUTED',
    ADDRESS_ISSUE = 'ADDRESS_ISSUE',
    MISSING_PACKAGE = 'MISSING_PACKAGE',
    WRONG_HUB = 'WRONG_HUB',
    ROUTE_MISMATCH = 'ROUTE_MISMATCH',
    INVOICE_DISPUTE = 'INVOICE_DISPUTE',
}

export enum ExceptionSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum ExceptionStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    WAREHOUSE_IMPHAL = 'WAREHOUSE_IMPHAL',
    WAREHOUSE_DELHI = 'WAREHOUSE_DELHI',
    OPS = 'OPS',
    INVOICE = 'INVOICE',
    SUPPORT = 'SUPPORT',
}

export enum TransportMode {
    AIR = 'AIR',
    TRUCK = 'TRUCK',
}

export enum ServiceLevel {
    STANDARD = 'STANDARD',
    EXPRESS = 'EXPRESS',
    PRIORITY = 'PRIORITY',
}

export enum PaymentMode {
    PAID = 'PAID',
    TO_PAY = 'TO_PAY',
    TBB = 'TBB', // To Be Billed
}

export enum ScanSource {
    CAMERA = 'CAMERA',
    MANUAL = 'MANUAL',
    BARCODE_SCANNER = 'BARCODE_SCANNER',
}

export enum TrackingEventSource {
    SCAN = 'SCAN',
    MANUAL = 'MANUAL',
    SYSTEM = 'SYSTEM',
    API = 'API',
}

// ============================================================================
// STATUS TRANSITION RULES
// ============================================================================

export const SHIPMENT_STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
    [ShipmentStatus.CREATED]: [
        ShipmentStatus.PICKED_UP,
        ShipmentStatus.RECEIVED_AT_ORIGIN_HUB,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.PICKED_UP]: [
        ShipmentStatus.RECEIVED_AT_ORIGIN_HUB,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.RECEIVED_AT_ORIGIN_HUB]: [
        ShipmentStatus.LOADED_FOR_LINEHAUL,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.LOADED_FOR_LINEHAUL]: [
        ShipmentStatus.IN_TRANSIT_TO_DESTINATION,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.IN_TRANSIT_TO_DESTINATION]: [
        ShipmentStatus.RECEIVED_AT_DEST_HUB,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.RECEIVED_AT_DEST_HUB]: [
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.OUT_FOR_DELIVERY]: [
        ShipmentStatus.DELIVERED,
        ShipmentStatus.EXCEPTION_RAISED,
    ],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.EXCEPTION_RAISED]: [
        ShipmentStatus.EXCEPTION_RESOLVED,
        ShipmentStatus.CANCELLED,
    ],
    [ShipmentStatus.EXCEPTION_RESOLVED]: [
        ShipmentStatus.RECEIVED_AT_ORIGIN_HUB,
        ShipmentStatus.RECEIVED_AT_DEST_HUB,
        ShipmentStatus.OUT_FOR_DELIVERY,
    ],
    [ShipmentStatus.CANCELLED]: [],
};

export const isValidShipmentTransition = (
    from: ShipmentStatus,
    to: ShipmentStatus
): boolean => {
    return SHIPMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};

export const MANIFEST_STATUS_TRANSITIONS: Record<ManifestStatus, ManifestStatus[]> = {
    [ManifestStatus.DRAFT]: [ManifestStatus.BUILDING, ManifestStatus.OPEN, ManifestStatus.CLOSED],
    [ManifestStatus.BUILDING]: [ManifestStatus.OPEN, ManifestStatus.CLOSED],
    [ManifestStatus.OPEN]: [ManifestStatus.BUILDING, ManifestStatus.CLOSED],
    [ManifestStatus.CLOSED]: [ManifestStatus.DEPARTED],
    [ManifestStatus.DEPARTED]: [ManifestStatus.ARRIVED],
    [ManifestStatus.ARRIVED]: [ManifestStatus.RECONCILED],
    [ManifestStatus.RECONCILED]: [],
};

export const isValidManifestTransition = (
    from: ManifestStatus,
    to: ManifestStatus
): boolean => {
    return MANIFEST_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};

// ============================================================================
// ROLE PERMISSIONS
// ============================================================================

export const ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: {
        modules: ['*'] as string[],
        canViewFinance: true,
        canEditManifests: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canResolveExceptions: true,
    },
    [UserRole.MANAGER]: {
        modules: ['*'] as string[],
        canViewFinance: true,
        canEditManifests: true,
        canManageUsers: true,
        canViewAuditLogs: true,
        canResolveExceptions: true,
    },
    [UserRole.WAREHOUSE_IMPHAL]: {
        modules: ['scanning', 'inventory', 'shipments', 'exceptions'] as string[],
        canViewFinance: false,
        canEditManifests: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canResolveExceptions: false,
        hubRestriction: HubCode.IMPHAL,
    },
    [UserRole.WAREHOUSE_DELHI]: {
        modules: ['scanning', 'inventory', 'shipments', 'exceptions'] as string[],
        canViewFinance: false,
        canEditManifests: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canResolveExceptions: false,
        hubRestriction: HubCode.NEW_DELHI,
    },
    [UserRole.OPS]: {
        modules: ['shipments', 'manifests', 'tracking', 'customers', 'exceptions'] as string[],
        canViewFinance: false,
        canEditManifests: true,
        canManageUsers: false,
        canViewAuditLogs: false,
        canResolveExceptions: true,
    },
    [UserRole.INVOICE]: {
        modules: ['finance', 'customers', 'shipments'] as string[],
        canViewFinance: true,
        canEditManifests: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canResolveExceptions: false,
    },
    [UserRole.SUPPORT]: {
        modules: ['shipments', 'tracking', 'customers'] as string[],
        canViewFinance: false,
        canEditManifests: false,
        canManageUsers: false,
        canViewAuditLogs: false,
        canResolveExceptions: false,
        readOnly: true,
    },
} as const;

export const hasPermission = (
    role: UserRole,
    permission: keyof typeof ROLE_PERMISSIONS[UserRole.ADMIN]
): boolean => {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (!rolePerms) return false;

    return (rolePerms as Record<string, unknown>)[permission] === true || rolePerms.modules?.includes('*');
};

export const canAccessModule = (role: UserRole, module: string): boolean => {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (!rolePerms) return false;

    return rolePerms.modules.includes('*') || rolePerms.modules.includes(module);
};

// ============================================================================
// DOMAIN INTERFACES
// ============================================================================

export interface Weight {
    dead: number;
    volumetric: number;
    chargeable: number;
}

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
}

export interface ContactInfo {
    name: string;
    phone: string;
    email?: string;
    address: Address;
    gstin?: string;
}

export interface TaxBreakdown {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
}

export interface Financials {
    ratePerKg: number;
    baseFreight: number;
    docketCharge: number;
    pickupCharge: number;
    packingCharge: number;
    fuelSurcharge: number;
    handlingFee: number;
    insurance: number;
    tax: TaxBreakdown;
    discount: number;
    totalAmount: number;
    advancePaid: number;
    balance: number;
}

// ============================================================================
// SCAN PAYLOAD TYPES
// ============================================================================

export interface ScanPayload {
    v: number; // version
    type: 'shipment' | 'manifest' | 'package';
    awb?: AWB;
    manifestId?: UUID;
    packageId?: UUID;
    metadata?: Record<string, unknown>;
}

export interface ScanEvent {
    id: string;
    type: 'shipment' | 'manifest';
    code: string; // AWB or Manifest Number
    timestamp: string;
    source: ScanSource;
    hubCode: HubCode;
    staffId: UUID;
    synced: boolean;
    syncedAt?: string;
    error?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const parseAWB = (input: string): AWB | null => {
    // Try raw AWB
    if (isAWB(input)) return input as AWB;

    // Try JSON payload
    try {
        const payload: ScanPayload = JSON.parse(input);
        if (payload.awb && isAWB(payload.awb)) {
            return payload.awb;
        }
    } catch {
        // Not JSON, continue
    }

    return null;
};

export const formatAWB = (awb: AWB | string): string => {
    return awb.replace(/^TAC/, 'TAC-');
};

export const generateAWB = (): AWB => {
    const random = Math.floor(10000000 + Math.random() * 90000000);
    return `TAC${random}` as AWB;
};
