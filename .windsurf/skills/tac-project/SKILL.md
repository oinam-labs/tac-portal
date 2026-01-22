---
name: tac-project
description: Master skill for TAC Cargo context, core modules, standards, and safe editing practices.
version: 2.0.0
tags: [tac, logistics, enterprise, safety, vite, react]
---

# TAC Cargo Master Skill (Vite SPA)

## Purpose
Provide comprehensive context for working on TAC Cargo, an enterprise logistics operations platform. This skill ensures all modifications follow established patterns and maintain system integrity.

## Preconditions
- [ ] Repository cloned and dependencies installed
- [ ] Environment variables configured (`.env.local`)
- [ ] Supabase project accessible
- [ ] Understanding of logistics domain terminology

## Stack Constraints (Non-Negotiable)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Vite + React 19 + TypeScript | SPA only, NO SSR |
| Router | react-router-dom | Client-side routing |
| Database | Supabase (PostgreSQL) | With RLS policies |
| Server State | TanStack React Query | Caching, mutations |
| Client State | Zustand | Persisted stores |
| UI | Tailwind v4 + Radix + shadcn | Component library |
| Animations | Framer Motion + GSAP | Subtle effects only |
| Testing | Vitest + Playwright | Unit + E2E |
| Observability | Sentry | Error tracking |

## Core Modules

| Module | Service | Hook | Page |
|--------|---------|------|------|
| **Invoices** | invoiceService.ts | useInvoices.ts | Finance.tsx |
| **Customers** | customerService.ts | useCustomers.ts | Customers.tsx |
| **Shipments** | shipmentService.ts | useShipments.ts | Shipments.tsx |
| **Manifests** | manifestService.ts | useManifests.ts | Manifests.tsx |
| **Scanning** | scanQueueStore.ts | - | Scanning.tsx |

## Secondary Modules
Dashboard, Analytics, Operations, Tracking, Inventory, Exceptions, Business, Management

## Required Response Structure

When making any change, structure your response as:

```
## Plan
[What you intend to do and why]

## Files to Change
- `path/to/file.ts` - [reason]

## Patch
[The actual code changes]

## Test Plan
- [ ] Unit test: [description]
- [ ] Manual QA: [steps]

## Risk / Rollback
- Risk: [potential issues]
- Rollback: [how to revert]
```

## Key Patterns

### Data Fetching
```typescript
// Use TanStack Query hooks
const { data, isLoading } = useQuery({
  queryKey: queryKeys.shipments.list(filters),
  queryFn: () => shipmentService.list(filters),
});
```

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: shipmentService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.shipments.all });
    showSuccessToast('Shipment created');
  },
  onError: (error) => handleMutationError(error, 'Create Shipment'),
});
```

### Error Handling
```typescript
import { mapSupabaseError, showErrorToast } from '@/lib/errors';

try {
  await operation();
} catch (error) {
  const appError = mapSupabaseError(error);
  showErrorToast(appError);
}
```

## Common Failure Modes

1. **Forgetting org_id scope**: All queries must filter by org_id
2. **Client-side invoice numbers**: Let DB trigger generate them
3. **Hard deletes**: Use soft delete (deleted_at)
4. **Missing RLS check**: Test with non-admin user
5. **Blocking UI**: Use async/await properly

## Verification Commands

```bash
npm run typecheck    # Must pass
npm run lint         # Must pass
npm run test:unit    # Run affected tests
npm run test         # E2E for critical flows
```

## Output Format

After any change, provide:
1. Summary of what was changed
2. Files modified
3. How to verify the change
4. Any follow-up tasks needed
