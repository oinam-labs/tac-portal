---
description: Module-by-module QA using Playwright and manual checklists
---

# /qa-dashboard — Dashboard QA Workflow

## Goal
Execute comprehensive QA across all TAC Cargo modules using automated tests and manual verification.

## Preconditions
- Dev server running (`npm run dev`)
- Test user credentials available
- Playwright installed (`npx playwright install`)

## Steps

### Step 1: Run Automated E2E Tests
```bash
// turbo
npm run test

# Or with UI for debugging
npm run test:ui
```

### Step 2: Module-by-Module Manual QA

#### Dashboard (`/dashboard`)
- [ ] Stats cards display correct counts
- [ ] Recent shipments list loads
- [ ] Charts render without errors
- [ ] Data refreshes on navigation back
- [ ] Empty state displays if no data

#### Shipments (`/shipments`)
- [ ] List loads with correct data
- [ ] Pagination works
- [ ] Search filters by AWB/consignee
- [ ] Status filter works
- [ ] Create shipment flow completes
- [ ] AWB format validated (TAC########)
- [ ] Edit shipment saves changes
- [ ] Delete (soft) removes from list

#### Manifests (`/manifests`)
- [ ] List shows all manifests
- [ ] Create manifest with type (AIR/TRUCK)
- [ ] Add shipments to OPEN manifest
- [ ] Remove shipments from OPEN manifest
- [ ] Cannot edit CLOSED manifest
- [ ] Close manifest works
- [ ] Depart updates shipment statuses
- [ ] Arrive completes flow
- [ ] Totals match item count

#### Scanning (`/scanning`)
- [ ] Camera permission requested
- [ ] Manual AWB entry works
- [ ] Valid AWB accepted
- [ ] Invalid AWB shows error
- [ ] Offline indicator shows when disconnected
- [ ] Scans queue offline
- [ ] Scans sync when online
- [ ] Duplicate scan handled gracefully

#### Invoices (`/finance`)
- [ ] Invoice list loads
- [ ] Create invoice works
- [ ] Invoice number format: INV-YYYY-NNNN
- [ ] Totals calculate correctly
- [ ] Mark as paid works
- [ ] Cancel invoice works
- [ ] PDF download works
- [ ] PDF content correct

#### Customers (`/customers`)
- [ ] Customer list loads
- [ ] Search works
- [ ] Create customer validates required fields
- [ ] Edit customer saves
- [ ] Delete removes from list

#### Exceptions (`/exceptions`)
- [ ] Exception list loads
- [ ] Filter by status works
- [ ] Filter by severity works
- [ ] Assign exception works
- [ ] Resolve exception works
- [ ] Shipment status updates on resolve

### Step 3: Permission Checks
Test with different roles:
- [ ] Admin: Full access to all modules
- [ ] Operator: Limited to assigned hub
- [ ] Viewer: Read-only access

### Step 4: Responsive Testing
Test at breakpoints:
- [ ] Desktop (1280px+): Full sidebar
- [ ] Laptop (1024px): Compact layout
- [ ] Tablet (768px): Collapsible navigation
- [ ] Mobile (< 640px): Stacked layout

### Step 5: Generate Test Report
```bash
npm run test:report
```

## Output Format

```markdown
## QA Report — [Date]

### Automated Tests
- Total: X tests
- Passed: X
- Failed: X
- Skipped: X

### Module Status

| Module | Auto | Manual | Status |
|--------|------|--------|--------|
| Dashboard | ✅ | ✅ | PASS |
| Shipments | ✅ | ✅ | PASS |
| Manifests | ⚠️ | ✅ | 1 flaky test |
| Scanning | ✅ | ✅ | PASS |
| Invoices | ✅ | ✅ | PASS |
| Customers | ✅ | ✅ | PASS |
| Exceptions | ✅ | ✅ | PASS |

### Issues Found
| Severity | Module | Description |
|----------|--------|-------------|
| High | [module] | [description] |
| Medium | [module] | [description] |
| Low | [module] | [description] |

### Responsive Status
- [x] Desktop: PASS
- [x] Laptop: PASS
- [x] Tablet: PASS
- [ ] Mobile: [issue]

### Permission Status
- [x] Admin role: VERIFIED
- [x] Operator role: VERIFIED
- [x] Viewer role: VERIFIED

### Recommendations
1. [Fix priority 1]
2. [Fix priority 2]
```

## Risk/Rollback
- Risk: May find blocking issues
- Rollback: N/A (QA is verification only)
