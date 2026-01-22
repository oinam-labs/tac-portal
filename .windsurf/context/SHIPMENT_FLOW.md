# Shipment Creation Flow — Architecture Documentation

> Last updated: 2026-01-22

## Overview

This document describes the complete shipment creation lifecycle from UI form submission through database operations, AWB generation, and tracking event creation.

---

## 1. Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHIPMENT CREATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  1. UI LAYER     │───▶│  2. HOOK LAYER   │───▶│  3. SERVICE LAYER│
│  CreateShipment  │    │  useCreateShipment│    │  shipmentService │
│  Form.tsx        │    │  useShipments.ts  │    │  .ts             │
└──────────────────┘    └──────────────────┘    └──────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Zod Validation   │    │ TanStack Query   │    │ Supabase Client  │
│ Form State       │    │ Cache Mgmt       │    │ RPC Calls        │
│ Volumetric Calc  │    │ Toast Feedback   │    │ Error Mapping    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                        │
                                ┌───────────────────────┘
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      4. DATABASE LAYER                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │
│  │ generate_awb_   │    │ shipments       │    │ tracking_     │ │
│  │ number() RPC    │    │ table INSERT    │    │ events INSERT │ │
│  └─────────────────┘    └─────────────────┘    └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Details

### 2.1 CreateShipmentForm (`components/shipments/CreateShipmentForm.tsx`)

**Responsibilities:**
- Render shipment creation form with validation
- Calculate volumetric weight
- Trigger mutation on submit

**Key Code:**
```typescript
// Form schema with Zod validation
const schema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    originHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    destinationHub: z.enum(['IMPHAL', 'NEW_DELHI']),
    mode: z.enum(['AIR', 'TRUCK']),
    serviceLevel: z.enum(['STANDARD', 'EXPRESS']),
    packageCount: z.number().min(1),
    weightDead: z.number().min(0.1),
    dimL: z.number().min(1),
    dimW: z.number().min(1),
    dimH: z.number().min(1),
}).refine(data => data.originHub !== data.destinationHub, {
    message: "Origin and Destination cannot be the same",
    path: ["destinationHub"]
});

// Volumetric weight calculation
const onSubmit = async (data: FormData) => {
    const divisor = data.mode === 'AIR' ? 5000 : 4000;
    const volWeight = (data.dimL * data.dimW * data.dimH) / divisor;
    const chargeable = Math.max(data.weightDead, volWeight);
    // ... mutation call
};
```

**Business Rules:**
| Rule | Implementation |
|------|----------------|
| Origin ≠ Destination | Zod `.refine()` validation |
| Volumetric divisor | AIR: 5000, TRUCK: 4000 |
| Chargeable weight | `max(dead_weight, volumetric_weight)` |

---

### 2.2 useCreateShipment Hook (`hooks/useShipments.ts`)

**Responsibilities:**
- Manage mutation state (loading, error, success)
- Call AWB generation RPC
- Insert shipment record
- Invalidate query cache
- Show toast notifications

