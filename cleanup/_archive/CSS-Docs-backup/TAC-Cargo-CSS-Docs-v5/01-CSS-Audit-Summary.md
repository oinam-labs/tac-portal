# TAC Cargo — CSS Audit Summary
**Generated:** 2026-01-20  
**Project:** TAC Portal

This document captures the current CSS/Theme audit findings and converts them into an actionable enterprise cleanup plan.

---

## Key Findings
- ✅ Strong token architecture using **OKLCH** and semantic CSS variables
- ✅ Full dark mode implementation via `.dark`
- ✅ Accessibility enhancements (reduced motion, focus-visible, high contrast)
- ⚠️ Color consistency problem: **457 hardcoded Tailwind slate/gray uses** across components/pages

---

## Strategic Recommendation
### Principle: “No raw colors in components”
All UI colors should come from theme tokens (semantic utilities):
- `text-foreground`
- `text-muted-foreground`
- `bg-background`
- `bg-card`
- `bg-muted`
- `border-border`
- `ring-ring`

This aligns with shadcn/ui theming best practice. citeturn0search0

---

## Refactor Plan (Phased)
### Phase 1 — Top offenders (Highest ROI)
Refactor first:
- `PublicTracking.tsx`
- `CustomerDetails.tsx`
- `InvoiceDetails.tsx`

### Phase 2 — Remaining instances
Refactor remaining files gradually.

### Phase 3 — Enforce via linting
Introduce rules/process to prevent regressions.

---

## Recommended Token Mappings
| Hardcoded | Replace with |
|---|---|
| `text-slate-500 dark:text-slate-400` | `text-muted-foreground` |
| `bg-slate-100 dark:bg-slate-800` | `bg-muted` |
| `border-slate-200 dark:border-slate-700` | `border-border` |
