---
name: tac-invoice-validator
description: Validates invoice creation logic, calculations, and data integrity for TAC Portal. Use when creating/modifying invoice components, checking calculation accuracy, or ensuring compliance with logistics industry standards.
---

# TAC Invoice Validator

## Purpose
Ensures invoice creation adheres to strict financial accuracy, regulatory compliance, and business rules specific to freight logistics.

## Critical Validation Rules

### 1. AWB Number Format
```typescript
// MUST match pattern
const AWB_PATTERN = /^TAC\d{8}$/;

// Example: TAC48878789
// ❌ REJECT: tac123 (lowercase, too short)
// ❌ REJECT: TAC-48878789 (contains hyphen)
// ✅ ACCEPT: TAC48878789
```

### 2. Invoice Number Sequencing
```typescript
// CRITICAL: No gaps allowed
// If last invoice = INV-2026-6772
// Next MUST be = INV-2026-6773

// Check for gaps:
SELECT invoice_no FROM invoices 
ORDER BY created_at DESC LIMIT 100;

// Verify sequential increment
```

### 3. GST Calculation Precision
```typescript
// Formula (EXACT):
const gstAmount = Math.round(subtotal * (gstRate / 100));

```typescript
// Test cases:
subtotal = 1000, rate = 18 → tax = 180 ✅
subtotal = 999.50, rate = 18 → tax = 180 (not 179.91) ✅
subtotal = 1234.56, rate = 12 → tax = 148 ✅

// ❌ REJECT: Using toFixed() or floating-point
const wrong = (subtotal * 0.18).toFixed(2); // Precision loss!

// ✅ ACCEPT: Math.round for integer rupees
const correct = Math.round(subtotal * 0.18);
```

### 4. Amount Validation
```typescript
// ALL amounts MUST be >= 0
const FORBIDDEN_NEGATIVES = [
  'baseFreight',
  'docketCharge',
  'pickupCharge',
  'fuelSurcharge',
  'discount',
  'total'
];

// Exception: 'balance' can be negative (advance > total)
```

### 5. Shipment Status Integrity
```typescript
// Cannot create invoice for:
- CANCELLED shipments
- DRAFT shipments (not yet confirmed)

// Only valid statuses:
- CREATED
- IN_TRANSIT
- DELIVERED
```

---

## Validation Script

**Usage**:
```bash
python scripts/validate_invoice.py <invoice_json_file>
```

**Script Logic** (`scripts/validate_invoice.py`):
1. Parse JSON invoice data
2. Run ALL validation rules above
3. Exit Code 0 = Valid, Exit Code 1 = Invalid
4. Print specific errors

**Example Output** (Invalid):
```
ERROR: AWB 'tac12345' does not match pattern TAC\d{8}
ERROR: GST calculation incorrect. Expected 180, got 179.91
ERROR: Negative amount detected: discount = -50
VALIDATION FAILED
```

---

## Business Logic Rules

### Freight Calculation
```typescript
// Chargeable Weight = MAX(actualWeight, volumetricWeight)
const volumetric = (L * W * H * pieces) / 5000; // cm³ → kg
const chargeable = Math.max(actual, volumetric);
const baseFreight = chargeable * ratePerKg;
```

### Payment Mode Rules
```typescript
//

 "TO_PAY" (Collect): Invoice sent to consignee
// "PAID": Invoice sent to consignor
// "TBB" (To Be Billed): Corporate accounts only

if (paymentMode === 'TBB' && customer.tier !== 'ENTERPRISE') {
  throw new Error('TBB only allowed for Enterprise customers');
}
```

### Discount Limits
```typescript
// Max discount: 25% of subtotal
if (discount > subtotal * 0.25) {
  throw new Error(`Discount exceeds 25% limit`);
}

// Manager approval required for > 15%
if (discount > subtotal * 0.15) {
  requireApproval('MANAGER');
}
```

---

## Integration Points

### Database Triggers (Supabase)
```sql
-- Ensure invoice number is sequential
CREATE OR REPLACE FUNCTION check_invoice_sequence()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoice_no > NEW.invoice_no
  ) THEN
    RAISE EXCEPTION 'Invoice number must be greater than all existing';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Pre-Submit Checklist
Before calling `createInvoice()`:
- [ ] All required fields populated
- [ ] Calculations validated
- [ ] Customer exists and is active
- [ ] Shipment exists and is not cancelled
- [ ] User has permission to create invoices

---

## Common Errors & Fixes

**Error**: "GST calculation mismatch"
```typescript
// ❌ Wrong
tax = subtotal * (gstRate / 100);

// ✅ Correct
tax = Math.round(subtotal * (gstRate / 100));
```

**Error**: "AWB already exists"
```typescript
// Check before insert
const existing = await supabase
  .from('invoices')
  .select('id')
  .eq('awb', awbNumber)
  .single();

if (existing.data) throw new Error('Duplicate AWB');
```

**Error**: "Total doesn't match sum"
```typescript
// Verify calculation
const calculatedTotal = subtotal + tax - discount;
if (Math.abs(calculatedTotal - total) > 0.01) {
  throw new Error('Total mismatch');
}
```

---

## Regulatory Compliance

### GST Requirements (India)
- GSTIN must be 15 characters: `07AABCU9603R1Z2`
- Format: `\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}`
- Validate checksum digit (last character)

### E-Way Bill
```typescript
// Required if:
- Invoice value > ₹50,000 OR
- Interstate shipment of goods

// Generate before dispatch
if (total > 50000 || isInterstate) {
  generateEWayBill(invoice);
}
```

---

## Testing

Run comprehensive tests:
```bash
npm run test -- invoice.test.ts --coverage
```

**Test Suite**:
```typescript
describe('Invoice Validation', () => {
  test('rejects negative amounts', () => {
    expect(() => validateInvoice({ discount: -100 }))
      .toThrow('Negative amounts not allowed');
  });

  test('validates GST calculation', () => {
    const result = calculateGST(1000, 18);
    expect(result).toBe(180);
  });

  test('enforces AWB format', () => {
    expect(isValidAWB('TAC48878789')).toBe(true);
    expect(isValidAWB('tac123')).toBe(false);
  });
});
```

---

## When to Use This Skill

- "Validate this invoice"
- "Check invoice calculations"
- "Is this GST amount correct?"
- "Review invoice creation logic"
- "Ensure financial accuracy"