**Key Code:**
```typescript
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipment: CreateShipmentInput) => {
      const orgId = await getOrCreateDefaultOrg();

      // AWB generation with fallback
      let awbNumber = `TAC${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      try {
        const { data: awbResult } = await supabase.rpc('generate_awb_number', { p_org_id: orgId });
        if (awbResult) awbNumber = awbResult as string;
      } catch (e) {
        console.warn('AWB generation function not available, using fallback');
      }

      // Insert with status CREATED
      const insertPayload = {
        ...shipment,
        org_id: orgId,
        awb_number: awbNumber,
        status: 'CREATED' as const,
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success(`Shipment ${data.awb_number} created successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to create shipment: ${error.message}`);
    },
  });
}
```

**Cache Invalidation:**
- Invalidates `['shipments']` query key on success
- Triggers refetch of shipment lists

---

### 2.3 shipmentService (`lib/services/shipmentService.ts`)

**Responsibilities:**
- Provide service-layer abstraction
- Handle AWB generation with fallback
- Wrap operations with Sentry tracking
- Map Supabase errors to app errors

**Key Code:**
```typescript
async create(shipment: Omit<ShipmentInsert, 'org_id'>): Promise<Shipment> {
    return trackApiCall('/shipments', 'POST', async () => {
        const orgId = orgService.getCurrentOrgId();

        // Generate AWB if not provided
        let awbNumber = shipment.awb_number;
        if (!awbNumber) {
            const { data: awbData } = await supabase.rpc('generate_awb_number', { p_org_id: orgId });
            awbNumber = awbData || `TAC${Date.now()}`;
        }

        const { data, error } = await supabase
            .from('shipments')
            .insert({
                ...shipment,
                org_id: orgId,
                awb_number: awbNumber,
            })
            .select()
            .single();

        if (error) throw mapSupabaseError(error);

        addBreadcrumb(`Shipment created: ${awbNumber}`, 'shipment', 'info');
        return data;
    });
}
```

**Observability:**
- `trackApiCall()` — Sentry performance monitoring
- `addBreadcrumb()` — Sentry audit trail
- `mapSupabaseError()` — User-friendly error messages

---

### 2.4 Database Layer

#### AWB Number Generation

**Format:** `TAC{YYYY}{NNNNNN}` (e.g., `TAC2026001234`)

**Generation Strategy:**
1. **Primary:** Call `generate_awb_number(p_org_id)` RPC function
2. **Fallback:** Client-side `TAC${Date.now()}` if RPC unavailable

> ⚠️ **Note:** The `generate_awb_number` function is NOT currently defined in migrations. The system uses client-side fallback.

**Uniqueness Constraint:**
```sql
CREATE UNIQUE INDEX shipments_org_awb_unique 
  ON shipments (org_id, awb_number) 
  WHERE deleted_at IS NULL;
```

#### Shipments Table Insert

**Required Fields:**
| Field | Source | Notes |
|-------|--------|-------|
| `org_id` | `getOrCreateDefaultOrg()` | From auth context |
| `awb_number` | Generated | Unique per org |
| `customer_id` | Form | UUID reference |
| `origin_hub_id` | Form | UUID from HUBS constant |
| `destination_hub_id` | Form | UUID from HUBS constant |
| `mode` | Form | 'AIR' \| 'TRUCK' |
| `service_level` | Form | 'STANDARD' \| 'EXPRESS' |
| `status` | Hardcoded | Always 'CREATED' |
| `package_count` | Form | >= 1 |
| `total_weight` | Calculated | Chargeable weight |
| `consignee_name` | Form | Required |
| `consignee_phone` | Form | Required |
| `consignee_address` | Form | JSON object |

---

## 3. Status Transition System

### Valid Transitions

```
CREATED ──▶ PICKUP_SCHEDULED ──▶ PICKED_UP ──▶ RECEIVED_AT_ORIGIN
                │                                      │
                ▼                                      ▼
           CANCELLED                              IN_TRANSIT
                                                       │
                                                       ▼
                                              RECEIVED_AT_DEST
                                                       │
                                                       ▼
                                              OUT_FOR_DELIVERY
                                                    │  │  │
                                    ┌───────────────┘  │  └───────────────┐
                                    ▼                  ▼                  ▼
                                DELIVERED             RTO            EXCEPTION
                               (terminal)              │                  │
                                                       ▼                  │
                                              RECEIVED_AT_ORIGIN ◀────────┘
