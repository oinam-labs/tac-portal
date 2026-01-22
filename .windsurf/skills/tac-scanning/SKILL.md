---
name: tac-scanning
description: Barcode scanning operations - offline-first queue, parsing, sync, and idempotency.
version: 2.0.0
tags: [tac, scanning, barcode, offline, critical]
---

# Scanning Operations Skill

## Purpose
Handle barcode/QR scanning with offline-first architecture, ensuring idempotent event creation and reliable sync even in low-connectivity warehouse environments.

## Preconditions
- [ ] Understanding of scan queue architecture (`scanQueueStore.ts`)
- [ ] Understanding of barcode formats (`scanParser.ts`)
- [ ] Camera permissions for testing

## Critical Constraints

### Idempotency (NON-NEGOTIABLE)
**Same scan must NOT create duplicate records.**

Each scan gets a unique client-generated ID:
```typescript
const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### Supported Barcode Formats

| Type | Format | Regex | Example |
|------|--------|-------|---------|
| AWB | TAC + 8 digits | `/^TAC\d{8}$/i` | TAC12345678 |
| Manifest QR | JSON v1 | `{"v":1,"type":"manifest",...}` | See below |
| Manifest No | MNF-YYYY-NNNNNN | `/^MNF-\d{4}-\d{6}$/i` | MNF-2026-123456 |

### Offline-First Architecture
```
Scan → Local Queue → Auto-Sync → Supabase
         ↓
    localStorage (persisted)
```

## Step-by-Step Procedures

### Processing a Scan
1. Receive raw input (camera/scanner/manual)
2. Parse with `parseScanInput()`
3. Validate format
4. Add to local queue with unique ID
5. Trigger sync if online
6. Handle sync result

```typescript
import { parseScanInput } from '@/lib/scanParser';
import { useScanQueueStore } from '@/store/scanQueueStore';

// Parse input
const result = parseScanInput(rawInput);

// Add to queue
useScanQueueStore.getState().addScan({
  type: result.type,
  code: result.awb || result.manifestNo,
  source: ScanSource.CAMERA,
  hubCode: currentHubCode,
  staffId: currentStaffId,
});
```

### Handling Different Scan Types

#### Shipment Scan (AWB)
```typescript
if (result.type === 'shipment') {
  // Look up shipment by AWB
  const shipment = await shipmentService.getByAwb(result.awb);
  if (!shipment) {
    // Create exception for unknown AWB
    await exceptionService.create({
      type: 'UNKNOWN_SHIPMENT',
      description: `Scanned unknown AWB: ${result.awb}`,
    });
  }
}
```

#### Manifest Scan
```typescript
if (result.type === 'manifest') {
  // Look up manifest
  const manifest = await manifestService.getByManifestNo(result.manifestNo);
  // Process manifest arrival/departure
}
```

### Sync Flow
```typescript
// Automatic sync (from scanQueueStore)
const retrySync = async () => {
  const pendingScans = queue.filter(s => !s.synced && !s.error);
  
  for (const scan of pendingScans) {
    try {
      await supabase.from('tracking_events').insert({
        shipment_id: resolvedShipmentId,
        awb_number: scan.code,
        event_code: scan.type === 'manifest' ? 'MANIFEST_SCAN' : 'PACKAGE_SCAN',
        event_time: scan.timestamp,
        hub_id: scan.hubCode,
        actor_staff_id: scan.staffId,
        source: 'SCAN',
        meta: { scan_id: scan.id },
      });
      
      markSynced(scan.id);
    } catch (error) {
      markFailed(scan.id, error.message);
    }
  }
};
```

## Scan Event Schema

```typescript
interface ScanEvent {
  id: string;           // Unique client ID
  type: 'shipment' | 'manifest' | 'package';
  code: string;         // AWB or manifest number
  source: ScanSource;   // CAMERA | BARCODE_SCANNER | MANUAL
  hubCode: HubCode;     // Current location
  staffId: string;      // Operator
  timestamp: string;    // ISO 8601
  synced: boolean;      // Sync status
  syncedAt?: string;    // When synced
  error?: string;       // Sync error
}
```

## Error Handling

| Error | Action |
|-------|--------|
| Invalid format | Show error toast, don't queue |
| Shipment not found | Create exception, continue |
| Manifest closed | Show error, prevent operation |
| Network timeout | Queue for retry |
| Sync failure | Mark failed, retry in 30s |

## Exception Routing

**Never discard conflicting scans.** Route to Exceptions:

```typescript
if (shipment.status === 'DELIVERED') {
  await exceptionService.create({
    shipment_id: shipment.id,
    type: 'UNEXPECTED_SCAN',
    severity: 'MEDIUM',
    description: `Scan after delivery: ${awb}`,
  });
}
```

## Common Failure Modes

| Issue | Cause | Prevention |
|-------|-------|------------|
| Duplicate events | No idempotency | Unique scan_id |
| Lost scans | No persistence | localStorage queue |
| Wrong shipment | Ambiguous AWB | Validate format strictly |
| Sync loop | Network flapping | Debounce sync attempts |

## Required Tests

```bash
# Parser unit tests
npm run test:unit -- --grep "scanParser"

# Queue store tests  
npm run test:unit -- --grep "scanQueue"

# E2E scanning flow
npm run test -- --grep "Scanning"
```

## Files Reference

| File | Purpose |
|------|---------|
| `lib/scanParser.ts` | Barcode parsing logic |
| `store/scanQueueStore.ts` | Offline queue management |
| `pages/Scanning.tsx` | Scanning UI |
| `components/scanning/` | Scanning components |

## Output Format

```markdown
## Scan Operation Result

### Input
- Raw: `TAC12345678`
- Parsed Type: shipment
- AWB: TAC12345678

### Queue Status
- Pending: X
- Synced: Y
- Failed: Z

### Sync Result
- [ ] Event created in tracking_events
- [ ] Shipment status updated
- [ ] No duplicates created

### Exceptions (if any)
- Type: [UNKNOWN_SHIPMENT/UNEXPECTED_SCAN]
- Description: [details]
