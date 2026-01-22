---
description: Critical rules for scanning operations - idempotency, offline-first, audit
activation: always
---

# Scanning Critical Rule

## Why This Rule Exists
Scanning is the heartbeat of warehouse operations. A single bug can cause:
- Duplicate packages in system (inventory chaos)
- Lost scan events (missing audit trail)
- Manifest mismatches (dispatch errors)
- Offline data loss (warehouse connectivity is unreliable)

This rule enforces bulletproof scanning logic.

---

## Core Invariants

### 1. Idempotency (NON-NEGOTIABLE)
**Same barcode scanned twice must NOT create two records.**

```typescript
// Correct - unique scan ID prevents duplicates
const scan: ScanEvent = {
  id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  // ...
};
```

The `scan_id` is stored in `tracking_events.meta.scan_id` to detect replays.

### 2. Offline-First Architecture
Scans must work without network connectivity.

**Pattern** (from `scanQueueStore.ts`):
```typescript
// 1. Add to local queue immediately
store.addScan(scanData);

// 2. Auto-sync when online
if (navigator.onLine) {
  setTimeout(() => store.retrySync(), 100);
}

// 3. Persist queue to localStorage
persist({ name: 'tac-scan-queue' })

// 4. Retry on reconnection
window.addEventListener('online', () => store.retrySync());
```

### 3. Immutable Event Records
Tracking events are **insert-only**. Never update or delete scan records.

```typescript
// Correct - insert new event
await supabase.from('tracking_events').insert({ ... });

// WRONG - updating existing event
await supabase.from('tracking_events')
  .update({ status: 'corrected' })
  .eq('id', eventId); // FORBIDDEN
```

### 4. Exception Routing (Never Discard)
If a scan conflicts with expected state, route to Exceptions module:

```typescript
// Example: shipment scanned but already delivered
if (shipment.status === 'DELIVERED') {
  await exceptionService.create({
    shipment_id: shipment.id,
    type: 'UNEXPECTED_SCAN',
    severity: 'MEDIUM',
    description: `Scan after delivery: ${awb}`,
  });
  // Do NOT throw error - queue the exception
}
```

---

## Barcode Formats

### Supported Formats
| Type | Format | Regex | Example |
|------|--------|-------|---------|
| AWB (shipment) | TAC + 8 digits | `/^TAC\d{8}$/i` | TAC12345678 |
| Manifest QR | JSON payload v1 | `{"v":1,"type":"manifest",...}` | See below |
| Package | PKG prefix | `/^PKG-\d+$/` | PKG-001 |

### Manifest QR Payload
```json
{
  "v": 1,
  "type": "manifest",
  "id": "uuid-here",
  "manifestNo": "MNF-2026-123456",
  "route": "IXA-DEL"
}
```

### Parsing Logic
All scan input goes through `lib/scanParser.ts`:

```typescript
import { parseScanInput, ScanResult } from '@/lib/scanParser';

const result: ScanResult = parseScanInput(rawInput);
// result.type: 'shipment' | 'manifest' | 'package'
// result.awb?: string
// result.manifestId?: string
// result.raw: string
```

---

## Scan Event Schema

```typescript
interface ScanEvent {
  id: string;           // Client-generated unique ID
  type: 'shipment' | 'manifest' | 'package';
  code: string;         // AWB or manifest number
  source: ScanSource;   // CAMERA | BARCODE_SCANNER | MANUAL
  hubCode: HubCode;     // Current hub location
  staffId: string;      // Operator ID
  timestamp: string;    // ISO 8601
  synced: boolean;      // Sync status
  syncedAt?: string;    // When synced
  error?: string;       // Sync error message
}
```

---

## Sync Flow

```
┌─────────────────┐
│  Scan Input     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse & Validate│ ← lib/scanParser.ts
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add to Queue    │ ← localStorage (persisted)
└────────┬────────┘
         │
    ┌────┴────┐
    │ Online? │
    └────┬────┘
     Yes │ No
         │  └──► Wait for online event
         ▼
┌─────────────────┐
│ Sync to Supabase│ ← tracking_events insert
└────────┬────────┘
         │
    ┌────┴────┐
    │Success? │
    └────┬────┘
     Yes │ No
         │  └──► Mark failed, retry in 30s
         ▼
┌─────────────────┐
│ Mark Synced     │
└─────────────────┘
```

---

## Testing Requirements

### Unit Tests (Required)
- `parseScanInput` handles all format variations
- `isValidAWB` rejects malformed AWBs
- Queue store maintains FIFO order
- Sync retry respects exponential backoff

### E2E Tests (Required for Changes)
- Offline scan → reconnect → verify sync
- Duplicate scan → verify no duplicate records
- Invalid barcode → verify error handling
- Manifest scan → verify routing

---

## Failure Modes to Handle

| Failure | Expected Behavior |
|---------|-------------------|
| Network timeout | Queue scan, retry later |
| Invalid barcode format | Show error toast, do not queue |
| Shipment not found | Create exception, continue |
| Manifest already closed | Show error, prevent scan |
| Duplicate scan | Silently dedupe (idempotent) |
| localStorage full | Show warning, continue in-memory |
