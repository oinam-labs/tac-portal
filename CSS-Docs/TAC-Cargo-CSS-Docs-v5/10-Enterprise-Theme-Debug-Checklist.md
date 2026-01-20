# TAC Cargo — Enterprise Theme Debug Checklist (Vite + Tailwind v4 + shadcn/ui)
**Generated:** 2026-01-20  
**Audience:** TAC Frontend Team + UI/UX Engineers  
**Goal:** Ensure the *new* enterprise OKLCH theme + semantic tokens are actually applied (no stale/basic theme).

---

## 0) When to use this checklist
Use this checklist when:
- UI still looks like the **old/basic** shadcn theme
- dark mode looks wrong / inconsistent
- token updates in `globals.css` do not reflect
- badges/table styling look unchanged after changes

---

## 1) Browser verification (Fast forensics)
### 1.1 Hard reload (cache bypass)
- Windows/Linux: `Ctrl + F5`
- Or DevTools → Network → ✅ Disable cache → reload

References:
- Chrome DevTools disable cache guidance. citeturn0search3turn0search19  
- Hard reload shortcut discussion. citeturn0search13turn0search16  

### 1.2 Confirm which CSS bundle is loaded
DevTools → Network → filter: `css`

Open the main CSS bundle response and search for:
- `--background: oklch(`
- `--sidebar:`
- `.badge--`

If you cannot find them, you are NOT loading the new CSS.

---

## 2) Runtime token verification (Ground truth)
DevTools → Elements → select `<html>` then `<body>`

Check Computed CSS variables:
- `--background`
- `--foreground`
- `--primary`
- `--border`
- `--sidebar`

✅ Must match the **new OKLCH values** from your updated globals.

---

## 3) Tailwind CSS v4 pipeline sanity
Tailwind v4 requires importing Tailwind through:
```css
@import "tailwindcss";
```

References:
- Tailwind v4 announcement (one-line import). citeturn0search0  
- Tailwind docs (Vite setup includes @import tailwindcss). citeturn0search4  
- Tailwind upgrade guide notes PostCSS changes and v4 pipeline. citeturn0search6  

---

## 4) shadcn/ui theming sanity
All shadcn themes must define colors inside:
- `:root Ellipsis`
- `.dark Ellipsis`

Reference:
- shadcn/ui theming docs. citeturn0search1turn0search20  
- Vercel Academy deep dive on globals.css architecture. citeturn0search14  

---

## 5) Project-level CSS import audit (Most common root cause)
### 5.1 Entry file imports
Verify app entry file imports the correct global CSS:
- `main.tsx` / `index.tsx`

✅ Requirement:
- Exactly ONE global CSS import for the whole app
- It must point to the file you edited (`globals.css`)

### 5.2 Detect duplicate global CSS sources
Search for multiple theme blocks:
```bash
grep -RIn ":root" src styles | head -n 50
grep -RIn "\.dark" src styles | head -n 50
```

If multiple files define tokens, one will override the other.

---

## 6) Vite cache / HMR issues (CSS not updating)
If tokens exist but UI is stale, clear Vite caches.

### 6.1 Clear Vite cache folder
Delete:
- `node_modules/.vite`
- `dist`

Then restart dev server.

Reference:
- Vite cache directory + clearing cache (discussion). citeturn0search5turn0search9  
- Vite troubleshooting guide. citeturn0search12  

---

## 7) “Theme applied but UI still basic” (Hardcoded slate/gray problem)
Even if tokens load correctly, UI looks basic if components bypass tokens.

### 7.1 Find all banned hardcoded colors
```bash
grep -RInE "(text|bg|border|ring)-(slate|gray)-" src
```

✅ Enterprise goal: **0 results**

---

## 8) Verification gates (must pass)
After each refactor set:

```bash
npm run typecheck
npm run build
npm run preview
```

If `preview` looks correct but dev doesn’t:
- it is likely dev HMR/caching

---

## 9) Definition of Done
This theme migration is complete when:
- UI matches enterprise theme in both light & dark
- variables in DevTools match new OKLCH tokens
- no duplicate globals override tokens
- hardcoded slate/gray usage count is 0 in `src/`
