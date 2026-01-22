---
name: tac-ui-polish
description: UI polish and consistency fixes following TAC Cargo design standards.
version: 2.0.0
tags: [tac, ui, ux, design, polish]
---

# UI Polish Skill

## Purpose
Apply consistent visual polish across TAC Cargo UI, fixing alignment issues, spacing inconsistencies, and ensuring professional appearance.

## Preconditions
- [ ] Understanding of Tailwind spacing system
- [ ] Access to shadcn/ui component library
- [ ] Dev server running for visual verification

## Design System Reference

### Spacing Scale
| Token | Value | Use Case |
|-------|-------|----------|
| `1` | 4px | Icon gaps |
| `2` | 8px | Tight padding |
| `3` | 12px | Button padding |
| `4` | 16px | Card padding |
| `6` | 24px | Section gaps |
| `8` | 32px | Page margins |

### Typography
| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Badges, labels |
| `text-sm` | 14px | Body, tables |
| `text-base` | 16px | Primary content |
| `text-lg` | 18px | Card titles |
| `text-xl` | 20px | Section headers |
| `text-2xl` | 24px | Page titles |

### Colors (Dark Mode Aware)
- Primary: `text-primary`, `bg-primary`
- Muted: `text-muted-foreground`
- Border: `border-border`
- Background: `bg-background`, `bg-card`, `bg-muted`

## Common Polish Tasks

### 1. Fix Alignment Issues
```tsx
// Before - misaligned
<div className="flex items-start">
  <Icon />
  <span className="ml-1">Text</span>
</div>

// After - aligned
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4 shrink-0" />
  <span>Text</span>
</div>
```

### 2. Consistent Card Spacing
```tsx
// Standard card pattern
<Card className="p-4">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* content */}
  </CardContent>
</Card>
```

### 3. Fix Hover Effects
```tsx
// Bad - excessive pop
<Card className="hover:scale-110 hover:shadow-2xl">

// Good - subtle emphasis
<Card className="hover:shadow-md hover:border-primary/50 transition-shadow">
```

### 4. Consistent Button Sizing
```tsx
// Table actions
<Button variant="ghost" size="sm">
  <Edit className="h-4 w-4" />
</Button>

// Form actions
<Button size="default">Submit</Button>

// Primary CTA
<Button size="lg">Create Shipment</Button>
```

### 5. Empty States
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Package className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium">No shipments yet</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Create your first shipment to get started
  </p>
  <Button className="mt-4">
    <Plus className="mr-2 h-4 w-4" />
    New Shipment
  </Button>
</div>
```

### 6. Loading States
```tsx
// Skeleton for cards
<Skeleton className="h-4 w-[250px]" />

// Spinner for actions
<Loader2 className="h-4 w-4 animate-spin" />
```

## Polish Checklist

### Spacing
- [ ] Consistent padding on cards (p-4)
- [ ] Consistent gaps in flex/grid (gap-2, gap-4)
- [ ] No arbitrary values (no p-[17px])

### Typography
- [ ] Page title is text-2xl font-semibold
- [ ] Section headers are text-xl
- [ ] Body text is text-sm
- [ ] Labels are text-xs text-muted-foreground

### Interactive Elements
- [ ] Buttons have consistent sizing
- [ ] Hover effects are subtle (no scale > 1.02)
- [ ] Focus rings visible for accessibility
- [ ] Disabled states are clear

### Responsive
- [ ] Layout works at 1024px width
- [ ] Mobile (< 640px) stacks properly
- [ ] No horizontal scroll on mobile

### States
- [ ] Empty states have message + CTA
- [ ] Loading states show skeleton/spinner
- [ ] Error states show toast + retry option

## Common Issues

| Issue | Fix |
|-------|-----|
| Misaligned icons | `items-center` + `shrink-0` on icon |
| Inconsistent gaps | Use `gap-X` instead of `ml-X` |
| Text overflow | Add `truncate` or `line-clamp-2` |
| Jarring hover | Reduce shadow/scale changes |

## Verification Steps

1. Check at 1280px (desktop)
2. Check at 1024px (laptop)
3. Check at 768px (tablet)
4. Check at 375px (mobile)
5. Test dark mode toggle
6. Verify empty/loading states

## Output Format

```markdown
## UI Polish Applied

### Changes
| File | Change | Reason |
|------|--------|--------|
| Component.tsx | Fixed spacing | Alignment issue |

### Before/After
- Before: [description]
- After: [description]

### Verification
- [ ] Desktop layout correct
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Hover effects subtle
