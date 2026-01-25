# TAC Cargo — CSS Enforcement & CI Rules (Enterprise)
**Generated:** 2026-01-20  
**Purpose:** Prevent regression of hardcoded colors (`slate/gray`) and enforce semantic-token usage across the TAC dashboard.

---

## 1) Why enforcement is required
TAC already has a strong design token system (OKLCH + shadcn semantic variables). The primary risk is that developers will continue adding hardcoded Tailwind colors (e.g., `text-slate-500`, `bg-gray-100`) which breaks:

- theme consistency
- dark mode reliability
- future branding/theme changes
- long-term maintainability

shadcn specifically recommends theming via CSS variables and semantic token naming. citeturn0search1turn0search5

---

## 2) Enforcement Strategy (Layered)
Enterprise enforcement should be layered:

1) **Developer tooling** (IDE assistance)
2) **Lint rules** (fast feedback)
3) **CI grep checks** (zero-regression gate)
4) **Code review policy** (human governance)

---

## 3) ESLint Enforcement (Recommended)
### 3.1 Install Tailwind ESLint plugin
Use:
- `eslint-plugin-tailwindcss`

Reference:
- npm package docs for `eslint-plugin-tailwindcss`. citeturn0search4

### 3.2 Recommended ESLint rules
Extend:
- `plugin:tailwindcss/recommended`

Enable rules that reduce class hygiene issues:
- `tailwindcss/no-arbitrary-value` (warn or error) citeturn0search0
- `tailwindcss/no-custom-classname` (warn) citeturn0search8

> Note: If you use custom classes like `.badge--delivered`, configure allowlists; do not disable enforcement.

---

## 4) CI Hard Gate (Must Have)
Lint is helpful but can be bypassed. A CI grep gate cannot.

### 4.1 Hardcoded color ban patterns
Ban in `src/`:
- `text-slate-`
- `bg-slate-`
- `border-slate-`
- `ring-slate-`
- `text-gray-`
- `bg-gray-`
- `border-gray-`
- `ring-gray-`

### 4.2 CI grep check (POSIX shell)
Run in CI:

```bash
set -e

echo "Checking for hardcoded slate/gray Tailwind classes..."
if grep -RInE "(text|bg|border|ring)-(slate|gray)-" src; then
  echo "❌ Found hardcoded Tailwind slate/gray classes. Use semantic tokens instead."
  exit 1
else
  echo "✅ No hardcoded slate/gray classes found."
fi
```

### 4.3 Windows PowerShell version
```powershell
$pattern = "(text|bg|border|ring)-(slate|gray)-"
$matches = Select-String -Path "src\**\*.{ts,tsx,js,jsx}" -Pattern $pattern -AllMatches

if ($matches) {
  Write-Host "❌ Found hardcoded slate/gray classes. Use semantic tokens."
  $matches | ForEach-Object { Write-Host $_.Path ":" $_.LineNumber ":" $_.Line }
  exit 1
} else {
  Write-Host "✅ No hardcoded slate/gray classes found."
}
```

---

## 5) Governance Rule: Only semantic tokens allowed
### 5.1 Allowed semantic tokens
Approved utilities include:
- `text-foreground`
- `text-muted-foreground`
- `bg-background`
- `bg-card`
- `bg-muted`
- `border-border`
- `ring-ring`
- `text-primary`, `bg-primary`, `border-primary`

This aligns with the shadcn semantic token approach. citeturn0search1turn0search5

### 5.2 Exceptions (allowed hardcoded colors)
Hardcoded colors are allowed ONLY for:
- charts (if using `--chart-1..5`)
- print styles (shipping labels)
- 3rd party vendor branding (rare)
- images/logos

All exceptions must be documented in PR description.

---

## 6) Accessibility Enforcement (Contrast)
Even after removing hardcoded colors, themes must remain readable.

### 6.1 Minimum contrast
WCAG AA requires **4.5:1** contrast for normal text. citeturn0search2turn0search10

Recommendation:
- run manual contrast checks for key UI states
- use tooling like WebAIM Contrast Checker citeturn0search6

---

## 7) Developer Experience (DX)
### 7.1 Tailwind IntelliSense for classRegex
If the project uses class maps (e.g., config objects), enable Tailwind IntelliSense via classRegex.

Reference:
- Tailwind IntelliSense classRegex approach. citeturn0search7

---

## 8) Pull Request Checklist (Mandatory)
Add PR template checklist:

- [ ] No `slate/gray` hardcoded Tailwind colors added
- [ ] All new UI uses semantic tokens
- [ ] Dark mode verified
- [ ] Focus states verified
- [ ] No contrast regressions

---

## 9) Definition of Done
Enforcement is complete when:
- CI blocks any `slate/gray` hardcoded classes under `src/`
- ESLint tailwind rules run locally
- Code review policy references this doc
- Search count for banned patterns is **0**
