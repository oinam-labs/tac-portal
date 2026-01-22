---
description: Fix UI alignment and spacing inconsistencies
---

# /fix-ui-alignment — UI Alignment Fix Workflow

## Goal
Identify and fix UI alignment, spacing, and visual consistency issues across the application.

## Preconditions
- Dev server running (`npm run dev`)
- Understanding of Tailwind spacing system
- Access to design reference (if exists)

## Steps

### Step 1: Visual Audit
Review each page at multiple breakpoints:
- Desktop (1280px+)
- Laptop (1024px)
- Tablet (768px)
- Mobile (375px)

### Step 2: Common Issues Checklist

#### Spacing Issues
- [ ] Inconsistent card padding (should be p-4)
- [ ] Inconsistent gaps (should use gap-X, not ml-X)
- [ ] Arbitrary values (p-[17px] instead of p-4)
- [ ] Missing responsive spacing

#### Alignment Issues
- [ ] Icons not vertically centered (need items-center)
- [ ] Text baseline misalignment
- [ ] Buttons different heights
- [ ] Form labels misaligned

#### Typography Issues
- [ ] Inconsistent font sizes
- [ ] Missing font weights
- [ ] Wrong text colors

#### Interactive Issues
- [ ] Excessive hover effects (scale > 1.02)
- [ ] Missing focus states
- [ ] Unclear disabled states

### Step 3: Identify Fixes

For each issue:
```markdown
| Location | Issue | Fix |
|----------|-------|-----|
| `Component.tsx:42` | Icon misaligned | Add `items-center` |
| `Page.tsx:88` | Inconsistent padding | Change to `p-4` |
```

### Step 4: Apply Fixes

#### Fix Pattern: Icon Alignment
```tsx
// Before
<div className="flex items-start">
  <Icon />
  <span className="ml-1">Text</span>
</div>

// After
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 shrink-0" />
  <span>Text</span>
</div>
```

#### Fix Pattern: Consistent Spacing
```tsx
// Before
<Card className="p-3 md:p-5">

// After
<Card className="p-4">
```

#### Fix Pattern: Hover Effects
```tsx
// Before
<Card className="hover:scale-105 hover:shadow-xl">

// After
<Card className="hover:shadow-md hover:border-primary/50 transition-shadow">
```

### Step 5: Verify Fixes
- [ ] Check all breakpoints
- [ ] Toggle dark mode
- [ ] Test interactive states
- [ ] Check empty/loading states

### Step 6: Run Checks
```bash
// turbo
npm run lint

// turbo
npm run typecheck
```

## Output Format

```markdown
## UI Alignment Fixes Applied

### Issues Found: X
### Issues Fixed: X

### Changes

| File | Line | Before | After | Reason |
|------|------|--------|-------|--------|
| `Component.tsx` | 42 | `items-start` | `items-center` | Icon alignment |
| `Page.tsx` | 88 | `p-3` | `p-4` | Consistent padding |

### Verification
- [x] Desktop (1280px+): PASS
- [x] Laptop (1024px): PASS
- [x] Tablet (768px): PASS
- [x] Mobile (375px): PASS
- [x] Dark mode: PASS

### Screenshots
[Before/after if applicable]

### Remaining Issues
- [ ] [Issue not fixed in this pass]

## Risk/Rollback
- Risk: Visual changes may affect existing layouts
- Rollback: Git revert if visual regression detected
