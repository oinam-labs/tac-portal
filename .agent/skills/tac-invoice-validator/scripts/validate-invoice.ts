/**
 * TAC Invoice Validation Script
 * 
 * Validates invoice data against business rules and regulatory requirements.
 * Run: npx ts-node scripts/validate-invoice.ts <invoice-json>
 */

import { z } from 'zod';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const AWB_PATTERN = /^TAC\d{8}$/;
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_PATTERN = /^(\+91)?[6-9]\d{9}$/;

const financialsSchema = z.object({
    ratePerKg: z.number().nonnegative(),
    baseFreight: z.number().nonnegative(),
    docketCharge: z.number().nonnegative(),
    pickupCharge: z.number().nonnegative(),
    packingCharge: z.number().nonnegative(),
    fuelSurcharge: z.number().nonnegative(),
    handlingFee: z.number().nonnegative(),
    insurance: z.number().nonnegative(),
    tax: z.object({
        cgst: z.number().nonnegative(),
        sgst: z.number().nonnegative(),
        igst: z.number().nonnegative(),
        total: z.number().nonnegative(),
    }),
    discount: z.number().nonnegative(),
    totalAmount: z.number().positive('Total must be positive'),
    advancePaid: z.number().nonnegative(),
    balance: z.number(), // Can be negative (overpaid)
});

const invoiceSchema = z.object({
    id: z.string().uuid(),
    invoiceNumber: z.string().regex(/^INV-\d{4}-\d+$/, 'Invalid invoice number format'),
    awb: z.string().regex(AWB_PATTERN, 'AWB must be TAC followed by 8 digits'),
    customerId: z.string().uuid(),
    customerName: z.string().min(2),
    status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'OVERDUE']),
    paymentMode: z.enum(['PAID', 'TO_PAY', 'TBB']),
    financials: financialsSchema,
    consignor: z.object({
        name: z.string().min(2),
        phone: z.string().regex(PHONE_PATTERN, 'Invalid phone number'),
        address: z.string().min(10),
        gstin: z.string().regex(GSTIN_PATTERN).optional(),
    }),
    consignee: z.object({
        name: z.string().min(2),
        phone: z.string().regex(PHONE_PATTERN, 'Invalid phone number'),
        address: z.string().min(10),
        gstin: z.string().regex(GSTIN_PATTERN).optional(),
    }),
    createdAt: z.string().datetime(),
    dueDate: z.string().datetime(),
});

// ============================================================
// BUSINESS RULES VALIDATION
// ============================================================

interface ValidationError {
    field: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
}

function validateBusinessRules(invoice: z.infer<typeof invoiceSchema>): ValidationError[] {
    const errors: ValidationError[] = [];
    const { financials } = invoice;

    // Rule 1: GST Calculation Accuracy
    const subtotal =
        financials.baseFreight +
        financials.docketCharge +
        financials.pickupCharge +
        financials.packingCharge +
        financials.fuelSurcharge +
        financials.handlingFee +
        financials.insurance;

    const expectedGst = Math.round(subtotal * 0.18); // Assuming 18% GST
    const actualGst = financials.tax.total;

    if (Math.abs(expectedGst - actualGst) > 1) {
        errors.push({
            field: 'financials.tax.total',
            message: `GST mismatch: expected ${expectedGst}, got ${actualGst}`,
            severity: 'ERROR',
        });
    }

    // Rule 2: CGST + SGST should equal total (for intrastate)
    // OR IGST should equal total (for interstate)
    const cgstSgstTotal = financials.tax.cgst + financials.tax.sgst;
    if (financials.tax.igst === 0 && cgstSgstTotal !== financials.tax.total) {
        errors.push({
            field: 'financials.tax',
            message: 'CGST + SGST must equal total tax for intrastate',
            severity: 'ERROR',
        });
    }
    if (financials.tax.igst > 0 && cgstSgstTotal > 0) {
        errors.push({
            field: 'financials.tax',
            message: 'Cannot have both IGST and CGST/SGST',
            severity: 'ERROR',
        });
    }

    // Rule 3: Total Amount Calculation
    const expectedTotal = subtotal + financials.tax.total - financials.discount;
    if (Math.abs(expectedTotal - financials.totalAmount) > 1) {
        errors.push({
            field: 'financials.totalAmount',
            message: `Total mismatch: expected ${expectedTotal}, got ${financials.totalAmount}`,
            severity: 'ERROR',
        });
    }

    // Rule 4: Balance Calculation
    const expectedBalance = financials.totalAmount - financials.advancePaid;
    if (Math.abs(expectedBalance - financials.balance) > 1) {
        errors.push({
            field: 'financials.balance',
            message: `Balance mismatch: expected ${expectedBalance}, got ${financials.balance}`,
            severity: 'ERROR',
        });
    }

    // Rule 5: Discount Limits (max 25%)
    const maxDiscount = subtotal * 0.25;
    if (financials.discount > maxDiscount) {
        errors.push({
            field: 'financials.discount',
            message: `Discount exceeds 25% limit (max: ${maxDiscount})`,
            severity: 'ERROR',
        });
    }

    // Rule 6: Discount > 15% needs manager approval
    if (financials.discount > subtotal * 0.15) {
        errors.push({
            field: 'financials.discount',
            message: 'Discount > 15% requires manager approval',
            severity: 'WARNING',
        });
    }

    // Rule 7: TBB only for enterprise customers (would need customer tier check)
    // This would require fetching customer data

    // Rule 8: Due date must be in the future for non-PAID invoices
    if (invoice.status !== 'PAID' && invoice.status !== 'CANCELLED') {
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < new Date()) {
            errors.push({
                field: 'dueDate',
                message: 'Due date is in the past',
                severity: 'WARNING',
            });
        }
    }

    // Rule 9: E-Way Bill required for > ₹50,000
    if (financials.totalAmount > 50000) {
        errors.push({
            field: 'eWayBill',
            message: 'E-Way Bill required for invoices > ₹50,000',
            severity: 'WARNING',
        });
    }

    return errors;
}

