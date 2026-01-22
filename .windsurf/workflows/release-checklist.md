---
description: Pre-release verification and deployment checklist
---

# /release-checklist — Release Checklist

## Goal
Verify all requirements are met before deploying a new release to production.

## Preconditions
- All features for release are merged to main
- No critical bugs in backlog
- Stakeholder approval obtained

## Steps

### Step 1: Code Quality Gates
```bash
// turbo
npm run typecheck

// turbo
npm run lint

// turbo
npm run format:check
```

All must pass with zero errors.

### Step 2: Test Suite
```bash
// turbo
npm run test:unit

npm run test

npm run test:unit:coverage
```

Verify:
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Coverage meets thresholds (>70%)

### Step 3: Build Verification
```bash
npm run build
npm run preview
```

Verify:
- [ ] Build completes without errors
- [ ] Preview runs locally
- [ ] No console errors on load

### Step 4: Critical Flow Verification

#### Shipments
- [ ] Create shipment → AWB generated (TAC########)
- [ ] Edit shipment → Changes saved
- [ ] Status update → Tracking event created
- [ ] Delete → Soft deleted

#### Manifests
- [ ] Create manifest → Number generated (MNF-YYYY-NNNNNN)
- [ ] Add shipments → Totals updated
- [ ] Close → Cannot edit after
- [ ] Depart → Shipments → IN_TRANSIT
- [ ] Arrive → Shipments → RECEIVED_AT_DEST

#### Invoices
- [ ] Create invoice → Number generated (INV-YYYY-NNNN)
- [ ] Calculations correct
- [ ] PDF generates correctly
- [ ] Mark paid works
- [ ] Cancel works

#### Scanning
- [ ] Camera scanning works
- [ ] Manual entry works
- [ ] Offline queue persists
- [ ] Sync completes

### Step 5: Security Checklist
- [ ] No sensitive data in console.log
- [ ] No hardcoded API keys
- [ ] RLS policies enforced
- [ ] Auth required for all protected routes
- [ ] HTTPS enforced

### Step 6: Performance Checklist
- [ ] Initial load < 3 seconds
- [ ] No memory leaks on navigation
- [ ] Large lists paginate properly
- [ ] Images optimized

### Step 7: Documentation
- [ ] README updated (if needed)
- [ ] CHANGELOG updated
- [ ] API docs current
- [ ] Migration notes (if DB changed)

### Step 8: Deployment

#### Pre-Deploy
- [ ] Backup current deployment
- [ ] Note rollback procedure
- [ ] Notify stakeholders

#### Deploy
```bash
# Build
npm run build

# Deploy dist/ to hosting
# (Netlify, Vercel, or custom)
```

#### Post-Deploy
- [ ] Smoke test production
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Create test record
- [ ] Monitor Sentry for errors
- [ ] Monitor logs for issues

### Step 9: Announce
- [ ] Notify team of deployment
- [ ] Update status page (if exists)
- [ ] Close release milestone

## Output Format

```markdown
## Release Checklist — v[X.Y.Z]

### Date: [YYYY-MM-DD]
### Deployer: [Name]

### Pre-Release Verification
| Check | Status |
|-------|--------|
| Typecheck | ✅ |
| Lint | ✅ |
| Format | ✅ |
| Unit Tests | ✅ (X/X) |
| E2E Tests | ✅ (X/X) |
| Build | ✅ |

### Critical Flows
| Flow | Status |
|------|--------|
| Shipments CRUD | ✅ |
| Manifest Lifecycle | ✅ |
| Invoice + PDF | ✅ |
| Scanning + Sync | ✅ |

### Security
- [x] No secrets exposed
- [x] RLS active
- [x] Auth enforced

### Deployment
- Deployed at: [timestamp]
- Version: [X.Y.Z]
- Commit: [hash]

### Post-Deploy Verification
- [x] Smoke test passed
- [x] Sentry monitoring active
- [x] No critical errors

### Rollback Plan
1. Revert to: [previous version/commit]
2. Command: `[rollback command]`

### Sign-off
- [ ] Tech Lead approval
- [ ] Product approval
```

## Risk/Rollback
- Risk: Production deployment may introduce issues
- Rollback: Revert to previous deployment immediately if critical issues found
