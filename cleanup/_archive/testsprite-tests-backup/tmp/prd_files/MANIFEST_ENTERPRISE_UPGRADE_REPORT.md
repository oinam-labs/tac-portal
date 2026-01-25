# Manifest Enterprise Upgrade Report

## Overview

This document describes the enterprise upgrade to the TAC Cargo Manifest module, implementing industry-standard AWB-first barcode scanning workflow with idempotency, audit logging, and containerization support.

## Changes Summary

### Database Migration (`supabase/migrations/006_manifest_enterprise_upgrade.sql`)

#### New Tables
| Table | Purpose |
|-------|---------|
| `manifest_counters` | Server-side manifest number generation per org/year/type |
| `manifest_scan_logs` | Audit trail for all scan operations |
| `manifest_containers` | ULD/Bag/Cage/Pallet containerization support |
| `manifest_container_items` | Links shipments to containers |

#### New Constraints & Indexes
- **UNIQUE constraint** on `manifest_items(manifest_id, shipment_id)` - enforces idempotency at DB level
- **UNIQUE constraint** on `manifests(org_id, manifest_no)` - prevents duplicate manifest numbers
- **Indexes** on `manifest_items(manifest_id)`, `manifest_items(shipment_id)`, `shipments(awb_number)`, `manifests(status, org_id)`

#### New Functions (RPC)
| Function | Purpose |
|----------|---------|
| `generate_manifest_number()` | Atomic, collision-free manifest number generation |
| `manifest_add_shipment_by_scan()` | Idempotent shipment addition with validation |
| `manifest_remove_item()` | Audited item removal |
| `manifest_update_totals()` | Recalculate manifest totals |

#### Extended `manifests` Table Columns
- `flight_number`, `airline_code`, `etd`, `eta` (AIR)
- `vehicle_number`, `driver_name`, `driver_phone`, `dispatch_at` (TRUCK)
- `reconciled_at`, `reconciled_by_staff_id`
- `notes`

#### Status Workflow
```
DRAFT → BUILDING → CLOSED → DEPARTED → ARRIVED → RECONCILED
         ↓          ↑
         OPEN ──────┘
```

### Service Layer (`lib/services/manifestService.ts`)

#### New Functions
| Method | Description |
|--------|-------------|
| `addShipmentByScan()` | Atomic scan-to-manifest with RPC fallback |
| `addShipmentByScanFallback()` | App-level idempotent scan |
| `removeShipmentById()` | Audited removal via RPC |
| `getScanLogs()` | Retrieve scan audit history |
| `createEnterprise()` | Create manifest with AIR/TRUCK fields |
| `updateStatus()` | Validated status transitions |
| `getItemsWithFullDetails()` | Full shipment data for UI |
| `normalizeScanToken()` | IATA AWB format normalization |
| `isValidAwbFormat()` | AWB validation |

### React Hooks

#### `useManifestBuilder.ts`
- Manifest creation and building workflow
- Scan operations with optimistic UI
- Status management
- Item removal

#### `useManifestScan.ts`
- Keyboard wedge scanner support
- Audio feedback (success/error/duplicate beeps)
- Scan debouncing
- Statistics tracking

### UI Components

#### `ManifestScanPanel.tsx`
- AWB barcode input with auto-submit
- Real-time scan feedback
- Scan statistics display
- Keyboard wedge toggle

#### `ManifestShipmentTable.tsx`
- Full shipment details (AWB, Consignee, Consignor, Pkg, Weight)
- COD indicator
- Shipment status badges
- Remove action with confirmation

#### `ManifestHeaderForm.tsx`
- Origin/Destination hub selection
- Transport type toggle (AIR/TRUCK)
- AIR fields: Airline code, Flight no, Flight date, ETD/ETA
- TRUCK fields: Vehicle no, Driver name, Dispatch datetime
- Operational rules (Only READY, Match destination, Exclude COD)

#### `EnterpriseManifestBuilder.tsx`
- Two-phase workflow modal (Create → Build)
- Real-time totals display
- Close manifest action

## Security

### RLS Policies
- Org isolation on all new tables
- Role-based access for scan operations
- Audit logging for all mutations

### Data Integrity
- Unique constraints prevent duplicate scans
- Foreign key constraints maintain referential integrity
- Status check constraints enforce valid states

## Tests

### Unit Tests (`tests/unit/lib/manifestService.test.ts`)
- ✅ Scan token normalization (6 tests)
- ✅ AWB format validation (2 tests)
- ✅ Status transitions (9 tests)
- ✅ Idempotency logic (5 tests)
- ✅ Scan validation rules (7 tests)

**Total: 29 tests passing**

## Manual QA Checklist

### Manifest Creation
- [ ] Create AIR manifest with flight details
- [ ] Create TRUCK manifest with vehicle details
- [ ] Verify manifest number auto-generation

### Scanning Workflow
- [ ] Scan valid AWB - adds to manifest
- [ ] Scan duplicate AWB - shows duplicate message
- [ ] Scan invalid AWB - shows error
- [ ] Scan shipment with wrong destination - rejected (when validation enabled)
- [ ] Keyboard wedge scanner works

### Status Transitions
- [ ] DRAFT → BUILDING works
- [ ] BUILDING → CLOSED works
- [ ] CLOSED → DEPARTED works
- [ ] Invalid transitions rejected

### Audit
- [ ] Scan logs created for each scan
- [ ] Removal logs created

## Rollback Plan

1. **Database**: Run migration rollback (migration includes `DROP IF EXISTS` for new objects)
2. **Code**: Revert to previous service/hooks/components
3. **No data loss**: Existing manifests and items unchanged

## Files Changed

### New Files
```
supabase/migrations/006_manifest_enterprise_upgrade.sql
lib/services/manifestService.ts (enhanced)
hooks/useManifestBuilder.ts
hooks/useManifestScan.ts
components/manifests/ManifestScanPanel.tsx
components/manifests/ManifestShipmentTable.tsx
components/manifests/ManifestHeaderForm.tsx
components/manifests/EnterpriseManifestBuilder.tsx
tests/unit/lib/manifestService.test.ts
```

## Usage Example

```tsx
import { EnterpriseManifestBuilder } from '@/components/manifests/EnterpriseManifestBuilder';

function ManifestsPage() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                Create Manifest
            </Button>
            <EnterpriseManifestBuilder
                open={open}
                onOpenChange={setOpen}
                onComplete={(manifestId) => {
                    console.log('Manifest created:', manifestId);
                }}
            />
        </>
    );
}
```

## Known Limitations

1. **Camera scanning**: Placeholder only, not implemented
2. **Containerization UI**: Tables created but UI not implemented
3. **Generated types**: New tables/RPC functions need `npx supabase gen types` after migration

## Next Steps

1. Apply migration to Supabase project
2. Regenerate TypeScript types
3. Integrate `EnterpriseManifestBuilder` into manifests page
4. Add E2E Playwright tests
5. Implement containerization UI (Phase 2)
