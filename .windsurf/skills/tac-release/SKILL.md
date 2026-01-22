---
name: tac-release
description: Release preparation and deployment checklist for TAC Cargo.
version: 2.0.0
tags: [tac, release, deployment, checklist]
---

# Release Preparation Skill

## Purpose
Prepare TAC Cargo for production release with comprehensive verification, testing, and deployment safety checks.

## Preconditions
- [ ] All features for release are merged
- [ ] No critical bugs in backlog
- [ ] Access to deployment environment
- [ ] Stakeholder approval for release

## Pre-Release Checklist

### 1. Code Quality
```bash
# Must all pass
npm run typecheck
npm run lint
npm run format:check
```

### 2. Test Suite
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test

# Generate coverage report
npm run test:unit:coverage
```

### 3. Build Verification
```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

### 4. Critical Flow Testing

#### Shipment Flow
- [ ] Create shipment with all fields
- [ ] AWB generated correctly (TAC########)
- [ ] Status updates work
- [ ] Tracking events created

#### Manifest Flow
- [ ] Create manifest
- [ ] Add shipments to manifest
- [ ] Close manifest (no more edits)
- [ ] Depart manifest (shipments → IN_TRANSIT)
- [ ] Arrive manifest (shipments → RECEIVED_AT_DEST)

#### Invoice Flow
- [ ] Create invoice
- [ ] Invoice number generated (INV-YYYY-NNNN)
- [ ] PDF generates correctly
- [ ] Mark paid works
- [ ] Cancel works

#### Scanning Flow
- [ ] Camera scanning works
- [ ] Manual entry works
- [ ] Offline mode queues scans
- [ ] Online sync completes
- [ ] Duplicate handling works

### 5. Security Review
- [ ] No sensitive data in console logs
- [ ] No hardcoded credentials
- [ ] RLS policies active
- [ ] Auth required for protected routes

### 6. Performance Check
- [ ] Initial load < 3s
- [ ] List pagination works
- [ ] No memory leaks on navigation
- [ ] Large data sets don't freeze UI

## Release Steps

### Step 1: Version Bump
Update `package.json` version following semver.

### Step 2: Changelog
Document changes in release notes.

### Step 3: Final Tests
Run full test suite one more time.

### Step 4: Build
```bash
npm run build
```

### Step 5: Deploy
Deploy `dist/` to hosting provider.

### Step 6: Smoke Test Production
- [ ] Login works
- [ ] Dashboard loads
- [ ] Create one shipment
- [ ] Verify in database

### Step 7: Monitor
- [ ] Check Sentry for errors
- [ ] Monitor server logs
- [ ] Watch for user reports

## Rollback Plan

If critical issues discovered:

1. **Immediate**: Revert to previous deployment
2. **Document**: Log all issues found
3. **Fix**: Address issues in new branch
4. **Retest**: Full test cycle
5. **Redeploy**: When ready

## Post-Release

- [ ] Notify stakeholders
- [ ] Update documentation
- [ ] Close release milestone
- [ ] Create next milestone

## Output Format

```markdown
## Release Report - v[X.Y.Z]

### Pre-Release Checks
- [ ] Code quality: PASS
- [ ] Unit tests: PASS (X/X)
- [ ] E2E tests: PASS (X/X)
- [ ] Build: SUCCESS

### Critical Flows
- [ ] Shipments: PASS
- [ ] Manifests: PASS
- [ ] Invoices: PASS
- [ ] Scanning: PASS

### Security
- [ ] No leaks: VERIFIED
- [ ] RLS active: VERIFIED

### Deployment
- Deployed at: [timestamp]
- Environment: [prod/staging]
- Version: [X.Y.Z]

### Post-Deploy
- [ ] Smoke test: PASS
- [ ] Monitoring: Active
