# TAC Cargo — Windsurf Setup Verification Checklist

## Quick Verification Commands

```bash
# Verify all files are in place
ls -la .windsurf/

# Run code quality checks
npm run typecheck
npm run lint
npm run format:check

# Run tests
npm run test:unit
npm run test
```

## MCP Servers Status

| Server | Status | Purpose |
|--------|--------|---------|
| `supabase-mcp-server` | ✅ Configured | Database operations |
| `mcp-playwright` | ✅ Configured | Browser automation |
| `shadcn-ui-docs` | ✅ Configured | Component docs |
| `exa` | ✅ Configured | Web search |
| `fetch` | ✅ Configured | URL fetching |
| `github-mcp-server` | ✅ Configured | GitHub integration |
| Sentry | ✅ In-app | Error monitoring (`@sentry/react`) |

---

## File Structure Verification

### Root Files
- [x] `.windsurfrules` - Project-level rules
- [x] `.windsurf/README.md` - Setup overview
- [x] `.windsurf/ARCHITECTURE_REPORT.md` - Codebase analysis

### Rules (`/.windsurf/rules/`)
- [x] `stack-and-commands.md` - Stack constraints & verification commands
- [x] `db-integrity.md` - Database integrity rules
- [x] `scanning-critical.md` - Scanning idempotency & offline-first
- [x] `invoices-pdf-critical.md` - Invoice numbering & PDF output
- [x] `manifests-critical.md` - Manifest lifecycle rules
- [x] `ui-standards.md` - UI/UX consistency standards
- [x] `testing-policy.md` - Testing requirements
- [x] `docs-policy.md` - Documentation policy

### Skills (`/.windsurf/skills/`)
- [x] `tac-project/SKILL.md` - Master project skill
- [x] `tac-architecture/SKILL.md` - Architecture analysis
- [x] `tac-db-integrity/SKILL.md` - Database integrity
- [x] `tac-invoices/SKILL.md` - Invoice operations
- [x] `tac-manifests/SKILL.md` - Manifest operations
- [x] `tac-scanning/SKILL.md` - Scanning operations
- [x] `tac-exceptions/SKILL.md` - Exception handling
- [x] `tac-dashboard-qa/SKILL.md` - Dashboard QA
- [x] `tac-ui-polish/SKILL.md` - UI polish
- [x] `tac-release/SKILL.md` - Release preparation

### Workflows (`/.windsurf/workflows/`)
- [x] `audit-full-system.md` - Full system audit
- [x] `audit-db-integrity.md` - Database integrity audit
- [x] `qa-dashboard.md` - Module-by-module QA
- [x] `implement-feature.md` - Feature implementation
- [x] `bug-triage.md` - Bug triage workflow
- [x] `fix-ui-alignment.md` - UI alignment fixes
- [x] `invoice-regression.md` - Invoice regression testing
- [x] `scanning-regression.md` - Scanning regression testing
- [x] `release-checklist.md` - Release checklist

### Context (`/.windsurf/context/`)
- [x] `DOMAIN.md` - Domain entities & relationships
- [x] `STATUS_MODEL.md` - Status transitions
- [x] `DB_CONVENTIONS.md` - Database conventions
- [x] `UI_STANDARDS.md` - UI design standards

---

## Content Verification

### Rules Contain
- [ ] Stack constraints (Vite SPA, NOT Next.js)
- [ ] Verification commands (npm run typecheck, lint, test)
- [ ] Protected identifier formats (INV-YYYY-NNNN, TAC########, MNF-YYYY-NNNNNN)
- [ ] Soft delete enforcement
- [ ] Org scoping requirements
- [ ] Idempotency patterns
- [ ] PDF output contracts

### Skills Contain
- [ ] Purpose statement
- [ ] Preconditions checklist
- [ ] Step-by-step procedures
- [ ] Code examples from actual codebase
- [ ] Output format templates
- [ ] Files reference tables

### Workflows Contain
- [ ] YAML frontmatter with description
- [ ] Goal statement
- [ ] Preconditions
- [ ] Numbered steps with `// turbo` annotations
- [ ] Output format templates
- [ ] Risk/Rollback section

---

## Functional Verification

### Test Skill Invocation
Invoke the `tac-project` skill and verify it provides context about:
- [ ] Stack (Vite + React 19 + TypeScript)
- [ ] Core modules (Invoices, Customers, Shipments, Manifests, Scanning)
- [ ] Response structure (Plan → Files → Patch → Test → Risk)

### Test Workflow Execution
Run `/audit-full-system` and verify:
- [ ] Documentation review step
- [ ] Module mapping step
- [ ] Automated checks (typecheck, lint, test:unit)
- [ ] Output format generated

### Test Dashboard QA Skill
Invoke `tac-dashboard-qa` and verify:
- [ ] Module-by-module checklist provided
- [ ] Playwright commands included
- [ ] Manual QA steps provided

---

## Integration Verification

### Verify Rules Apply
1. Ask Cascade to modify invoice service
2. Verify response includes:
   - [ ] Warning about invoice number format
   - [ ] Reference to DB trigger generation
   - [ ] Test plan

### Verify Context Loaded
1. Ask about shipment status transitions
2. Verify response references STATUS_MODEL.md content

### Verify Workflows Accessible
1. Type `/release-checklist`
2. Verify workflow steps are presented

---

## Sign-off

| Verifier | Date | Status |
|----------|------|--------|
| [Name] | [Date] | [ ] PASS / [ ] FAIL |

### Notes
[Any issues found during verification]
