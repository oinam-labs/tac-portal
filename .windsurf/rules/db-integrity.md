---
description: Database integrity rules for Supabase operations
activation: always
---

# Database Integrity Rule

## Why This Rule Exists
TAC Cargo is a logistics platform where data integrity failures cause real-world operational chaos: duplicate invoices, lost shipments, incorrect manifests. This rule enforces strict data handling patterns.

---

## Critical Constraints

### 1. Schema Changes Require Migration
**Never** modify database schema without:
- A new SQL migration file in `supabase/migrations/`
- Backward compatibility plan (old code must work during rollout)
- RLS policy review
- Types regeneration (`database.types.ts`)

### 2. Protected Identifiers (DO NOT CHANGE FORMAT)

| Identifier | Format | Generator | Example |
|------------|--------|-----------|---------|
| Invoice No | `INV-YYYY-NNNN` | DB trigger `set_invoice_no` | `INV-2026-0001` |
| AWB Number | `TAC` + 8 digits | RPC `generate_awb_number` | `TAC12345678` |
| Manifest No | `MNF-YYYY-NNNNNN` | Client timestamp | `MNF-2026-123456` |
| Customer Code | Org-specific | Service | `CUST-001` |

**Changing these formats breaks**:
- Printed labels and invoices
- Barcode scanners in warehouses
- External integrations
- Historical data lookups

### 3. Soft Deletes Only
All core tables use `deleted_at` column. **Never use hard DELETE** for:
- `shipments`
- `customers`
- `invoices`
- `manifests`
- `staff`

```typescript
// Correct - soft delete
await supabase.from('shipments')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id);

// Wrong - hard delete
await supabase.from('shipments').delete().eq('id', id);
```

### 4. Org Scoping (Multi-Tenancy)
Every query MUST include `org_id` filter:

```typescript
// Correct
const orgId = orgService.getCurrentOrgId();
await supabase.from('shipments')
  .select('*')
  .eq('org_id', orgId);

// Wrong - leaks data across orgs
await supabase.from('shipments').select('*');
```

---

## Idempotency Rules

### Scanning Operations (CRITICAL)
Duplicate scans must NOT create duplicate records:

```typescript
// scanQueueStore.ts pattern
const scan: ScanEvent = {
  id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  synced: false,
};
```

- Each scan has a unique client-generated ID
- Sync checks for existing events before insert
- Failed syncs are retried, not duplicated

### Manifest Item Operations
```typescript
// manifestService.addShipment - check duplicate before insert
const { data: existing } = await supabase
  .from('manifest_items')
  .select('id')
  .eq('manifest_id', manifestId)
  .eq('shipment_id', shipmentId)
  .maybeSingle();

if (existing) {
  throw new ValidationError('Shipment already added to manifest');
}
```

---

## Transaction Boundaries

### Operations That Must Be Atomic
1. **Manifest departure**: Update manifest status + all shipment statuses + create tracking events
2. **Exception creation**: Create exception + update shipment status to EXCEPTION
3. **Invoice generation**: Create invoice + update shipment.invoice_id

Currently handled via sequential Supabase calls. For true atomicity, use:
- Supabase Edge Functions with transactions
- Database-level triggers

---

## Audit Trail Requirements

### Auditable Operations
All state changes must be logged to `audit_logs`:

| entity_type | Auditable Actions |
|-------------|-------------------|
| shipment | create, status_change, manifest_assign |
| manifest | create, close, depart, arrive |
| invoice | create, status_change, cancel |
| exception | create, assign, resolve |

### Audit Log Structure
```sql
audit_logs (
  id uuid PRIMARY KEY,
  org_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  actor_staff_id uuid,
  created_at timestamptz
)
```

---

## RLS Policy Checklist

Before any table modification:
- [ ] RLS enabled: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] Select policy scoped by org_id
- [ ] Insert policy validates org_id matches user's org
- [ ] Update policy prevents cross-org updates
- [ ] Delete policy (if allowed) scoped by org_id
- [ ] Service role policy for admin operations

---

## Validation Patterns

### Required: Zod Schemas
```typescript
// lib/schemas/shipment.schema.ts
export const createShipmentSchema = z.object({
  consignee_name: z.string().min(1, 'Consignee name required'),
  consignee_phone: z.string().regex(/^\d{10}$/, 'Invalid phone'),
  destination_hub_id: z.string().uuid('Invalid hub'),
  // ...
});

// In service/hook
const validated = createShipmentSchema.parse(input);
```

### AWB Validation
```typescript
// lib/scanParser.ts
export function isValidAWB(awb: string): boolean {
  return /^TAC\d{8}$/i.test(awb);
}
```
