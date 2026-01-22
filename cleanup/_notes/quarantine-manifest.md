# Quarantine Manifest

**Audit Date:** 2026-01-22  
**Branch:** `cleanup/audit-2026-01-22`  
**Auditor:** Cascade (Enterprise Safe Cleanup)

---

## Quarantined Items

### 1. Log Files (SAFE - gitignored pattern)
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `build.log` | `cleanup/_quarantine/logs/build.log` | Build artifact log | *.log in .gitignore pattern |
| `build_fixes.log` | `cleanup/_quarantine/logs/build_fixes.log` | Build artifact log | *.log in .gitignore pattern |
| `build_v2.log` | `cleanup/_quarantine/logs/build_v2.log` | Build artifact log | *.log in .gitignore pattern |
| `build_v3.log` | `cleanup/_quarantine/logs/build_v3.log` | Build artifact log | *.log in .gitignore pattern |

### 2. Old Database Types (UNUSED BACKUP)
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `lib/database.types.old.ts` | `cleanup/_quarantine/lib/database.types.old.ts` | Old backup file | No imports found; `.old.ts` naming convention |

### 3. TestSprite Temp Files (DUPLICATE DOCS)
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `testsprite_tests/tmp/` | `cleanup/_quarantine/testsprite_tests_tmp/tmp/` | 14 exact duplicates of docs | SHA256 hash matches with docs/ folder |

**Duplicate files moved (~270KB):**
- DEVELOPMENT_GUIDE.md (duplicate of docs/)
- SETUP_GUIDE.md (duplicate of docs/)
- PRODUCTION_ENHANCEMENT_PLAN.md (duplicate of docs/)
- SENTRY_MCP_SETUP.md (duplicate of docs/)
- CSS_COLOR_AUDIT.md (duplicate of docs/)
- SENTRY_MCP_VERIFICATION.md (duplicate of docs/)
- PHASE_IMPLEMENTATION_STATUS.md (duplicate of docs/)
- Production-Level QA+Audit.md (duplicate of docs/)
- SENTRY_IMPLEMENTATION.md (duplicate of docs/)
- CODEGEN_CODE_REVIEW_PROMPT.md (duplicate of docs/)
- TAC-Cargo-QA-Audit.tasks.md (duplicate of docs/)
- CRUD-implementation.md (duplicate of docs/)
- FULL_CODEBASE_REVIEW.md (duplicate of docs/)
- README.md (duplicate of docs/)

### 4. Old Reports at Root Level
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `folder-tree.txt` | `cleanup/_quarantine/old-reports/folder-tree.txt` | Previous audit artifact | Not part of source code |
| `project-tree.txt` | `cleanup/_quarantine/old-reports/project-tree.txt` | Previous audit artifact | Not part of source code |
| `project-inventory.csv` | `cleanup/_quarantine/old-reports/project-inventory.csv` | Previous audit artifact (5.9MB) | Not part of source code |
| `duplicate-hash-report.txt` | `cleanup/_quarantine/old-reports/duplicate-hash-report.txt` | Previous audit artifact (1.1MB) | Not part of source code |
| `depcheck-report.json` | `cleanup/_quarantine/old-reports/depcheck-report.json` | Previous audit artifact | Not part of source code |
| `npm-deps.txt` | `cleanup/_quarantine/old-reports/npm-deps.txt` | Previous audit artifact | Not part of source code |

---

## NOT Quarantined (Requires Further Review)

### Unused Dependencies (DO NOT REMOVE YET)
These dependencies appear unused but require npm removal verification:

| Package | Type | Reason to Keep |
|---------|------|----------------|
| `@openrouter/sdk` | dependency | May be planned feature |
| `@base-ui/react` | dependency | May be shadcn dependency |
| `fuse.js` | dependency | Search library - may be planned |
| `react-use-measure` | dependency | May be used by motion |
| `tw-animate-css` | dependency | May be tailwind plugin |
| `react-markdown` | dependency | May be planned feature |
| `embla-carousel-*` | dependency | May be used by shadcn carousel |
| `@tiptap/*` | dependency | Rich text editor - may be planned |
| `gsap` | dependency | Animation - may be planned |
| `dompurify` | dependency | Security lib - may be planned |

**Action:** Run `npm uninstall <package>` only after team review.

### Generated Artifacts (Gitignored - DO NOT QUARANTINE)
- `dist/` (65MB) - Build output, gitignored ✓
- `playwright-report/` - Test reports, gitignored ✓
- `test-results/` - Test results, gitignored ✓
- `node_modules/.vite/` - Vite cache, inside node_modules ✓

---

## Rollback Instructions

To restore all quarantined files:

```powershell
# From project root
Move-Item -Path "cleanup/_quarantine/logs/*" -Destination "./" -Force
Move-Item -Path "cleanup/_quarantine/lib/*" -Destination "lib/" -Force
Move-Item -Path "cleanup/_quarantine/testsprite_tests_tmp/tmp" -Destination "testsprite_tests/" -Force
Move-Item -Path "cleanup/_quarantine/old-reports/*" -Destination "./" -Force
```

---

### 5. Unused Public Images (HIGH IMPACT)
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `public/express-air-cargo.png` | `cleanup/_quarantine/public/express-air-cargo.png` | Unused image | No references in .tsx/.ts/.css/.html |
| `public/express-surface-cargo.png` | `cleanup/_quarantine/public/express-surface-cargo.png` | Unused image | No references found |
| `public/pick-n-drop.png` | `cleanup/_quarantine/public/pick-n-drop.png` | Unused image | No references found |
| `public/surface-cargo.png` | `cleanup/_quarantine/public/surface-cargo.png` | Unused image | No references found |
| `public/express-pick-drop.png` | `cleanup/_quarantine/public/express-pick-drop.png` | Unused image | No references found |
| `public/air-cargo.png` | `cleanup/_quarantine/public/air-cargo.png` | Unused image | No references found |
| `public/network-illustration.png` | `cleanup/_quarantine/public/network-illustration.png` | Unused image | No references found |

**Total: 7 files, ~49MB**

### 6. Root-Level Report Files
| Original Path | Quarantine Path | Reason | Evidence |
|--------------|-----------------|--------|----------|
| `ADMIN_USER_SETUP_COMPLETE.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `CODERABBIT_REVIEW_REQUEST.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `CREATE_TEST_USER.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `Cleanup-Actions.tasks.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `Cleanup-Report.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `ENTERPRISE_QA_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `FIXES_APPLIED.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `FRONTEND_TEST_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `IMPLEMENTATION_SUMMARY.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `PRODUCTION_READINESS_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `SENTRY_ANALYSIS_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `SENTRY_TEST_AUDIT_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |
| `TESTSPRITE_COMPREHENSIVE_TEST_REPORT.md` | `cleanup/_quarantine/root-reports/` | One-time report | Not core docs |

**Total: 13 files, ~76KB**

---

## Space Savings Summary

| Category | Files | Size |
|----------|-------|------|
| Log files | 4 | ~17KB |
| Old database types | 1 | ~18KB |
| Duplicate docs | 14 | ~270KB |
| Old audit reports | 6 | ~7.3MB |
| **Unused public images** | **7** | **~49MB** |
| **Root-level reports** | **13** | **~76KB** |
| **Total** | **45** | **~56.7MB** |

