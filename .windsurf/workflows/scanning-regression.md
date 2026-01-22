---
description: Scanning module regression testing workflow
---

# /scanning-regression — Scanning Regression Testing

## Goal
Verify scanning functionality including barcode parsing, offline queue, sync, and idempotency remain correct after changes.

## Preconditions
- Test shipments with known AWBs
- Camera access (for camera tests)
- Ability to simulate offline mode

## Steps

### Step 1: Barcode Parsing Tests
```markdown
## Test: AWB Format Parsing

### Valid AWBs
| Input | Expected Type | Expected AWB |
|-------|---------------|--------------|
| TAC12345678 | shipment | TAC12345678 |
| tac12345678 | shipment | TAC12345678 |
| TAC87654321 | shipment | TAC87654321 |

### Invalid AWBs (should throw error)
| Input | Expected Error |
|-------|----------------|
| TAC1234567 | Invalid format (7 digits) |
| TAC123456789 | Invalid format (9 digits) |
| ABC12345678 | Invalid format (wrong prefix) |
| 12345678 | Invalid format (no prefix) |
| (empty) | Empty input |

### Result
- [ ] All valid AWBs parsed correctly
- [ ] All invalid AWBs rejected with proper error
```

### Step 2: Manifest QR Parsing Tests
```markdown
## Test: Manifest QR Parsing

### Valid Payloads
| Input | Expected Type | Expected ID |
|-------|---------------|-------------|
| {"v":1,"type":"manifest","id":"uuid","manifestNo":"MNF-2026-123456"} | manifest | uuid |
| MNF-2026-123456 | manifest | - (manifestNo only) |

### Invalid Payloads
| Input | Expected Error |
|-------|----------------|
| {"v":2,...} | Unsupported version |
| {"v":1,"type":"manifest"} | Missing id/manifestNo |
| {invalid json} | Invalid JSON |

### Result
- [ ] Valid manifest payloads parsed
- [ ] Invalid payloads rejected
```

### Step 3: Offline Queue Tests
```markdown
## Test: Offline Scan Queue

### Steps
1. Disconnect network (airplane mode or devtools)
2. Scan valid AWB
3. Verify scan added to local queue
4. Verify offline indicator shows
5. Reconnect network
6. Verify auto-sync triggers
7. Verify scan marked as synced

### Verification
- [ ] Scan queued while offline
- [ ] Queue persisted in localStorage
- [ ] Auto-sync on reconnect
- [ ] Scan marked synced after sync

### Result
- [ ] PASS / FAIL
```

### Step 4: Idempotency Tests
```markdown
## Test: Duplicate Scan Handling

### Steps
1. Scan AWB TAC12345678
2. Wait for sync
3. Scan same AWB TAC12345678 again
4. Check tracking_events table

### Expected
- Second scan should not create duplicate event
- OR second scan creates new event with different scan_id

### Verification
- [ ] No duplicate records in DB
- [ ] Unique scan_id per scan

### Result
- [ ] PASS / FAIL
```

### Step 5: Sync Error Handling
```markdown
## Test: Sync Error Recovery

### Steps
1. Queue scan while offline
2. Simulate server error on sync (if possible)
3. Verify scan marked as failed
4. Verify retry happens after 30s
5. Restore server, verify eventual sync

### Verification
- [ ] Failed scans marked with error
- [ ] Retry mechanism works
- [ ] Eventually syncs successfully

### Result
- [ ] PASS / FAIL
```

### Step 6: Camera Scanning (Manual)
```markdown
## Test: Camera Scanning

### Steps
1. Navigate to /scanning
2. Click camera scan button
3. Allow camera permission
4. Scan physical barcode (or QR code on screen)
5. Verify scan processed

### Verification
- [ ] Camera permission requested
- [ ] Camera preview shows
- [ ] Barcode detected and parsed
- [ ] Scan added to queue

### Result
- [ ] PASS / FAIL
```

### Step 7: Run Automated Tests
```bash
// turbo
npm run test:unit -- --grep "scan"

npm run test -- --grep "Scanning"
```

## Output Format

```markdown
## Scanning Regression Report — [Date]

### Barcode Parsing
| Format | Status |
|--------|--------|
| AWB (TAC########) | ✅ |
| Manifest QR | ✅ |
| Manifest No | ✅ |
| Invalid formats | ✅ Rejected |

### Offline Queue
- [x] Scans queue offline
- [x] Persisted in localStorage
- [x] Auto-sync on reconnect

### Idempotency
- [x] No duplicate events created
- [x] Unique scan_id per scan

### Error Handling
- [x] Failed scans marked
- [x] Retry mechanism works

### Camera (Manual)
- [x] Permission flow works
- [x] Barcode detection works

### Automated Tests
- Unit: X/X passed
- E2E: X/X passed

### Issues Found
[None / List issues]

### Verdict: PASS / FAIL
```

## Risk/Rollback
- Risk: Scanning is critical for warehouse operations
- Rollback: Revert immediately if sync or parsing fails
