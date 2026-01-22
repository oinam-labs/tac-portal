# TAC Cargo Portal — Enterprise Safe Cleanup Audit Report

**Audit Date:** 2026-01-22  
**Branch:** `cleanup/audit-2026-01-22`  
**Auditor:** Cascade (Senior Staff Engineer)  
**Status:** ✅ COMPLETE — All verifications passed

---

## Executive Summary

A comprehensive safe cleanup audit was performed on the TAC Cargo Portal. **25 files (~7.6MB)** were quarantined safely without breaking the project. All verifications passed:

| Check | Status |
|-------|--------|
| TypeScript (`npm run typecheck`) | ✅ Pass |
| ESLint (`npm run lint`) | ✅ Pass |
| Unit Tests (`npm run test:unit`) | ✅ Pass (244/244) |
| Production Build (`npm run build`) | ✅ Pass |

---

## Phase 0: Pre-flight Safety

- **Branch created:** `cleanup/audit-2026-01-22`
- **Quarantine folders created:**
  - `cleanup/_quarantine/`
  - `cleanup/_reports/`
  - `cleanup/_scripts/`
  - `cleanup/_notes/`

---

## Phase 1: Project Inventory

### Folder Size Analysis (Top 10)

| Folder | Size (MB) | Notes |
|--------|-----------|-------|
| `dist/` | 65.07 | Build output (gitignored) |
| `public/` | 60.69 | Static assets (required) |
| `node_modules/.vite/` | 35.71 | Vite cache (internal) |
| `testsprite_tests/` | 0.81 | Test framework |
| `playwright-report/` | 0.67 | Test reports (gitignored) |
| `components/` | 0.66 | React components |
| `docs/` | 0.40 | Documentation |
| `lib/` | 0.26 | Utility libraries |
| `pages/` | 0.20 | Page components |
| `.windsurf/` | 0.17 | IDE config |

### Generated Reports
- `cleanup/_reports/project-tree.full.txt`
- `cleanup/_reports/project-tree.folders.txt`
- `cleanup/_reports/project-inventory.csv`
- `cleanup/_reports/folder-sizes.txt`

---

## Phase 2: Safe Artifacts Status

| Artifact | Exists | Size | Gitignored |
|----------|--------|------|------------|
| `dist/` | ✅ | 65MB | ✅ Yes |
| `coverage/` | ❌ | - | - |
| `playwright-report/` | ✅ | 0.67MB | ✅ Yes |
| `test-results/` | ✅ | 0.12MB | ✅ Yes |
| `node_modules/.vite/` | ✅ | 35.7MB | ✅ Inside node_modules |
| `.auth/` | ✅ | 0 | ✅ Yes |

**Log files found at root (now quarantined):**
- `build.log` (1.6KB)
- `build_fixes.log` (6.7KB)
- `build_v2.log` (1.6KB)
- `build_v3.log` (6.7KB)

---

## Phase 3: Duplicate Detection

### Exact Duplicates (SHA256 Hash Match)

**16 duplicate groups found.** Primary issue: `testsprite_tests/tmp/prd_files/` contains **14 exact copies** of documentation files from `docs/`.

| File | Original | Duplicate | Size |
|------|----------|-----------|------|
| DEVELOPMENT_GUIDE.md | docs/ | testsprite_tests/tmp/prd_files/ | 13.5KB |
| SETUP_GUIDE.md | docs/ | testsprite_tests/tmp/prd_files/ | 4.4KB |
| PRODUCTION_ENHANCEMENT_PLAN.md | docs/ | testsprite_tests/tmp/prd_files/ | 38.6KB |
| TAC-Cargo-QA-Audit.tasks.md | docs/ | testsprite_tests/tmp/prd_files/ | 90.6KB |
| ... (10 more files) | ... | ... | ... |

**Total duplicate waste:** ~270KB

### Name-Pattern Duplicates

| File | Reason |
|------|--------|
| `lib/database.types.old.ts` | `.old.ts` naming = backup file |

---

## Phase 4: Dependency Audit

### Summary
- **Total dependencies:** 66 (37 prod + 29 dev)
- **Potentially unused:** 10-15 packages
- **Confirmed used:** 50+ packages

### Potentially Unused Dependencies

