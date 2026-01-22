---
description: Invoice and PDF regression testing workflow
---

# /invoice-regression — Invoice Regression Testing

## Goal
Verify invoice functionality including number generation, calculations, and PDF output remain correct after changes.

## Preconditions
- Test customer exists
- Test shipment exists
- Dev environment configured

## Steps

### Step 1: Invoice Number Generation Test
```markdown
## Test: Invoice Number Format

### Steps
1. Create new invoice via UI or service
2. Observe generated invoice_no

### Expected
- Format: `INV-YYYY-NNNN`
- Year matches current year
- Number increments from last
- No gaps in sequence (within org)

### Result
- [ ] PASS / FAIL
- Actual value: ___________
```

### Step 2: Invoice Calculation Test
```markdown
## Test: Invoice Calculations

### Test Data
| Line Item | Amount |
|-----------|--------|
| Freight | 500 |
| Handling | 100 |
| Insurance | 50 |

Tax Rate: 18%
Discount: 50

### Expected Calculations
- Subtotal: 650
- Tax: 117 (650 × 0.18)
- Total: 717 (650 + 117 - 50)

### Steps
1. Create invoice with test data
2. Verify subtotal
3. Verify tax amount
4. Verify total

### Result
- [ ] Subtotal correct
- [ ] Tax correct
- [ ] Total correct
```

### Step 3: Invoice Status Transitions
```markdown
## Test: Status Transitions

### Valid Transitions
- ISSUED → PAID ✓
- ISSUED → CANCELLED ✓
- PAID → (nothing) ✓
- CANCELLED → (nothing) ✓

### Steps
1. Create invoice (status: ISSUED)
2. Mark as paid (status: PAID)
3. Verify cannot change status

### Alternate Path
1. Create invoice (status: ISSUED)
2. Cancel invoice (status: CANCELLED)
3. Verify cannot change status

### Result
- [ ] All transitions work correctly
- [ ] Terminal states are enforced
```

### Step 4: PDF Generation Test
```markdown
## Test: Invoice PDF

### Steps
1. Create invoice with all fields populated
2. Generate PDF
3. Open PDF and verify

### Checklist
- [ ] Invoice number renders correctly (top-right)
- [ ] Date format: DD MMM YYYY
- [ ] Customer details correct
  - [ ] Name
  - [ ] Address
  - [ ] Phone
  - [ ] GSTIN (if applicable)
- [ ] Line items table
  - [ ] Description column
  - [ ] Amount column
  - [ ] Rows match data
- [ ] Totals section
  - [ ] Subtotal
  - [ ] Tax (labeled with rate)
  - [ ] Discount (if applicable)
  - [ ] Total (bold)
- [ ] Currency format: Rs. X,XXX.XX
- [ ] Printable on A4 paper

### Result
- [ ] PASS / FAIL
- Notes: ___________
```

### Step 5: Edge Cases
```markdown
## Edge Case Tests

### Long Customer Name
- [ ] Name truncates or wraps correctly

### Large Amounts
- [ ] Formatting handles amounts > 1,00,000

### Zero Values
- [ ] Zero discount handled
- [ ] Zero tax handled

### Special Characters
- [ ] Customer name with special chars
- [ ] Address with special chars
```

### Step 6: Run Automated Tests
```bash
// turbo
npm run test:unit -- --grep "invoice"

npm run test -- --grep "Invoice"
```

## Output Format

```markdown
## Invoice Regression Report — [Date]

### Number Generation
- [ ] Format correct: INV-YYYY-NNNN
- [ ] Sequential numbering
- Sample: INV-2026-0001

### Calculations
| Field | Expected | Actual | Status |
|-------|----------|--------|--------|
| Subtotal | 650 | 650 | ✅ |
| Tax | 117 | 117 | ✅ |
| Total | 717 | 717 | ✅ |

### Status Transitions
- [x] ISSUED → PAID: Works
- [x] ISSUED → CANCELLED: Works
- [x] Terminal states enforced

### PDF Output
- [x] Invoice number: Correct
- [x] Customer details: Correct
- [x] Line items: Correct
- [x] Totals: Correct
- [x] Currency format: Correct

### Edge Cases
- [x] Long names: Handled
- [x] Large amounts: Handled
- [x] Zero values: Handled

### Automated Tests
- Unit: X/X passed
- E2E: X/X passed

### Issues Found
[None / List issues]

### Verdict: PASS / FAIL
```

## Risk/Rollback
- Risk: Invoice changes are critical - incorrect invoices cause financial issues
- Rollback: Revert immediately if any calculation or number generation fails
