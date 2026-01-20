# TAC Cargo — Token Migration Guide (Remove Hardcoded Slate/Gray)
**Generated:** 2026-01-20

This is a prescriptive guide to eliminate hardcoded Tailwind colors and migrate to semantic tokens.

Reference:
- shadcn semantic theming approach (purpose-based tokens). citeturn0search8turn0search16

---

## Golden Rule
Replace color intent, not literal values.

Examples:
- **Secondary text** → `text-muted-foreground`
- **Panel background** → `bg-card`
- **Subtle background** → `bg-muted`
- **Borders** → `border-border`
- **Interactive focus** → `ring-ring`

---

## Mandatory Review Checklist
- [ ] No `text-slate-*` or `text-gray-*` used
- [ ] No `bg-slate-*` or `bg-gray-*` used
- [ ] No `border-slate-*` or `border-gray-*` used
- [ ] Dark mode handled by tokens only
