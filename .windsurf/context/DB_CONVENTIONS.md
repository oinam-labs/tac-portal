# DB Conventions — TAC Cargo (Supabase)

## Table Naming
- Plural, snake_case: `shipments`, `tracking_events`, `manifest_items`
- Junction tables: `entity1_entity2` (e.g., `manifest_items`)

## Column Naming
- snake_case: `created_at`, `org_id`, `awb_number`
- Foreign keys: `{entity}_id` (e.g., `customer_id`, `hub_id`)
- Timestamps: `created_at`, `updated_at`, `deleted_at`

## Primary Keys
- All tables use UUID: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- Never use sequential integers for PKs

## Required Columns (All Core Tables)
```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
org_id uuid NOT NULL REFERENCES orgs(id),
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),
deleted_at timestamptz  -- for soft deletes
```

## Soft Deletes (Non-negotiable)
All core tables use soft deletes:
```sql
-- Delete operation
UPDATE shipments SET deleted_at = now() WHERE id = $1;

-- Query operation
SELECT * FROM shipments WHERE org_id = $1 AND deleted_at IS NULL;
```

**Never use hard DELETE on**: shipments, customers, invoices, manifests, staff

## Immutable Tables
These tables are insert-only (never UPDATE or DELETE):
- `tracking_events` - Audit trail of shipment movement
- `audit_logs` - All entity changes

## Timestamps
- Use `timestamptz` (with timezone) for all timestamps
- Use server time (`now()`) for authoritative timestamps
- Client timestamps only for reference (e.g., `event_time` in scans)

## Multi-tenancy (Org Scoping)
Every query MUST filter by `org_id`:
```typescript
const orgId = orgService.getCurrentOrgId();
await supabase.from('shipments')
  .select('*')
  .eq('org_id', orgId)
  .is('deleted_at', null);
```

## Row Level Security (RLS)
All tables must have RLS enabled:
```sql
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Standard policy pattern
CREATE POLICY "Users can access own org data"
  ON shipments
  FOR ALL
  TO authenticated
  USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
```

## Identifier Formats (Protected)

| Entity | Format | Generator |
|--------|--------|-----------|
| Invoice | `INV-YYYY-NNNN` | DB trigger (`set_invoice_no`) |
| AWB | `TAC` + 8 digits | RPC (`generate_awb_number`) |
| Manifest | `MNF-YYYY-NNNNNN` | Client (timestamp-based) |
| Customer Code | Org-specific | Service |

**Never change these formats** - they affect printed labels, barcodes, and integrations.

## Idempotency Patterns

### Scanning
Each scan has unique client-generated ID:
```typescript
const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Manifest Items
Check for duplicates before insert:
```typescript
const { data: existing } = await supabase
  .from('manifest_items')
  .select('id')
  .eq('manifest_id', manifestId)
  .eq('shipment_id', shipmentId)
  .maybeSingle();

if (existing) throw new ValidationError('Already added');
```

## Consistency Rules
- Invoice `total` must equal sum of line items + tax - discount
- Manifest `total_shipments` must equal count of `manifest_items`
- Manifest `total_weight` must equal sum of shipment weights

## Audit Logging
All significant operations create audit records:
```sql
INSERT INTO audit_logs (
  org_id, entity_type, entity_id, action,
  before, after, actor_staff_id
) VALUES (...);
```
