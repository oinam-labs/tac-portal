# UI Standards — TAC Cargo

## Technology Stack
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion + GSAP (subtle only)
- **Icons**: Lucide React

## Spacing System

Use Tailwind's spacing scale consistently:

| Token | Value | Use Case |
|-------|-------|----------|
| `1` | 4px | Inline icon gaps |
| `2` | 8px | Tight padding, small gaps |
| `3` | 12px | Button padding, list item gaps |
| `4` | 16px | Card padding, section gaps |
| `6` | 24px | Major section separation |
| `8` | 32px | Page-level margins |

**Rules**:
- Use spacing tokens, not arbitrary values (`p-4`, not `p-[17px]`)
- Use `gap-X` instead of margin chains (`gap-2`, not `ml-2 mr-2`)

## Typography

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Labels, badges, captions |
| `text-sm` | 14px | Body text, table cells |
| `text-base` | 16px | Primary content |
| `text-lg` | 18px | Card titles |
| `text-xl` | 20px | Section headers |
| `text-2xl` | 24px | Page titles |

**Font weights**:
- `font-normal` (400): Body text
- `font-medium` (500): Labels, subtle emphasis
- `font-semibold` (600): Titles, important values
- `font-bold` (700): Primary actions, critical info

## Interactive States

### Hover Effects (IMPORTANT)
Avoid excessive "pop-out" effects that cause layout shift:

```tsx
// Good - subtle emphasis
<Card className="hover:shadow-md hover:border-primary/50 transition-shadow">

// Bad - jarring effect
<Card className="hover:scale-110 hover:shadow-2xl">
```

**Allowed**:
- Shadow: `shadow-sm` → `shadow-md` (max 2 levels)
- Border color: `border-border` → `border-primary/50`
- Background: `bg-transparent` → `bg-muted/50`

**Forbidden**:
- Scale transforms > 1.02
- Shadow jumps > 2 levels
- Animations > 200ms

### Focus States
All interactive elements must have visible focus:
```tsx
<Button className="focus:ring-2 focus:ring-primary">
```

### Disabled States
```tsx
<Button disabled className="opacity-50 cursor-not-allowed">
```

## Buttons

### Variants
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Tertiary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Dangerous Action</Button>
```

### Sizing
| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 32px | Table actions, compact UI |
| `default` | 40px | Standard forms |
| `lg` | 48px | Primary CTA, mobile |

## Tables

### Requirements
- **Sticky header** for scrollable tables
- **Row hover** with subtle background change
- **Empty state** with meaningful message + CTA
- **Loading state** with skeleton or spinner
- **Responsive** with horizontal scroll on mobile

```tsx
<Table>
  <TableHeader className="sticky top-0 bg-background z-10">
    ...
  </TableHeader>
  <TableBody>
    {data.length === 0 ? (
      <EmptyState message="No shipments found" />
    ) : (
      data.map(row => <Row key={row.id} />)
    )}
  </TableBody>
</Table>
```

## Empty States

Every list/table needs a meaningful empty state:
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

## Dialogs

### Requirements
- Clear close button (X icon or Cancel)
- Keyboard accessible (Escape to close)
- Focus trap (Tab stays within modal)
- Two-step confirmation for destructive actions

```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Shipment?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="destructive" onClick={onDelete}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Responsive Breakpoints

| Prefix | Min Width | Device |
|--------|-----------|--------|
| (none) | 0 | Mobile |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

**Required patterns**:
```tsx
// Grid that collapses on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Sidebar that hides on mobile
<aside className="hidden lg:block w-64">

// Stack buttons on mobile
<div className="flex flex-col sm:flex-row gap-2">