// ============================================================
// GSTIN VALIDATION
// ============================================================

function validateGSTIN(gstin: string): boolean {
    if (!GSTIN_PATTERN.test(gstin)) {
        return false;
    }

    // Checksum validation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sum = 0;

    for (let i = 0; i < 14; i++) {
        const char = gstin[i];
        const pos = chars.indexOf(char);
        const factor = (i % 2 === 0) ? 1 : 2;
        const product = pos * factor;
        sum += Math.floor(product / 36) + (product % 36);
    }

    const checkDigit = chars[(36 - (sum % 36)) % 36];
    return gstin[14] === checkDigit;
}

// ============================================================
// MAIN VALIDATION FUNCTION
// ============================================================

export interface ValidationResult {
    valid: boolean;
    schemaErrors: z.ZodError | null;
    businessErrors: ValidationError[];
    warnings: ValidationError[];
}

export function validateInvoice(data: unknown): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        schemaErrors: null,
        businessErrors: [],
        warnings: [],
    };

    // Step 1: Schema validation
    const schemaResult = invoiceSchema.safeParse(data);
    if (!schemaResult.success) {
        result.valid = false;
        result.schemaErrors = schemaResult.error;
        return result;
    }

    // Step 2: Business rules validation
    const businessErrors = validateBusinessRules(schemaResult.data);
    result.businessErrors = businessErrors.filter(e => e.severity === 'ERROR');
    result.warnings = businessErrors.filter(e => e.severity === 'WARNING');

    if (result.businessErrors.length > 0) {
        result.valid = false;
    }

    // Step 3: GSTIN validation
    const { consignor, consignee } = schemaResult.data;
    if (consignor.gstin && !validateGSTIN(consignor.gstin)) {
        result.businessErrors.push({
            field: 'consignor.gstin',
            message: 'Invalid GSTIN checksum',
            severity: 'ERROR',
        });
        result.valid = false;
    }
    if (consignee.gstin && !validateGSTIN(consignee.gstin)) {
        result.businessErrors.push({
            field: 'consignee.gstin',
            message: 'Invalid GSTIN checksum',
            severity: 'ERROR',
        });
        result.valid = false;
    }

    return result;
}

// ============================================================
// CLI RUNNER
// ============================================================

if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: npx ts-node validate-invoice.ts <invoice.json>');
        process.exit(1);
    }

    const fs = require('fs');
    const path = require('path');

    try {
        const filePath = path.resolve(args[0]);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        const result = validateInvoice(data);

        console.log('\n📋 INVOICE VALIDATION REPORT\n');
        console.log('='.repeat(50));

        if (result.schemaErrors) {
            console.log('\n❌ SCHEMA ERRORS:\n');
            result.schemaErrors.errors.forEach(err => {
                console.log(`  • ${err.path.join('.')}: ${err.message}`);
            });
        }

        if (result.businessErrors.length > 0) {
            console.log('\n❌ BUSINESS RULE ERRORS:\n');
            result.businessErrors.forEach(err => {
                console.log(`  • ${err.field}: ${err.message}`);
            });
        }

        if (result.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:\n');
            result.warnings.forEach(err => {
                console.log(`  • ${err.field}: ${err.message}`);
            });
        }

        console.log('\n' + '='.repeat(50));
        console.log(result.valid ? '\n✅ VALIDATION PASSED' : '\n❌ VALIDATION FAILED');

        process.exit(result.valid ? 0 : 1);

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