| Package | Type | Evidence | Risk |
|---------|------|----------|------|
| `@openrouter/sdk` | prod | No imports found | May be planned AI feature |
| `@base-ui/react` | prod | No imports found | May be shadcn transitive |
| `fuse.js` | prod | No imports found | Search library - may be planned |
| `react-use-measure` | prod | No imports found | May be motion dep |
| `tw-animate-css` | prod | No imports found | Tailwind plugin - check config |
| `react-markdown` | prod | No imports found | May be planned |
| `embla-carousel-*` | prod | No imports found | Carousel - may be shadcn |
| `@tiptap/*` (12 pkgs) | prod | No imports found | Rich text editor - ~500KB |
| `gsap` | prod | No imports found | Animation library |
| `dompurify` | prod | No imports found | HTML sanitizer |

**Recommendation:** Do NOT remove without team review. Run `npm uninstall <pkg>` only after confirming no runtime usage.

### Dependency Report
See: `cleanup/_reports/dependency-usage.json`

---

## Phase 5: Component/Script Audit

### Root-Level Clutter (Quarantined)
| File | Size | Reason |
|------|------|--------|
| `folder-tree.txt` | 154KB | Previous audit artifact |
| `project-tree.txt` | 2.3MB | Previous audit artifact |
| `project-inventory.csv` | 5.9MB | Previous audit artifact |
| `duplicate-hash-report.txt` | 1.1MB | Previous audit artifact |
| `depcheck-report.json` | 36KB | Previous audit artifact |
| `npm-deps.txt` | 4.5KB | Previous audit artifact |

### Files NOT Removed (Require Review)
- `testsprite_tests/*.py` — TestSprite test files (active test framework)
- `CSS-Docs/` — CSS documentation (may be useful)
- Root-level `.md` reports — May be needed for history

---

## Phase 6: Quarantine Summary

### Files Moved to `cleanup/_quarantine/`

| Category | Count | Size | Location |
|----------|-------|------|----------|
| Log files | 4 | ~17KB | `cleanup/_quarantine/logs/` |
| Old database types | 1 | ~18KB | `cleanup/_quarantine/lib/` |
| Duplicate docs | 14+ | ~270KB | `cleanup/_quarantine/testsprite_tests_tmp/` |
| Old audit reports | 6 | ~7.3MB | `cleanup/_quarantine/old-reports/` |
| **TOTAL** | **25+** | **~7.6MB** | |

### Manifest
Full details: `cleanup/_notes/quarantine-manifest.md`

---

## Phase 7: Verification Results

All checks passed after quarantine:

```
✅ npm run typecheck    → Exit 0
✅ npm run lint         → Exit 0  
✅ npm run test:unit    → 244/244 tests passed (13.04s)
✅ npm run build        → Built in 31.71s (4357 modules)
```

---

## Recommendations

### Immediate Actions (Safe)
1. ✅ **Done:** Quarantine log files, old backup, duplicate docs
2. Review and permanently delete `cleanup/_quarantine/` after 30 days

### Short-term Actions (Require Review)
1. **Dependency cleanup:** Review unused deps with team before removal
2. **Add to .gitignore:** Add patterns for audit artifacts:
   ```
   # Audit artifacts
   folder-tree.txt
   project-tree.txt
   project-inventory.csv
   duplicate-hash-report.txt
   depcheck-report.json
   ```

### Long-term Actions
1. **Bundle size optimization:** Consider removing unused heavy deps:
   - `@tiptap/*` (~500KB) if rich text not planned
   - `gsap` if motion is sufficient
2. **TestSprite cleanup:** Remove `testsprite_tests/tmp/` from tracking or add to `.gitignore`

---

## Rollback Instructions

To restore all quarantined files:

```powershell
# From project root (c:\tac-portal)
Move-Item -Path "cleanup/_quarantine/logs/*" -Destination "./" -Force
Move-Item -Path "cleanup/_quarantine/lib/*" -Destination "lib/" -Force
Move-Item -Path "cleanup/_quarantine/testsprite_tests_tmp/tmp" -Destination "testsprite_tests/" -Force
Move-Item -Path "cleanup/_quarantine/old-reports/*" -Destination "./" -Force
```

---

## Deliverables Checklist

| Deliverable | Status | Location |
|-------------|--------|----------|
| `project-tree.full.txt` | ✅ | `cleanup/_reports/` |
| `project-inventory.csv` | ✅ | `cleanup/_reports/` |
| `duplicates-by-hash.csv` | ✅ | `cleanup/_reports/` |
| `dependency-usage.json` | ✅ | `cleanup/_reports/` |
| `quarantine-manifest.md` | ✅ | `cleanup/_notes/` |
| `CLEANUP_AUDIT_REPORT.md` | ✅ | `cleanup/_reports/` |

---

**Audit Complete.** No breaking changes introduced. All files recoverable from quarantine.
