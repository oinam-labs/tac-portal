---
name: tac-dashboard-qa
description: Full dashboard QA audit using Playwright + module-by-module checklists.
version: 2.0.0
tags: [qa, dashboard, playwright, vitest]
---

# Dashboard QA Skill (Playwright-first)

## Purpose
Perform comprehensive QA validation across all TAC Cargo modules using automated tests and manual checklists. Ensures UI correctness, data integrity, and user experience quality.

## Preconditions
- [ ] Dev server running (`npm run dev`)
- [ ] Test user credentials available
- [ ] Sample data in test environment
- [ ] Playwright installed (`npx playwright install`)

## Modules to Validate

| Module | Page | Priority | E2E Test |
|--------|------|----------|----------|
| Dashboard | `/dashboard` | High | `tests/e2e/dashboard.spec.ts` |
| Shipments | `/shipments` | Critical | `tests/e2e/shipments.spec.ts` |
| Manifests | `/manifests` | Critical | `tests/e2e/manifests.spec.ts` |
| Scanning | `/scanning` | Critical | `tests/e2e/scanning.spec.ts` |
| Invoices | `/finance` | Critical | `tests/e2e/finance.spec.ts` |
| Customers | `/customers` | High | `tests/e2e/customers.spec.ts` |
| Exceptions | `/exceptions` | High | Manual |
| Tracking | `/tracking` | Medium | Manual |
| Analytics | `/analytics` | Medium | Manual |
| Inventory | `/inventory` | Medium | Manual |
| Management | `/management` | Low | Manual |

## Step-by-Step Procedure

### Step 1: Run Automated Tests
```bash
# Run all E2E tests
npm run test

# Run with UI for debugging
npm run test:ui

# Run specific module
npm run test -- --grep "Manifests"
```

### Step 2: Module-by-Module Manual Checklist

#### Dashboard (`/dashboard`)
- [ ] Stats cards show correct counts
- [ ] Recent shipments list loads
- [ ] Charts render without errors
- [ ] Refresh updates data
- [ ] Empty state if no data

#### Shipments (`/shipments`)
- [ ] List loads with pagination
- [ ] Search filters work
- [ ] Status filter works
- [ ] Create shipment flow completes
- [ ] Edit shipment saves changes
- [ ] Status updates correctly
- [ ] AWB format validated

#### Manifests (`/manifests`)
- [ ] List shows all manifests
- [ ] Create manifest with type selection
- [ ] Add shipments to open manifest
- [ ] Remove shipments from open manifest
- [ ] Close manifest (no more edits)
- [ ] Depart manifest (updates shipment statuses)
- [ ] Arrive manifest (completes flow)
- [ ] Totals match item count

#### Scanning (`/scanning`)
- [ ] Camera permission requested
- [ ] Manual entry works
- [ ] Valid AWB accepted
- [ ] Invalid AWB rejected with error
- [ ] Offline mode queues scans
- [ ] Online sync completes
- [ ] Duplicate scan handled

#### Invoices (`/finance`)
- [ ] Invoice list loads
- [ ] Create invoice generates number
- [ ] Invoice number format: INV-YYYY-NNNN
- [ ] Totals calculate correctly
- [ ] Mark as paid works
- [ ] Cancel invoice works
- [ ] PDF generates correctly

#### Customers (`/customers`)
- [ ] Customer list loads
- [ ] Search works
- [ ] Create customer validates fields
- [ ] Edit customer saves
- [ ] Delete (soft) removes from list

### Step 3: Permission Checks
Test with different roles:
- [ ] Admin: Full access
- [ ] Operator: Limited to own hub
- [ ] Viewer: Read-only access

### Step 4: Empty State Checks
For each module, verify empty state when no data:
- [ ] Meaningful message displayed
- [ ] CTA to create first item
- [ ] No JavaScript errors

### Step 5: Error State Checks
Simulate errors:
- [ ] Network offline: Shows offline indicator
- [ ] API error: Shows error toast
- [ ] Invalid input: Shows validation message

### Step 6: Responsive Checks
Test at breakpoints:
- [ ] Desktop (1280px+): Full layout
- [ ] Laptop (1024px): Compact sidebar
- [ ] Tablet (768px): Collapsible nav
- [ ] Mobile (< 640px): Stack layout

## Common Failure Modes

| Issue | Where to Look | Fix |
|-------|---------------|-----|
| Stats wrong | Dashboard aggregation | Check service queries |
| List empty | Data fetching | Check org_id filter |
| Form errors | Validation | Check zod schema |
| PDF broken | pdf-generator.ts | Check barcode input |
| Scan fails | scanParser.ts | Check format regex |

## Required Tests

```bash
# Full E2E suite
npm run test

# With visual UI
npm run test:ui

# Generate report
npm run test:report

# Specific file
npx playwright test tests/e2e/manifests.spec.ts
```

## Output Format

```markdown
## QA Report - [Date]

### Automated Tests
- Total: X
- Passed: X
- Failed: X
- Skipped: X

### Module Status

| Module | Auto | Manual | Issues |
|--------|------|--------|--------|
| Dashboard | ✅ | ✅ | None |
| Shipments | ✅ | ✅ | None |
| Manifests | ⚠️ | ✅ | Test flaky |

### Issues Found
1. **[Module]**: [Description] - Severity: [High/Medium/Low]

### Recommendations
1. [Recommendation]