```

### Validation Code

```typescript
// lib/schemas/shipment.schema.ts
export const VALID_STATUS_TRANSITIONS: Record<ShipmentStatusType, ShipmentStatusType[]> = {
    CREATED: ["PICKUP_SCHEDULED", "CANCELLED"],
    PICKUP_SCHEDULED: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["RECEIVED_AT_ORIGIN", "EXCEPTION"],
    RECEIVED_AT_ORIGIN: ["IN_TRANSIT", "EXCEPTION"],
    IN_TRANSIT: ["RECEIVED_AT_DEST", "EXCEPTION"],
    RECEIVED_AT_DEST: ["OUT_FOR_DELIVERY", "EXCEPTION"],
    OUT_FOR_DELIVERY: ["DELIVERED", "RTO", "EXCEPTION"],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
    RTO: ["RECEIVED_AT_ORIGIN"],
    EXCEPTION: ["RECEIVED_AT_ORIGIN", "RECEIVED_AT_DEST", "CANCELLED"],
};

export function isValidStatusTransition(
    currentStatus: ShipmentStatusType,
    newStatus: ShipmentStatusType
): boolean {
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
}
```

### Service Layer Enforcement

```typescript
// lib/services/shipmentService.ts
async updateStatus(id, status, meta) {
    // Fetch current status
    const { data: current } = await supabase
        .from('shipments')
        .select('status, awb_number')
        .eq('id', id)
        .single();

    // Validate transition
    if (!isValidStatusTransition(current.status, status)) {
        throw new ValidationError(
            `Invalid status transition from ${current.status} to ${status}`,
            { currentStatus: current.status, newStatus: status, shipmentId: id }
        );
    }

    // Update + create tracking event
    // ...
}
```

---

## 4. Tracking Events

Every status change creates a `tracking_events` record:

```typescript
await supabase.from('tracking_events').insert({
    org_id: orgId,
    shipment_id: id,
    awb_number: current.awb_number,
    event_code: status,
    hub_id: meta?.hubId,
    source: 'SYSTEM', // or 'MANUAL' from hook
    meta: {
        description: meta?.description,
        previous_status: currentStatus,
    },
});
```

**Audit Trail Fields:**
| Field | Description |
|-------|-------------|
| `event_code` | New status value |
| `source` | 'SYSTEM' (service) or 'MANUAL' (hook) |
| `meta.previous_status` | Old status for auditing |
| `hub_id` | Hub where event occurred (optional) |

---

## 5. Error Handling

### Error Flow

```
Supabase Error ──▶ mapSupabaseError() ──▶ AppError ──▶ UI Toast
```

### Error Types

| PostgreSQL Code | AppError Type | User Message |
|-----------------|---------------|--------------|
| `23505` | `ConflictError` | "A record with this identifier already exists" |
| `23503` | `ValidationError` | "Referenced record does not exist" |
| `23502` | `ValidationError` | "Required field is missing" |
| `42501` | `AuthorizationError` | "Insufficient database permissions" |
| `PGRST116` | `NotFoundError` | "Record not found" |

---

## 6. Related Files

| File | Purpose |
|------|---------|
| `components/shipments/CreateShipmentForm.tsx` | UI form component |
| `hooks/useShipments.ts` | TanStack Query hooks |
| `lib/services/shipmentService.ts` | Service layer |
| `lib/schemas/shipment.schema.ts` | Zod schemas + transitions |
| `lib/errors.ts` | Error handling utilities |
| `lib/constants.ts` | HUBS, MODES, SERVICE_LEVELS |
| `supabase/migrations/003_hub_access_and_constraints.sql` | AWB uniqueness constraint |

---

## 7. Testing Coverage

### Unit Tests
- `tests/unit/lib/shipment.schema.test.ts` — Zod schema validation
- `tests/unit/lib/shipmentService.test.ts` — Status transition rules

### E2E Tests
- `tests/e2e/shipment-workflow.spec.ts` — UI workflow tests

---

## 8. Known Gaps & Recommendations

| Gap | Risk | Recommendation |
|-----|------|----------------|
| `generate_awb_number` RPC not in migrations | Medium | Create DB function like invoice numbering |
| Hook bypasses service layer | Low | Route hook through service for consistency |
| No consignee validation in form | Low | Add consignee fields to form schema |
| Duplicate AWB generation logic | Medium | Single source of truth in service |
| No retry on AWB collision | Low | Add conflict handling with retry |

