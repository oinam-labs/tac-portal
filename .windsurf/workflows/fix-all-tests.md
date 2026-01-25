---
description: Comprehensive Playwright test suite fix - XPath, encoding, selectors
---

# Comprehensive Test Suite Fix Workflow

## Objective
Fix all 62 Playwright tests to work with HashRouter, proper selectors, and UTF-8 encoding.

## Issues to Fix

### 1. XPath Selector Brittleness
Many tests use fragile XPath selectors like:
```python
xpath=html/body/div/div/div/main/div/div[3]/form/div[2]/input
```

**Fix**: Replace with semantic data-testid selectors

### 2. Unicode Encoding Errors
Tests crash with: `'charmap' codec can't encode character '\u274c'`

**Fix**: Add UTF-8 encoding at top of each test file

### 3. Login Form Selectors
Generic selectors fail after HashRouter fix:
```python
input[type="email"]  # Too generic
```

**Fix**: Use specific data-testid attributes

## Step-by-Step Fix Process

### Step 1: Create Advanced Batch Fix Script
```powershell
python testsprite_tests/comprehensive_fix.py
```

This script will:
- Add UTF-8 encoding headers
- Replace XPath selectors with data-testid
- Fix HashRouter URLs (/#/)
- Add React hydration checks
- Update login form selectors

### Step 2: Fix Individual Test Categories

#### Authentication Tests (TC001, TC002)
- Use `[data-testid="login-email-input"]`
- Use `[data-testid="login-password-input"]`
- Use `[data-testid="login-submit-button"]`

#### Dashboard Tests (TC003, TC008, TC009)
- Use `[data-testid="dashboard-page"]`
- Wait for KPI cards to load
- Handle real-time subscription delays

#### Shipment Tests (TC001-TC005)
- Navigate to `/#/shipments`
- Use `[data-testid="new-shipment-button"]`
- Use `[data-testid="create-shipment-modal"]`
- Click label text for hidden radio buttons

#### Manifest Tests (TC003, TC006, TC012)
- Navigate to `/#/manifests`
- Use proper modal selectors
- Handle async shipment loading

#### Scanning Tests (TC004, TC007, TC008, TC013)
- Navigate to `/#/scanning`
- Use barcode input selectors
- Handle offline queue UI

#### Invoice Tests (TC005, TC006, TC009)
- Navigate to `/#/finance`
- Use invoice form selectors
- Handle PDF generation async

### Step 3: Run Verification
```powershell
python testsprite_tests/verify_fixes.py
```

### Step 4: Run Full Suite
```powershell
python run_all_tests.py
```

### Step 5: Analyze Failures
For each failing test:
1. Check if it's infrastructure (selectors, routing)
2. Check if it's business logic (missing data, validation)
3. Fix infrastructure issues immediately
4. Document business logic issues for later

## Expected Outcomes

### Infrastructure Fixes (Should Pass)
- ✅ Authentication success/failure
- ✅ Dashboard KPI display
- ✅ Basic navigation
- ✅ Form rendering
- ✅ Modal interactions

### Business Logic Issues (May Fail)
- ❌ Shipment creation (needs customer data)
- ❌ Manifest dispatch (needs shipments)
- ❌ Invoice PDF (needs backend setup)
- ❌ Exception handling (needs error states)
- ❌ Audit logs (needs mutations)

## Files to Create/Modify

1. `testsprite_tests/comprehensive_fix.py` - Advanced batch fix script
2. All `TC*.py` files - Add encoding, fix selectors
3. `run_all_tests.py` - Already has UTF-8 support
4. `TEST_FIX_SUMMARY.md` - Update with results

## Success Criteria

- **Minimum**: 10+ tests passing (infrastructure tests)
- **Target**: 30+ tests passing (all infrastructure + some business logic)
- **Stretch**: 50+ tests passing (most business logic working)

## Troubleshooting

### Test still fails with XPath error
- Search test file for `xpath=`
- Replace with proper CSS selector or data-testid
- Check if element exists in current UI

### Test fails with "element not visible"
- Add `await page.wait_for_selector(selector, state='visible')`
- Increase timeout for slow-loading components
- Check if modal/dialog is blocking element

### Test fails with Unicode error
- Verify UTF-8 encoding at top of file
- Check `run_all_tests.py` has `PYTHONIOENCODING='utf-8'`
- Run individual test with `$env:PYTHONIOENCODING='utf-8'`

### Test fails with business logic error
- Check if test data exists (customers, shipments)
- Verify user permissions match test requirements
- Check database constraints (unique AWB, etc.)

## Next Steps After Workflow

1. **Seed Test Database**
   - Create consistent test customers
   - Create sample shipments in various states
   - Create manifests for dispatch tests

2. **Add Test Data Fixtures**
   - Create `testsprite_tests/fixtures.py`
   - Add setup/teardown for each test category
   - Ensure idempotent test runs

3. **CI/CD Integration**
   - Add GitHub Actions workflow
   - Run tests on every PR
   - Generate test reports

4. **Maintenance**
   - Keep selectors in sync with UI changes
   - Add new tests for new features
   - Refactor common patterns into helpers
