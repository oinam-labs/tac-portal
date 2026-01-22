---
description: Full system audit - codebase, data integrity, UI, and tests
---

# /audit-full-system — TAC Cargo Enterprise Audit

## Goal
Run a comprehensive end-to-end audit of the TAC Cargo codebase, validating data integrity, UI correctness, and test coverage.

## Preconditions
- Repository cloned and dependencies installed
- Environment configured (`.env.local`)
- Dev server can start (`npm run dev`)

## Steps

### Step 1: Documentation Review
Read and summarize:
```
docs/PRD/
docs/tasks/
README.md
```
Identify: Current features, known issues, pending work.

### Step 2: Module Mapping
Map each module to its components:

| Module | Page | Service | Hook | DB Tables |
|--------|------|---------|------|-----------|
| Invoices | Finance.tsx | invoiceService.ts | useInvoices.ts | invoices, invoice_counters |
| Customers | Customers.tsx | customerService.ts | useCustomers.ts | customers |
| Shipments | Shipments.tsx | shipmentService.ts | useShipments.ts | shipments, tracking_events |
| Manifests | Manifests.tsx | manifestService.ts | useManifests.ts | manifests, manifest_items |
| Scanning | Scanning.tsx | scanQueueStore.ts | - | tracking_events |
| Exceptions | Exceptions.tsx | exceptionService.ts | useExceptions.ts | exceptions |

### Step 3: Data Integrity Validation
Check each service for:
- [ ] Org scoping (`.eq('org_id', orgId)`)
- [ ] Soft deletes (`.is('deleted_at', null)`)
- [ ] Idempotency patterns
- [ ] Audit logging

### Step 4: Identifier Format Verification
Verify formats match spec:
- [ ] Invoice: `INV-YYYY-NNNN` (DB trigger)
- [ ] AWB: `TAC########` (regex validation)
- [ ] Manifest: `MNF-YYYY-NNNNNN` (timestamp)

### Step 5: Status Transition Audit
Verify valid transitions:
```
Shipment: CREATED → RECEIVED → LOADED_FOR_LINEHAUL → IN_TRANSIT → RECEIVED_AT_DEST → DELIVERED
Manifest: OPEN → CLOSED → DEPARTED → ARRIVED
Invoice: ISSUED → PAID | CANCELLED
Exception: OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

### Step 6: Run Automated Checks
```bash
// turbo
npm run typecheck

// turbo
npm run lint

// turbo
npm run test:unit
```

### Step 7: E2E Test Run
```bash
npm run test
```

### Step 8: Compile Findings

## Output Format

```markdown
## Full System Audit Report — [Date]

### Summary
- Critical Issues: X
- Medium Issues: Y
- Low/Polish Issues: Z

### Critical Issues (Fix Immediately)
1. **[Location]**: [Description]
   - Impact: [What breaks]
   - Fix: [Recommendation]

### Medium Issues (Fix Soon)
1. **[Location]**: [Description]
   - Impact: [Risk]
   - Fix: [Recommendation]

### Low/Polish Issues (Backlog)
1. **[Location]**: [Description]

### Test Results
- Typecheck: PASS/FAIL
- Lint: PASS/FAIL (X warnings)
- Unit Tests: X/Y passed
- E2E Tests: X/Y passed

### Recommended Patch Order
1. [Critical fix 1]
2. [Critical fix 2]
3. [Medium fixes]
4. [Polish items]

### Data Integrity Status
- [ ] Org scoping: VERIFIED
- [ ] Soft deletes: VERIFIED
- [ ] Identifier formats: VERIFIED
- [ ] Status transitions: VERIFIED
```

## Risk/Rollback
- Risk: Audit may surface breaking issues requiring immediate attention
- Rollback: N/A (audit is read-only)
