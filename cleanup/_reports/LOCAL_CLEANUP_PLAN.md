# TAC Cargo Portal — Local Cleanup Plan

**Generated:** 2026-01-22  
**Branch:** `cleanup/audit-2026-01-22`

---

## Summary of Findings

| Category | Count | Size | Status |
|----------|-------|------|--------|
| Unused public images | 7 | ~49MB | Ready to quarantine |
| Unused npm dependencies | 10+ | ~2MB (bundle) | Requires team review |
| Duplicate docs (already quarantined) | 14 | ~270KB | ✅ Done |
| Old logs/reports (already quarantined) | 10 | ~7.6MB | ✅ Done |
| Root-level MD reports | 12 | ~70KB | Ready to quarantine |
| Playwright/test artifacts | - | ~1MB | Gitignored (safe) |

**Total recoverable space: ~57MB**

---

## Phase 1: Unused Public Assets (SAFE — HIGH IMPACT)

These large images have **NO references** in any `.tsx`, `.ts`, `.css`, or `.html` file:

| File | Size | Evidence |
|------|------|----------|
| `public/express-air-cargo.png` | 10.6MB | No imports found |
| `public/express-surface-cargo.png` | 10.0MB | No imports found |
| `public/pick-n-drop.png` | 8.5MB | No imports found |
| `public/surface-cargo.png` | 6.6MB | No imports found |
| `public/express-pick-drop.png` | 6.6MB | No imports found |
| `public/air-cargo.png` | 6.4MB | No imports found |
| `public/network-illustration.png` | 0.6MB | No imports found |

**Total: ~49MB**

### Action
```powershell
# Quarantine unused images
New-Item -ItemType Directory -Force -Path "cleanup/_quarantine/public"
Move-Item -Path "public/express-air-cargo.png", "public/express-surface-cargo.png", "public/pick-n-drop.png", "public/surface-cargo.png", "public/express-pick-drop.png", "public/air-cargo.png", "public/network-illustration.png" -Destination "cleanup/_quarantine/public/" -Force
```

---

## Phase 2: Root-Level Report Clutter (SAFE)

These `.md` files at root are one-time reports, not core documentation:

| File | Size | Recommendation |
|------|------|----------------|
| `ADMIN_USER_SETUP_COMPLETE.md` | 6.4KB | Quarantine |
| `CODERABBIT_REVIEW_REQUEST.md` | 3KB | Quarantine |
| `CREATE_TEST_USER.md` | 4.3KB | Quarantine |
| `Cleanup-Actions.tasks.md` | 1.4KB | Quarantine |
| `Cleanup-Report.md` | 1.7KB | Quarantine |
| `ENTERPRISE_QA_REPORT.md` | 10.6KB | Quarantine |
| `FIXES_APPLIED.md` | 7.9KB | Quarantine |
| `FRONTEND_TEST_REPORT.md` | 8.3KB | Quarantine |
| `IMPLEMENTATION_SUMMARY.md` | 7.4KB | Quarantine |
| `PRODUCTION_READINESS_REPORT.md` | 6.2KB | Quarantine |
| `SENTRY_ANALYSIS_REPORT.md` | 8KB | Quarantine |
| `SENTRY_TEST_AUDIT_REPORT.md` | 2.2KB | Quarantine |
| `TESTSPRITE_COMPREHENSIVE_TEST_REPORT.md` | 9KB | Quarantine |

**Total: ~76KB**

### Action
```powershell
# Quarantine root-level reports
New-Item -ItemType Directory -Force -Path "cleanup/_quarantine/root-reports"
Move-Item -Path "ADMIN_USER_SETUP_COMPLETE.md", "CODERABBIT_REVIEW_REQUEST.md", "CREATE_TEST_USER.md", "Cleanup-Actions.tasks.md", "Cleanup-Report.md", "ENTERPRISE_QA_REPORT.md", "FIXES_APPLIED.md", "FRONTEND_TEST_REPORT.md", "IMPLEMENTATION_SUMMARY.md", "PRODUCTION_READINESS_REPORT.md", "SENTRY_ANALYSIS_REPORT.md", "SENTRY_TEST_AUDIT_REPORT.md", "TESTSPRITE_COMPREHENSIVE_TEST_REPORT.md" -Destination "cleanup/_quarantine/root-reports/" -Force
```

