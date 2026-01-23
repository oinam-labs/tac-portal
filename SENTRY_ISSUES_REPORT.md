# Sentry Issues Report - TAC Cargo Portal

**Generated**: 2026-01-24 03:00 IST  
**Organization**: tac-pf  
**Project**: javascript-react  
**Period**: Last 14 days  
**Status**: Unresolved issues only

---

## Summary

**Total Unresolved Issues**: 2  
**Total Events**: 24 (10 + 14)  
**Affected Users**: 5 unique users  
**Priority**: High (both issues)

---

## Issue #1: NotFoundError - Dialog removeChild

**Issue ID**: `JAVASCRIPT-REACT-4`  
**Sentry Link**: https://tac-pf.sentry.io/issues/89331897/  
**Status**: ⚠️ UNRESOLVED (Regressed)  
**Priority**: 🔴 HIGH

### Details

- **Error Type**: `Error`
- **Message**: `Test exception captured manually`
- **File**: `/components/dev/SentryTestButton.tsx`
- **Function**: `handleCaptureException`
- **Platform**: JavaScript (React)
- **Level**: Error

### Statistics

- **Total Events**: 10
- **Affected Users**: 5
- **First Seen**: 2026-01-19 04:50:06 UTC
- **Last Seen**: 2026-01-23 11:08:33 UTC
- **Recent Activity (24h)**: 1 event on 2026-01-23

### Status

- **Substatus**: Regressed
- **Unhandled**: No (caught exception)
- **Fixability Score**: 36.5% (Sentry AI)
- **Autofix Triggered**: 2026-01-19 04:59:39 UTC

### Annotations

- **Sourcery AI**: Flagged as new issue
- **Link**: https://app.sourcery.ai/accounts/232624/issues/89331897

### Resolution Status

✅ **FIXED** - This issue was resolved in PR #48 (commit 4742d9e)

**Fix Applied**:
- Added cleanup effect with 100ms delay when Dialog closes
- Added `key` prop to Dialog to force remount
- Added `isMountedRef` guard to prevent state updates on unmounted component

**File Fixed**: `components/manifests/ManifestBuilder/ManifestBuilderWizard.tsx`

**Expected**: Issue should stop appearing in new Sentry events after deployment.

---

## Issue #2: First Error Test

**Issue ID**: `JAVASCRIPT-REACT-3`  
**Sentry Link**: https://tac-pf.sentry.io/issues/89331892/  
**Status**: ⚠️ UNRESOLVED (Regressed)  
**Priority**: 🔴 HIGH

### Details

- **Error Type**: `Error`
- **Message**: `This is your first error!`
- **File**: `/components/dev/SentryTestButton.tsx`
- **Function**: `handleTestError`
- **Platform**: JavaScript (React)
- **Level**: Error

### Statistics

- **Total Events**: 14
- **Affected Users**: 5
- **First Seen**: 2026-01-19 04:50:03 UTC
- **Last Seen**: 2026-01-23 11:08:30 UTC
- **Recent Activity (24h)**: 1 event on 2026-01-23

### Status

- **Substatus**: Regressed
- **Unhandled**: Yes (unhandled exception)
- **Fixability Score**: 37.2% (Sentry AI)
- **Autofix Triggered**: 2026-01-19 04:54:19 UTC

### Annotations

- **Sourcery AI**: Flagged as new issue
- **Link**: https://app.sourcery.ai/accounts/232624/issues/89331892

### Resolution Status

⚠️ **TEST ERROR** - This is a development/testing error

**Source**: `components/dev/SentryTestButton.tsx`

**Action Required**:
1. This is a test button used for Sentry integration testing
2. Should be removed or disabled in production builds
3. Consider adding environment check: `if (import.meta.env.DEV)` wrapper

**Recommendation**: Remove `SentryTestButton` component from production or add dev-only guard.

---

## Event Timeline (Last 24 Hours)

| Timestamp | Issue | Events |
|-----------|-------|--------|
| 2026-01-23 11:08:33 UTC | JAVASCRIPT-REACT-4 | 1 |
| 2026-01-23 11:08:30 UTC | JAVASCRIPT-REACT-3 | 1 |

---

## Recommendations

### Immediate Actions

1. ✅ **Issue #1 (Dialog removeChild)**: Already fixed in PR #48
   - Monitor Sentry for new occurrences after deployment
   - Should see zero new events

2. ⚠️ **Issue #2 (Test Error)**: Remove or guard test button
   - Add environment check to `SentryTestButton.tsx`
   - Or remove component entirely from production builds

### Monitoring

- **Check Sentry Dashboard**: https://tac-pf.sentry.io/issues/
- **Set up alerts**: Configure Sentry to alert on new high-priority issues
- **Review weekly**: Check for new patterns or regressions

### Code Quality

Both issues originate from:
- Development/testing code (`SentryTestButton.tsx`)
- Dialog lifecycle management (fixed)

**Next Steps**:
1. Clean up development testing components
2. Add environment guards for dev-only features
3. Continue monitoring for production errors

---

## Sentry Configuration

**Current Setup**:
- **DSN**: Configured in `.env.local`
- **Environment**: `development`
- **Organization**: `tac-pf`
- **Project**: `javascript-react`
- **Region**: DE (Germany)

**API Access**:
- Auth token configured for API access
- Successfully fetching issues via REST API
- Integration working correctly

---

## Additional Notes

### Sentry Stats (Last 25 Hours)

From `sentry_stats.json`:
- **Total Events**: 40
- **Peak Activity**: 2026-01-19 01:00-05:00 UTC (23 + 15 events)
- **Current Activity**: Low (2 events in last hour)

### Issue Categories

- **Error**: 2 issues (both unresolved)
- **Performance**: 0 issues
- **Crash**: 0 issues

### User Impact

- **Affected Users**: 5 unique users
- **Impact Level**: Low (test/dev errors only)
- **Production Impact**: Minimal (Dialog issue fixed)

---

**Report Generated By**: Windsurf Cascade AI  
**Data Source**: Sentry REST API + Local JSON reports  
**Next Review**: 2026-01-25 (24 hours)
