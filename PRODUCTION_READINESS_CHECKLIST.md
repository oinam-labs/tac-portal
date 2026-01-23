# TAC Cargo Production Readiness Checklist

**Status**: Pre-deployment validation checklist  
**Last Updated**: 2026-01-23

---

## ✅ Critical User Flows

### 3.1 Invoice → Dispatch → Label → Manifest (PRIMARY FLOW)
- [ ] Invoice creation generates valid shipment record
- [ ] Invoice PDF download works independently
- [ ] Label PDF download works independently
- [ ] Manifest creation is authoritative dispatch step
- [ ] Route shows: IMF → DEL (or other valid routes)
- [ ] No shared state between invoice and label
- [ ] Manifest creation not tied to invoice UI state

**Manual Test**:
```
1. Create Invoice
2. Download Invoice PDF
3. Download Label PDF
4. Create Manifest
5. Verify route: IMF → DEL
```

### 3.2 Shipment → Print Label (BLOCKER FIX)
- [ ] Label printing works directly from Shipment Details
- [ ] Shipment ID is sufficient to generate label
- [ ] Error "No shipment data found. Please generate label from Invoices dashboard." does NOT exist

### 3.3 Manifest Creation (CRASH FIX)
- [ ] No React crashes
- [ ] Hub dropdown shows: `Imphal Hub (IMF)`
- [ ] Does NOT show: `Imphal Hub (IXA)`
- [ ] No error: `Failed to execute 'removeChild' on 'Node'`

**Audit Items**:
- [ ] Conditional rendering issues resolved
- [ ] React keys present on all mapped elements
- [ ] No manual DOM manipulation
- [ ] Realtime subscription cleanup correct

### 3.4 Customer Search (Invoice Flow)
- [ ] Consigner/Consignee search returns real customers
- [ ] Empty states handled correctly
- [ ] No `{}` treated as valid data
- [ ] No false "No customers found" when customers exist

### 3.5 Routing & Sidebar Integrity
- [ ] Sidebar labels match routes
- [ ] No dead links
- [ ] No hash-routing mismatches

---

## ✅ Domain Enforcement (IMF)

### Hub Code Validation
- [ ] All IXA replaced with IMF in constants
- [ ] UI dropdowns show IMF for Imphal
- [ ] PDF labels show IMF
- [ ] API validates hub codes: DEL, GAU, CCU, IMF only

**Run Audit**:
```bash
node scripts/audit-hub-codes.js
```

Expected: `✅ PASSED: No invalid hub code references found`

---

## ✅ Mock Data Cleanup

### Dashboard Components
- [x] ShipmentTrendChart - uses real shipment data
- [x] StatusDistributionChart - uses real shipment status
- [x] FleetStatusChart - uses real manifest data
- [x] KPIGrid - already using real data
- [ ] QuickActions - verify no mock data
- [ ] RecentActivity - verify no mock data

### Empty States
- [x] ShipmentTrendChart - shows empty state when no data
- [x] StatusDistributionChart - shows "No shipments yet"
- [x] FleetStatusChart - shows "No manifests created"
- [ ] All other charts/tables handle empty gracefully

### Modules to Verify
- [ ] Analytics
- [ ] Operations
- [ ] Tracking
- [ ] Inventory
- [ ] Exceptions
- [ ] Business
- [ ] Management

---

## ✅ Database Safety

### Migration Execution
- [ ] Run migration: `012_enforce_imf_hub_codes.sql`
- [ ] Verify IXA→IMF data migration
- [ ] Verify CHECK constraints active

**Run Migration**:
```bash
npx supabase db push
```

**Verify**:
```sql
-- Should return 0
SELECT COUNT(*) FROM shipments WHERE origin_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');
SELECT COUNT(*) FROM manifests WHERE from_hub_id = (SELECT id FROM hubs WHERE code = 'IXA');

-- Should fail (constraint violation)
INSERT INTO shipments (origin_hub_id, ...) VALUES ((SELECT id FROM hubs WHERE code = 'IXA'), ...);
```

---

## ✅ Automated Guards

### Audit Script
- [x] Created: `scripts/audit-hub-codes.js`
- [ ] Passes locally: `node scripts/audit-hub-codes.js`
- [ ] Integrated into CI workflow

### E2E Tests
- [x] Created: `tests/e2e/production-readiness.spec.ts`
- [ ] All tests pass locally
- [ ] Tests verify:
  - [ ] No IXA in UI
  - [ ] No mock data visible
  - [ ] Empty states render correctly
  - [ ] Invoice → Label → Manifest works
  - [ ] No React crashes

**Run E2E**:
```bash
npm run test
```

---

## ✅ Manual Production Smoke Test

### Test Scenario
1. [ ] Create first real customer
2. [ ] Create Invoice
3. [ ] Download Invoice PDF
4. [ ] Print Label PDF
5. [ ] Create Manifest
6. [ ] Verify route: IMF → DEL (or other valid route)

### PDF Inspection
- [ ] Invoice PDF shows IMF (not IXA)
- [ ] Label PDF shows IMF (not IXA)
- [ ] Manifest shows correct hub codes

---

## ✅ Code Quality

### TypeScript
- [ ] No type errors: `npm run typecheck`
- [ ] No lint errors: `npm run lint`

### Tests
- [ ] Unit tests pass: `npm run test:unit`
- [ ] E2E tests pass: `npm run test`

---

## ✅ Git & PR Preparation

### Commit Strategy
Use atomic commits:
```
fix(domain): enforce IMF hub code
fix(flow): stabilize invoice-label-manifest
fix(ui): remove mock dashboard data
fix(manifest): resolve React crash on hub dropdown
chore(db): add hub code CHECK constraints
test(e2e): add production readiness validation
```

### PR Title
```
Stabilize Core User Flows, Remove Mock Data & Enforce IMF Hub Code
```

### PR Description
```markdown
## Summary
Converts TAC Cargo dashboard from MVP/demo state to production-ready system.

## Changes
- ✅ Fixed broken Invoice → Label → Manifest flow
- ✅ Replaced IXA with IMF hub code (domain enforcement)
- ✅ Removed all mock data from Dashboard
- ✅ Added empty state handling
- ✅ Fixed React crash in Manifest creation
- ✅ Added database CHECK constraints
- ✅ Created audit script and E2E tests

## Testing
- All work done locally first
- Database migration tested
- E2E tests pass
- Audit script passes
- Manual smoke test completed

## Scope
No redesigns or scope creep - minimal changes to fix critical issues only.

Ref: TAC_CARGO_FULL_PRODUCTION_READINESS_EXECUTION.md
```

---

## ✅ Final Acceptance Criteria

### All Required Before Push
- [ ] All critical user flows work
- [ ] No React crashes
- [ ] No mock data anywhere
- [ ] Empty states render correctly
- [ ] No IXA in repo or DB
- [ ] DB constraints active
- [ ] Audit script passes
- [ ] Playwright E2E passes
- [ ] Ready for CodeRabbit review

---

## 🚫 FINAL RULE

**❌ Do not push to Git**  
**❌ Do not open PR**

...until every checkbox above is complete.

---

## Next Steps

1. Run all checks locally
2. Fix any failing tests
3. Complete manual smoke test
4. Verify with team
5. Open PR with documentation attached
6. Request CodeRabbit review
