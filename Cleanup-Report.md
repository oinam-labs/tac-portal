# TAC Portal Cleanup Report

**Date**: 2026-01-20  
**Status**: ✅ Complete

---

## Before vs After

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| testsprite_tests/ | 38 files | 0 (archived) | -38 |
| Backup files | 4 files | 0 (deleted) | -4 |
| Dead code (lib/) | 2 files (~20KB) | 0 (archived) | -2 |
| Old landing/ | 7 files (33KB) | 0 (archived) | -7 |
| Generated artifacts | 2 folders | 0 (archived) | -2 |
| **Total Reduced** | | | **~51 files** |

---

## Archived Items

All archived to `.archive/cleanup-2026-01-20/`:

### testsprite/
- 16 TC*.py test files
- 2 test reports (HTML, MD)  
- 2 JSON plan files
- `tmp/` folder (18 files)

### components/landing/
- CorridorVisualization.tsx, FAQ.tsx, HowItWorks.tsx
- SLASection.tsx, StatsRow.tsx, Testimonials.tsx, index.ts

### lib/
- query-keys.ts (duplicate)
- mock-db.ts (orphaned)

### generated/
- playwright-report/
- test-results/

---

## Deleted Items

| File | Reason |
|------|--------|
| index-backup.html | Backup |
| index-tw4-backup.html | Backup |
| vite.config.ts.sentry-build-plugin | Backup |
| duplicate-hash-report.txt | Scan artifact |
| repo-tree.txt | Scan artifact |

---

## Code Fixes Required

| File | Change |
|------|--------|
| `pages/Dashboard.tsx` | Updated import: `query-keys` → `queryKeys` |
| `lib/queryKeys.ts` | Added missing `dashboard` key |

---

## Build Verification

```
✓ npm run typecheck  (exit code 0)
✓ npm run build      (exit code 0, built in 34.61s)
```

---

## Rollback

All archived files preserved. To restore:
```powershell
Move-Item ".archive\cleanup-2026-01-20\<path>" "<original-path>"
```
