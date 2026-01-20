# TAC Cargo — Refactor Checklist (Top 10 Files)
**Generated:** 2026-01-20  
**Objective:** Remove hardcoded Tailwind slate/gray colors and migrate to semantic tokens for enterprise-grade theming.

---

## 0) Why this refactor is mandatory
The TAC Portal already has a strong semantic token system using CSS variables and OKLCH. The current issue is **inconsistent usage** of hardcoded Tailwind colors (e.g. `text-slate-500`, `bg-gray-100`) inside components/pages instead of using semantic tokens like `text-muted-foreground`, `bg-muted`, `border-border`.

This breaks:
- theme consistency
- future theme switching
- dark mode reliability
- maintainability and design governance

References:
- shadcn/ui theming uses semantic `background/foreground` convention. citeturn0search0  
- Tailwind theme variables are intended as design tokens and an API. citeturn0search9  
- WCAG minimum contrast guidance (AA: 4.5:1 for normal text). citeturn0search3turn0search11  

---

## 1) High-level approach (Enterprise safe)
### ✅ Rule 1 — Replace intent, not literal color
Do **not** translate colors like:
- `slate-500` → `slate-500`

Instead translate meaning:
- secondary text → `text-muted-foreground`
- subtle panel background → `bg-muted`
- container background → `bg-card`
- layout background → `bg-background`

### ✅ Rule 2 — No `dark:` overrides for basic colors
If a component uses semantic tokens, dark mode is already handled.

Example:
- ❌ `text-slate-600 dark:text-slate-300`
- ✅ `text-foreground`

### ✅ Rule 3 — Prefer component-level tokens
Use:
- `text-foreground`
- `text-muted-foreground`
- `bg-background`
- `bg-card`
- `bg-muted`
- `border-border`
- `ring-ring`

---

## 2) Target files (Top offenders list)
Start from highest hardcoded usage first.

### Tier 1 (must fix first)
1. `src/pages/PublicTracking.tsx`
2. `src/components/customers/CustomerDetails.tsx`
3. `src/components/invoices/InvoiceDetails.tsx`

### Tier 2
4. `src/components/exceptions/ExceptionDetails.tsx`
5. `src/components/shipments/ShipmentDetails.tsx`
6. `src/components/shipments/ShipmentCard.tsx`

### Tier 3
7. `src/pages/Settings.tsx`
8. `src/pages/Inventory.tsx`
9. `src/pages/Finance.tsx` *(or Business module equivalent)*
10. Next highest offender by search count

> If actual paths differ, locate by searching the repo using global find.

---

## 3) One-time scanning commands (required)
Run these from repo root:

### 3.1 Find all hardcoded colors
```bash
grep -RIn "text-slate-|bg-slate-|border-slate-|text-gray-|bg-gray-|border-gray-" src
```

### 3.2 Create a refactor log snapshot
Output search results to:
- `docs/audits/color-hardcode-scan-2026-01-20.txt`

---

## 4) Standard mapping table
Use this mapping consistently:

| Hardcoded pattern | Replace with |
|---|---|
| `text-slate-500 dark:text-slate-400` | `text-muted-foreground` |
| `text-slate-600 dark:text-slate-300` | `text-foreground` |
| `bg-slate-50` / `bg-slate-100` | `bg-muted` or `bg-background` (context-dependent) |
| `bg-white dark:bg-slate-900` | `bg-card` |
| `border-slate-200 dark:border-slate-700` | `border-border` |
| `ring-slate-*` | `ring-ring` |
| `hover:bg-slate-*` | `hover:bg-muted` or `hover:bg-accent` |
| `text-blue-*` for links | `text-primary` |

---

## 5) Per-file execution checklist (repeat for each file)
For each target file:

### Step A — Inventory usages
- [ ] Count occurrences of `slate`/`gray` colors
- [ ] Identify context: text vs background vs border vs hover

### Step B — Replace with semantic tokens
- [ ] Replace all `text-slate-*` and `text-gray-*`
- [ ] Replace all `bg-slate-*` and `bg-gray-*`
- [ ] Replace all `border-slate-*` and `border-gray-*`
- [ ] Remove redundant `dark:` overrides

### Step C — Verify UI integrity
- [ ] Tables are readable in light + dark
- [ ] Disabled states are still visually clear
- [ ] Hover/focus states remain visible
- [ ] No contrast regressions (AA minimum)

### Step D — Regression check
- [ ] Verify “empty states”
- [ ] Verify “loading skeletons”
- [ ] Verify error banners/toasts

---

## 6) Module-specific guidelines
### 6.1 Public Tracking page (high visibility)
- MUST look clean in both light/dark
- MUST have enterprise clarity
- Use only semantic tokens
- Avoid aggressive “gray” blocks: use `bg-card` and `bg-muted`

### 6.2 Invoice Details (finance correctness UI)
- highlight totals with `text-foreground`
- secondary metadata with `text-muted-foreground`
- border separation with `border-border`

### 6.3 Shipment Cards (operations UI)
- status badge must use approved badge variants
- avoid one-off color states
- status color = status tokens only

---

## 7) Verification commands (required)
After each batch of edits:

```bash
npm run typecheck
npm run build
npm run dev
```

Also verify:
- dark mode toggle
- sidebar background/foreground
- tables legibility

---

## 8) Enterprise enforcement (prevent regressions)
### Recommended governance
- Add pre-merge review rule: **no `slate`/`gray` tokens in components**
- Add lint rule or CI grep check:
  - fail PR if `text-slate-` appears under `src/`

Tailwind encourages theme variables as design tokens, not random hardcoding. citeturn0search1turn0search9  

---

## 9) Completion definition
This refactor is “complete” only when:
- Search count for `text-slate-|bg-slate-|border-slate-|text-gray-|bg-gray-|border-gray-` in `src/` is **0**
- Theme behaves correctly in both light and dark
- Status badges use semantic status tokens exclusively
