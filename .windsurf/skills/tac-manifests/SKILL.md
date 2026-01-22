---
name: tac-manifests
description: Manifest lifecycle operations - creation, shipment assignment, dispatch workflow.
version: 2.0.0
tags: [tac, manifests, dispatch, logistics, critical]
---

# Manifest Operations Skill

## Purpose
Handle manifest lifecycle from creation through dispatch and arrival, ensuring shipment tracking integrity and proper status transitions.

## Preconditions
- [ ] Understanding of manifest workflow (OPEN → CLOSED → DEPARTED → ARRIVED)
- [ ] Access to `manifestService.ts` and `useManifests.ts`
- [ ] Test shipments available for manifest assignment

## Critical Constraints

### Manifest Number Format
```
MNF-YYYY-NNNNNN
Example: MNF-2026-123456
```
Generated client-side using timestamp (acceptable for operational documents).

### Manifest Statuses
| Status | Allowed Operations |
|--------|-------------------|
| `OPEN` | Add/remove shipments, edit metadata |
| `CLOSED` | Mark departed only |
| `DEPARTED` | Mark arrived only |
| `ARRIVED` | None (terminal) |

### Status Transition Rules
```
OPEN → CLOSED → DEPARTED → ARRIVED
       ↑
   No going back
```

## Step-by-Step Procedures

### Creating a Manifest
```typescript
const manifest = await manifestService.create({
  type: 'AIR' | 'TRUCK',
  from_hub_id: originHubId,
  to_hub_id: destinationHubId,
  created_by_staff_id: staffId,
  vehicle_meta: { vehicle_no: 'XX-00-XX-0000' },
});
// manifest_no generated automatically
```

### Adding Shipment to Manifest
1. Verify manifest status is `OPEN`
2. Verify shipment not already on another manifest
3. Add manifest item
4. Update manifest totals
5. Update shipment status to `LOADED_FOR_LINEHAUL`

```typescript
await manifestService.addShipment(manifestId, shipmentId, staffId);
```

### Removing Shipment from Manifest
1. Verify manifest status is `OPEN`
2. Remove manifest item
3. Update manifest totals
4. Revert shipment status to `RECEIVED`

```typescript
await manifestService.removeShipment(manifestId, shipmentId);
```

### Closing Manifest
```typescript
await manifestService.close(manifestId);
// Status → CLOSED, no more edits allowed
```

### Departing Manifest
```typescript
await manifestService.depart(manifestId);
// Effects:
// - Manifest status → DEPARTED
// - All shipments → IN_TRANSIT
// - Tracking events created for all shipments
```

### Arriving Manifest
```typescript
await manifestService.arrive(manifestId);
// Effects:
// - Manifest status → ARRIVED
// - All shipments → RECEIVED_AT_DEST
// - Tracking events created for all shipments
```

## Totals Reconciliation

After any item change, totals must be recalculated:

```typescript
// manifestService.updateTotals
const totals = items.reduce((acc, item) => ({
  shipments: acc.shipments + 1,
  packages: acc.packages + (item.shipment?.package_count ?? 0),
  weight: acc.weight + (item.shipment?.total_weight ?? 0),
}), { shipments: 0, packages: 0, weight: 0 });
```

**Invariant**: `manifest.total_shipments === manifest_items.count()`

## Manifest QR Code

For scanning at hubs:

```typescript
const qrPayload = generateManifestQRPayload({
  id: manifest.id,
  manifestNo: manifest.manifest_no,
  fromHubCode: manifest.from_hub.code,
  toHubCode: manifest.to_hub.code,
});
// Returns: {"v":1,"type":"manifest","id":"...","manifestNo":"...","route":"IXA-DEL"}
```

## Common Failure Modes

| Issue | Cause | Prevention |
|-------|-------|------------|
| Edit closed manifest | Status not checked | Validate status first |
| Duplicate shipment | No uniqueness check | Check before add |
| Wrong totals | Forgot updateTotals | Always call after change |
| Orphaned shipments | Manifest deleted | Soft delete only |
| Missing tracking | Forgot events | Create in depart/arrive |

## Required Tests

```bash
# Manifest service tests
npm run test:unit -- --grep "manifest"

# E2E manifest flow
npm run test -- --grep "Manifest"
```

## Files Reference

| File | Purpose |
|------|---------|
| `lib/services/manifestService.ts` | CRUD + workflow operations |
| `hooks/useManifests.ts` | React Query hooks |
| `hooks/useCloseManifest.ts` | Close workflow hook |
| `pages/Manifests.tsx` | Manifest list/detail UI |
| `components/manifests/` | Manifest components |

## Output Format

```markdown
## Manifest Operation Result

### Action: [Create/AddShipment/Depart/Arrive]
- Manifest ID: `uuid`
- Manifest No: `MNF-2026-XXXXXX`
- Status: [OPEN/CLOSED/DEPARTED/ARRIVED]
- Items: X shipments, Y packages, Z kg

### Shipment Updates
| AWB | Previous Status | New Status |
|-----|-----------------|------------|
| TAC12345678 | RECEIVED | IN_TRANSIT |

### Verification
- [ ] Status transition valid
- [ ] Totals reconciled
- [ ] Tracking events created
- [ ] Shipment statuses updated