---

## Phase 3: Unused npm Dependencies (REQUIRES TEAM REVIEW)

These packages have **no imports** in source code:

### High Confidence (Safe to Remove)
| Package | Size Impact | Reason |
|---------|-------------|--------|
| `@tiptap/*` (12 packages) | ~500KB bundle | Rich text editor - no imports |
| `embla-carousel-*` (2 packages) | ~50KB bundle | Carousel - no imports |
| `gsap` | ~60KB bundle | Animation - no imports |
| `dompurify` | ~20KB bundle | HTML sanitizer - no imports |
| `react-markdown` | ~30KB bundle | Markdown renderer - no imports |

### Medium Confidence (Verify First)
| Package | Reason to Keep |
|---------|----------------|
| `@openrouter/sdk` | May be planned AI feature |
| `@base-ui/react` | May be shadcn transitive dep |
| `fuse.js` | May be planned search feature |
| `react-use-measure` | May be used by `motion` |
| `tw-animate-css` | May be tailwind plugin |

### Removal Commands (After Team Approval)
```bash
# High confidence removals
npm uninstall @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-task-item @tiptap/extension-task-list @tiptap/extension-text-align @tiptap/extension-text-style @tiptap/extension-underline @tiptap/pm @tiptap/react @tiptap/starter-kit

npm uninstall embla-carousel-autoplay embla-carousel-react

npm uninstall gsap dompurify react-markdown
```

---

## Phase 4: Folder Structure Cleanup

### Folders to Review
| Folder | Size | Recommendation |
|--------|------|----------------|
| `CSS-Docs/` | 20KB | Move to `docs/css/` or quarantine |
| `label-design/` | 20KB | Review if still needed |
| `testsprite_tests/` | 810KB | Keep tests, but clean tmp/ |

### Already Gitignored (No Action Needed)
| Folder | Size | Status |
|--------|------|--------|
| `dist/` | 65MB | Build output ✓ |
| `playwright-report/` | 670KB | Test reports ✓ |
| `test-results/` | 120KB | Test results ✓ |
| `node_modules/.vite/` | 35MB | Vite cache ✓ |

---

## Phase 5: .gitignore Updates

Add these patterns to prevent future clutter:

```gitignore
# Audit/cleanup artifacts
*.log
folder-tree.txt
project-tree.txt
project-inventory.csv
duplicate-hash-report.txt
depcheck-report.json
npm-deps.txt

# Cleanup quarantine (keep locally, don't commit)
cleanup/_quarantine/
```

---

## Execution Checklist

### Immediate (Safe to Execute)
- [ ] Quarantine 7 unused public images (~49MB)
- [ ] Quarantine 13 root-level report files (~76KB)
- [ ] Update .gitignore with audit patterns
- [ ] Run verification: `npm run typecheck && npm run lint && npm run test:unit && npm run build`

### After Team Review
- [ ] Remove unused npm dependencies (Phase 3)
- [ ] Decide on CSS-Docs folder fate
- [ ] Decide on label-design folder fate

### Post-Cleanup
- [ ] Delete quarantine after 30 days if no issues
- [ ] Consider image optimization for remaining public assets

---

## Rollback Commands

```powershell
# Restore public images
Move-Item -Path "cleanup/_quarantine/public/*" -Destination "public/" -Force

# Restore root reports
Move-Item -Path "cleanup/_quarantine/root-reports/*" -Destination "./" -Force

# Restore npm packages (if removed)
npm install
```

---

## Expected Results After Cleanup

| Metric | Before | After | Saved |
|--------|--------|-------|-------|
| Public assets | 60MB | 11MB | 49MB |
| Root clutter | 20+ files | 5 files | 15 files |
| Bundle size | ~3.2MB | ~2.5MB* | ~700KB |

*Bundle savings estimated after npm dependency removal

