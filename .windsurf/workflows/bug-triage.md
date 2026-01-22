---
description: Bug triage and root cause analysis workflow
---

# /bug-triage — Bug Triage Workflow

## Goal
Systematically analyze, prioritize, and plan fixes for reported bugs.

## Preconditions
- Bug report with reproduction steps
- Access to logs (Sentry, console)
- Dev environment ready

## Steps

### Step 1: Bug Documentation
```markdown
## Bug: [Title]

### Reporter
[Who reported]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- User Role: [Admin/Operator]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots/Logs
[Attach evidence]
```

### Step 2: Severity Assessment

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **Critical** | Data loss, security breach, total failure | Immediate |
| **High** | Major feature broken, no workaround | Same day |
| **Medium** | Feature degraded, workaround exists | This sprint |
| **Low** | Minor issue, cosmetic | Backlog |

### Step 3: Root Cause Analysis

#### Check Logs
```bash
# Check Sentry for errors
# Review browser console
# Check network requests
```

#### Identify Location
- [ ] Frontend component
- [ ] Hook/data fetching
- [ ] Service layer
- [ ] Database query
- [ ] RLS policy
- [ ] External dependency

#### Narrow Down
```typescript
// Add logging to trace issue
console.log('[DEBUG]', { state, props, response });
```

### Step 4: Impact Analysis
- [ ] How many users affected?
- [ ] Which modules impacted?
- [ ] Is there data corruption?
- [ ] Is there a workaround?

### Step 5: Fix Planning

#### Minimal Fix
What's the smallest change to fix the issue?

#### Proper Fix
What's the right long-term solution?

#### Decision
- [ ] Apply minimal fix now, schedule proper fix
- [ ] Apply proper fix directly

### Step 6: Implementation
```markdown
## Fix Plan

### Root Cause
[Explanation]

### Solution
[Approach]

### Files to Change
- `path/file.ts`: [change]

### Test Plan
- [ ] Unit test for regression
- [ ] Manual QA steps
```

### Step 7: Verification
```bash
// turbo
npm run typecheck

// turbo
npm run lint

// turbo
npm run test:unit
```

### Step 8: Deploy & Monitor
- Deploy fix
- Monitor Sentry for recurrence
- Close bug report

## Output Format

```markdown
## Bug Triage Report: [Bug Title]

### Severity: [Critical/High/Medium/Low]

### Root Cause
[Explanation of why bug occurs]

### Location
- File: `path/to/file.ts`
- Function: `functionName`
- Line: ~XX

### Impact
- Users affected: [estimate]
- Data integrity: [affected/not affected]
- Workaround: [yes/no - description]

### Fix
#### Approach
[How to fix]

#### Files Changed
| File | Change |
|------|--------|
| `file.ts` | [description] |

#### Tests
- [ ] Regression test added
- [ ] Existing tests pass

### Verification
- [ ] Bug no longer reproduces
- [ ] No new issues introduced

### Prevention
[How to prevent similar bugs]
```

## Risk/Rollback
- Risk: Fix may introduce new bugs
- Rollback: Git revert to previous working state
