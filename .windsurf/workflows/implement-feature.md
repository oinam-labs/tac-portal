---
description: Safe feature implementation with proper planning, testing, and documentation
---

# /implement-feature — Safe Feature Implementation

## Goal
Implement a new feature safely following TAC Cargo patterns, with minimal regressions and proper testing.

## Preconditions
- [ ] Feature requirement documented or clearly stated
- [ ] Understanding of affected modules
- [ ] Dev environment ready

## Steps

### Step 1: Requirement Analysis
Document the feature:
```markdown
## Feature: [Name]

### User Story
As a [role], I want to [action] so that [benefit].

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Affected Modules
- [Module 1]
- [Module 2]
```

### Step 2: Technical Design

#### Database Changes (if any)
```sql
-- New table or columns
-- RLS policies
-- Triggers/functions
```

Migration file: `supabase/migrations/NNN_feature_name.sql`

#### Service Layer
- New service methods needed
- Existing methods to modify

#### UI Components
- New routes (`App.tsx`)
- New pages/components
- Modified components

### Step 3: Implementation Order

1. **Database** (if needed)
   - Create migration
   - Apply locally
   - Update `database.types.ts`

2. **Service Layer**
   ```typescript
   // lib/services/entityService.ts
   export const entityService = {
     async newMethod(params): Promise<Result> {
       // Implementation
     }
   };
   ```

3. **Hooks** (if using React Query)
   ```typescript
   // hooks/useEntity.ts
   export function useNewFeature(params) {
     return useQuery({
       queryKey: entityKeys.feature(params),
       queryFn: () => entityService.newMethod(params),
     });
   }
   ```

4. **UI Components**
   - Create component files
   - Add to routes if new page
   - Wire up data fetching

### Step 4: Testing

#### Unit Tests
```bash
# Create test file
# tests/unit/lib/services/entityService.test.ts

// turbo
npm run test:unit -- --grep "newMethod"
```

#### E2E Test (for critical features)
```typescript
// tests/e2e/feature.spec.ts
test('feature works end to end', async ({ page }) => {
  // Test implementation
});
```

### Step 5: Verification
```bash
// turbo
npm run typecheck

// turbo
npm run lint

// turbo
npm run test:unit

npm run test
```

### Step 6: Documentation
Update relevant docs:
- [ ] PRD if behavior documented there
- [ ] README if setup changed
- [ ] JSDoc on new functions

## Output Format

```markdown
## Feature Implementation: [Name]

### Plan
- [Step 1]
- [Step 2]

### Files Changed
| File | Change |
|------|--------|
| `path/file.ts` | [description] |

### Database Changes
- [Table/column added]
- [RLS policy added]

### Tests Added
- Unit: `tests/unit/...`
- E2E: `tests/e2e/...`

### Verification
- [ ] Typecheck: PASS
- [ ] Lint: PASS
- [ ] Unit tests: PASS
- [ ] E2E tests: PASS
- [ ] Manual QA: PASS

### Risk Assessment
- Risk: [potential issues]
- Mitigation: [how addressed]

### Rollback Plan
1. Revert commit: `git revert [hash]`
2. If DB changed: Apply rollback migration

## Risk/Rollback
- Risk: Feature may introduce bugs in existing functionality
- Rollback: Git revert + rollback migration if DB changed
