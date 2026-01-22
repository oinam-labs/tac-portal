---
description: Critical rules for manifest operations and dispatch workflow
activation: always
---

# Manifests Critical Rule

## Why This Rule Exists
Manifests are the **dispatch control documents** for cargo movement. A manifest error means:
- Shipments loaded on wrong vehicle
- Packages left behind at origin
- Tracking timeline corrupted
- Accountability gaps in custody chain

This rule enforces manifest integrity throughout the dispatch lifecycle.

---

## Manifest Lifecycle

```
OPEN → CLOSED → DEPARTED → ARRIVED
  │       │         │          │
  │       │         │          └─► Shipments: RECEIVED_AT_DEST
  │       │         └─► Shipments: IN_TRANSIT
  │       └─► No more edits allowed
  └─► Add/remove shipments
```

### Status Definitions

| Status | Description | Allowed Operations |
|--------|-------------|-------------------|
| `OPEN` | Being prepared | Add shipment, remove shipment, edit metadata |
| `CLOSED` | Finalized for dispatch | Mark departed only |
| `DEPARTED` | Vehicle has left origin | Mark arrived only |
| `ARRIVED` | Reached destination | None (terminal) |

---

## Manifest Number Format

```
MNF-YYYY-NNNNNN
```
Example: `MNF-2026-123456`

### Generation
```typescript
// manifestService.create
const manifestNo = `MNF-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
```

**Note**: Unlike invoices, manifest numbers are generated client-side using timestamp. This is acceptable because:
- Manifests are operational (not legal) documents
- Collisions are extremely rare (timestamp-based)
- No regulatory requirement for sequential numbering

---

## Critical Operations

### 1. Adding Shipment to Manifest

**Preconditions**:
- Manifest status must be `OPEN`
- Shipment not already on another manifest
- Shipment route matches manifest route

```typescript
// manifestService.addShipment
async addShipment(manifestId: string, shipmentId: string, staffId: string) {
  // 1. Validate manifest is open
  const manifest = await this.getById(manifestId);
  if (manifest.status !== 'OPEN') {
    throw new ValidationError('Cannot add shipments to a closed manifest');
  }

  // 2. Check for duplicate
  const { data: existing } = await supabase
    .from('manifest_items')
    .select('id')
    .eq('manifest_id', manifestId)
    .eq('shipment_id', shipmentId)
    .maybeSingle();

  if (existing) {
    throw new ValidationError('Shipment already added to manifest');
  }

  // 3. Insert item + update totals + update shipment status
  // ...
}
```

### 2. Removing Shipment from Manifest

**Preconditions**:
- Manifest status must be `OPEN`

```typescript
// manifestService.removeShipment
async removeShipment(manifestId: string, shipmentId: string) {
  const manifest = await this.getById(manifestId);
  if (manifest.status !== 'OPEN') {
    throw new ValidationError('Cannot remove shipments from a closed manifest');
  }
  // ...
}
```

### 3. Closing Manifest

**Effects**:
- Status → `CLOSED`
- Timestamp `closed_at` recorded
- No further edits allowed

### 4. Departing Manifest

**Effects**:
- Status → `DEPARTED`
- Timestamp `departed_at` recorded
- All shipments → `IN_TRANSIT`
- Tracking events created for all shipments

```typescript
// manifestService.depart
async depart(manifestId: string) {
  // Update manifest
  await supabase.from('manifests').update({
    status: 'DEPARTED',
    departed_at: new Date().toISOString(),
  });

  // Update all shipments
  const items = await this.getItems(manifestId);
  for (const item of items) {
    await supabase.from('shipments').update({
      status: 'IN_TRANSIT',
    });

    // Create tracking event
    await supabase.from('tracking_events').insert({
      shipment_id: item.shipment_id,
      event_code: 'DEPARTED',
      hub_id: manifest.from_hub_id,
      meta: { manifest_no: manifest.manifest_no },
    });
  }
}
```

### 5. Arriving Manifest

**Effects**:
- Status → `ARRIVED`
- Timestamp `arrived_at` recorded
- All shipments → `RECEIVED_AT_DEST`
- Tracking events created

---

## Totals Reconciliation

Manifest totals must always match sum of items:

```typescript
// manifestService.updateTotals
async updateTotals(manifestId: string) {
  const items = await this.getItems(manifestId);

  const totals = items.reduce((acc, item) => ({
    shipments: acc.shipments + 1,
    packages: acc.packages + (item.shipment?.package_count ?? 0),
    weight: acc.weight + (item.shipment?.total_weight ?? 0),
  }), { shipments: 0, packages: 0, weight: 0 });

  await supabase.from('manifests').update({
    total_shipments: totals.shipments,
    total_packages: totals.packages,
    total_weight: totals.weight,
  });
}
```

**Called after**: Every add or remove operation

---

## Manifest QR Code

For scanning manifests at hubs:

```typescript
// lib/scanParser.ts
export function generateManifestQRPayload(manifest: {
  id: string;
  manifestNo: string;
  fromHubCode: string;
  toHubCode: string;
}): string {
  return JSON.stringify({
    v: 1,
    type: 'manifest',
    id: manifest.id,
    manifestNo: manifest.manifestNo,
    route: `${manifest.fromHubCode}-${manifest.toHubCode}`,
  });
}
```

---

## Validation Rules

| Rule | When | Action |
|------|------|--------|
| Manifest must be OPEN to edit | addShipment, removeShipment | Throw ValidationError |
| No duplicate shipments | addShipment | Throw ValidationError |
| Route must match | addShipment (optional) | Warn or throw |
| Totals must reconcile | After any item change | Auto-recalculate |

---

## Audit Trail

All manifest operations create audit records:

| Action | entity_type | Details |
|--------|-------------|---------|
| Create | manifest | Initial state |
| Add shipment | manifest_item | shipment_id added |
| Remove shipment | manifest_item | shipment_id removed |
| Close | manifest | status change |
| Depart | manifest | status + all shipment updates |
| Arrive | manifest | status + all shipment updates |

---

## Testing Requirements

### Unit Tests
- `addShipment` rejects closed manifest
- `addShipment` rejects duplicate
- `updateTotals` calculates correctly
- Status transitions follow allowed paths

### E2E Tests
- Full manifest lifecycle: create → add items → close → depart → arrive
- Verify shipment statuses update correctly
- Verify tracking events created
- Verify totals match throughout
