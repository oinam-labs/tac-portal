---
description: Documentation policy for maintaining accurate project docs
activation: always
---

# Documentation Policy Rule

## Why This Rule Exists
TAC Cargo is an enterprise system with multiple stakeholders (developers, operators, managers). Outdated or missing documentation causes:
- Onboarding delays for new developers
- Operational mistakes from incorrect procedures
- Support overhead from repeated questions
- Technical debt from forgotten decisions

This rule ensures documentation stays current.

---

## Documentation Structure

```
docs/
├── PRD/                    # Product requirements
│   ├── overview.md
│   ├── invoices.md
│   ├── manifests.md
│   └── ...
├── tasks/                  # Implementation tasks
│   ├── completed/
│   └── in-progress/
├── architecture/           # Technical architecture
│   ├── database.md
│   ├── auth.md
│   └── ...
├── api/                    # API documentation
│   └── supabase-schema.md
└── guides/                 # How-to guides
    ├── setup.md
    ├── deployment.md
    └── testing.md
```

---

## When to Update Docs

### Always Update
| Change Type | Doc to Update |
|-------------|---------------|
| New feature | PRD + relevant module doc |
| Schema change | `docs/architecture/database.md` |
| New service method | Inline JSDoc + service doc |
| API change | `docs/api/` |
| Config change | `README.md` or setup guide |

### Document These Decisions
- Why a particular approach was chosen
- Trade-offs considered
- Known limitations
- Future improvement ideas

---

## Documentation Standards

### Markdown Formatting
```markdown
# Page Title

## Section Header

### Subsection

- Bullet point
- Another point

1. Numbered list
2. Second item

`inline code` for variables, functions, files

​```typescript
// Code block for examples
const example = 'code';
​```

| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |

> Note: Important callout
```

### Required Sections for Feature Docs
1. **Overview**: What the feature does
2. **User Stories**: Who uses it and why
3. **Technical Design**: How it works
4. **Database Schema**: Tables involved
5. **API/Service Methods**: Key functions
6. **UI Components**: Relevant pages/components
7. **Testing**: How to test it
8. **Known Issues**: Current limitations

---

## Inline Documentation

### JSDoc for Services
```typescript
/**
 * Creates a new invoice for a shipment.
 * Invoice number is generated server-side via DB trigger.
 * 
 * @param invoice - Invoice data without org_id and invoice_no
 * @returns Created invoice with generated invoice_no
 * @throws {ValidationError} If required fields are missing
 * @throws {ConflictError} If shipment already has an invoice
 * 
 * @example
 * const invoice = await invoiceService.create({
 *   customer_id: 'uuid',
 *   shipment_id: 'uuid',
 *   line_items: [{ description: 'Shipping', amount: 500 }],
 * });
 */
async create(invoice: Omit<InvoiceInsert, 'org_id' | 'invoice_no'>): Promise<Invoice>
```

### Component Documentation
```typescript
/**
 * Displays shipment status with appropriate color coding.
 * 
 * @param status - Current shipment status
 * @param size - Badge size variant
 * 
 * @example
 * <StatusBadge status="IN_TRANSIT" />
 * <StatusBadge status="DELIVERED" size="lg" />
 */
export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
```

---

## README Requirements

The root `README.md` must include:

1. **Project Overview**: What TAC Cargo is
2. **Tech Stack**: Framework, database, tools
3. **Prerequisites**: Node version, env vars
4. **Setup Instructions**: Step-by-step local setup
5. **Available Scripts**: npm commands
6. **Project Structure**: Key directories explained
7. **Contributing**: How to contribute
8. **License**: License information

---

## Change Documentation Format

When making changes that affect behavior, document:

```markdown
## Change: [Brief Description]

**Date**: YYYY-MM-DD
**Author**: [Name/Handle]
**PR/Commit**: [Reference]

### What Changed
[Description of the change]

### Why
[Reason for the change]

### How to Verify
[Steps to test the change]

### Migration (if applicable)
[Any data migration or upgrade steps]

### Rollback
[How to revert if needed]
```

---

## API Documentation

### Service Method Documentation
```markdown
## invoiceService.create

Creates a new invoice.

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| customer_id | uuid | Yes | Customer ID |
| shipment_id | uuid | Yes | Shipment ID |
| line_items | array | Yes | Invoice line items |

### Returns
`Invoice` object with generated `invoice_no`

### Errors
| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Missing required fields |
| CONFLICT_ERROR | Shipment already invoiced |

### Example
​```typescript
const invoice = await invoiceService.create({
  customer_id: 'uuid',
  shipment_id: 'uuid',
  line_items: [{ description: 'Shipping', amount: 500 }],
});
// Returns: { id: 'uuid', invoice_no: 'INV-2026-0001', ... }
​```
```

---

## Task Documentation

For implementation tasks in `docs/tasks/`:

```markdown
# Task: [Feature/Fix Name]

## Status: [In Progress | Completed | Blocked]

## Overview
[What needs to be done]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Technical Approach
[How it will be implemented]

## Files Changed
- `lib/services/invoiceService.ts`
- `hooks/useInvoices.ts`

## Testing
- [ ] Unit tests added
- [ ] E2E test added
- [ ] Manual QA completed

## Notes
[Any additional context]
```

---

## Documentation Review Checklist

Before PR merge, verify:
- [ ] README updated if setup changed
- [ ] JSDoc added for new functions
- [ ] PRD updated if behavior changed
- [ ] API docs updated if endpoints changed
- [ ] Migration notes added if schema changed
- [ ] Change log entry added
