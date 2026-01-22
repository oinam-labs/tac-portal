---
name: tac-exceptions
description: Exception handling operations - creation, assignment, resolution workflow.
version: 2.0.0
tags: [tac, exceptions, errors, recovery]
---

# Exception Handling Skill

## Purpose
Handle operational exceptions (conflicts, errors, anomalies) through a structured workflow that ensures no data is lost and all issues are tracked to resolution.

## Preconditions
- [ ] Understanding of exception types and severities
- [ ] Access to `exceptionService.ts` and `useExceptions.ts`
- [ ] Test shipments available for exception creation

## Exception Types

| Type | Description | Severity |
|------|-------------|----------|
| `UNKNOWN_SHIPMENT` | Scanned AWB not in system | MEDIUM |
| `UNEXPECTED_SCAN` | Scan conflicts with status | MEDIUM |
| `DAMAGED` | Package damage reported | HIGH |
| `MISSING` | Package missing from manifest | CRITICAL |
| `ADDRESS_ISSUE` | Delivery address problem | MEDIUM |
| `WEIGHT_MISMATCH` | Actual vs declared weight | LOW |

## Exception Statuses

| Status | Description | Next |
|--------|-------------|------|
| `OPEN` | New exception | IN_PROGRESS |
| `IN_PROGRESS` | Being investigated | RESOLVED |
| `RESOLVED` | Issue fixed | CLOSED |
| `CLOSED` | Archived | Terminal |

## Step-by-Step Procedures

### Creating an Exception
```typescript
const exception = await exceptionService.create({
  shipment_id: shipmentId,
  type: 'DAMAGED',
  severity: 'HIGH',
  description: 'Package found with torn packaging at hub',
  reported_by_staff_id: staffId,
  images: [imageUrl1, imageUrl2], // Optional evidence
});
// Shipment status automatically set to EXCEPTION
```

### Assigning Exception
```typescript
await exceptionService.assign(exceptionId, assignedStaffId);
// Status changes to IN_PROGRESS
```

### Resolving Exception
```typescript
await exceptionService.resolve(exceptionId, 'Package repacked and verified');
// Status changes to RESOLVED
// Shipment status reverts to RECEIVED
```

### Closing Exception
```typescript
await exceptionService.close(exceptionId);
// Status changes to CLOSED (archived)
```

## Exception Routing Rules

**NEVER discard anomalies.** Always create exceptions:

```typescript
// Scan after delivery
if (shipment.status === 'DELIVERED') {
  await exceptionService.create({
    shipment_id: shipment.id,
    type: 'UNEXPECTED_SCAN',
    severity: 'MEDIUM',
    description: `Unexpected scan after delivery`,
  });
}

// Unknown AWB
if (!shipment) {
  await exceptionService.create({
    type: 'UNKNOWN_SHIPMENT',
    severity: 'MEDIUM',
    description: `Unknown AWB scanned: ${awb}`,
  });
}
```

## Required Information

Every exception must include:
- [ ] Shipment ID (if known)
- [ ] Exception type
- [ ] Severity level
- [ ] Description of issue
- [ ] Reporter staff ID
- [ ] Images (for damage/physical issues)

## Common Failure Modes

| Issue | Cause | Prevention |
|-------|-------|------------|
| Orphaned shipment | Exception not linked | Always include shipment_id |
| Lost context | No description | Require detailed description |
| Unassigned | No owner | Auto-assign based on rules |
| Stale | Never resolved | SLA monitoring |

## Required Tests

```bash
# Exception service tests
npm run test:unit -- --grep "exception"

# E2E exception flow
npm run test -- --grep "Exception"
```

## Files Reference

| File | Purpose |
|------|---------|
| `lib/services/exceptionService.ts` | CRUD operations |
| `hooks/useExceptions.ts` | React Query hooks |
| `pages/Exceptions.tsx` | Exception queue UI |

## Output Format

```markdown
## Exception Operation Result

### Action: [Create/Assign/Resolve]
- Exception ID: `uuid`
- Type: [DAMAGED/MISSING/etc]
- Severity: [LOW/MEDIUM/HIGH/CRITICAL]
- Status: [OPEN/IN_PROGRESS/RESOLVED]

### Linked Shipment
- AWB: TAC12345678
- Previous Status: [status]
- Current Status: EXCEPTION

### Resolution (if resolved)
- Resolution: [description]
- Resolved by: [staff]
