---
description: UI/UX standards for consistent, professional interface
activation: always
---

# UI Standards Rule

## Why This Rule Exists
TAC Cargo is used by warehouse operators, often on small screens or in challenging lighting conditions. Inconsistent UI causes:
- User confusion and errors
- Slower operations
- Training overhead
- Unprofessional appearance

This rule enforces visual consistency and usability.

---

## Spacing System

Use Tailwind's spacing scale consistently:

| Token | Value | Use Case |
|-------|-------|----------|
| `space-1` | 4px | Inline icon gaps |
| `space-2` | 8px | Tight padding, small gaps |
| `space-3` | 12px | Button padding, list item gaps |
| `space-4` | 16px | Card padding, section gaps |
| `space-6` | 24px | Major section separation |
| `space-8` | 32px | Page-level margins |

### Consistency Rules
```tsx
// Correct - consistent spacing
<Card className="p-4 space-y-3">
  <CardHeader className="pb-2" />
  <CardContent className="space-y-2" />
</Card>

// Wrong - arbitrary values
<Card className="p-[17px]">
  <div className="mt-[7px]" />
</Card>
```

---

## Typography

### Font Sizes
| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Labels, captions, badges |
| `text-sm` | 14px | Body text, table cells |
| `text-base` | 16px | Primary content |
| `text-lg` | 18px | Card titles |
| `text-xl` | 20px | Section headers |
| `text-2xl` | 24px | Page titles |

### Font Weights
- `font-normal` (400): Body text
- `font-medium` (500): Labels, subtle emphasis
- `font-semibold` (600): Titles, important values
- `font-bold` (700): Primary actions, critical info

---

## Interactive States

### Hover Effects (IMPORTANT)
**Avoid excessive "pop-out" effects** that cause layout shift:

```tsx
// Correct - subtle emphasis
<Card className="hover:shadow-md hover:border-primary/50 transition-shadow">

// Wrong - jarring scale transform
<Card className="hover:scale-110 hover:shadow-2xl"> // TOO MUCH
```

### Allowed Hover Patterns
- Shadow increase: `shadow-sm → shadow-md`
- Border color change: `border-border → border-primary/50`
- Background tint: `bg-transparent → bg-muted/50`
- Opacity change: `opacity-100 → opacity-90`

### Forbidden Patterns
- Scale transforms > 1.02
- Shadow jumps > 2 levels
- Color changes that affect layout
- Animations > 200ms

---

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

### States
- **Disabled**: Reduced opacity, no pointer events
- **Loading**: Spinner icon, disabled state
- **Focused**: Ring outline for accessibility

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

---

## Tables

### Requirements
1. **Sticky header**: For scrollable tables
2. **Row hover**: Subtle background change
3. **Empty state**: Meaningful message, not blank
4. **Loading state**: Skeleton or spinner
5. **Responsive**: Horizontal scroll on mobile

```tsx
<Table>
  <TableHeader className="sticky top-0 bg-background z-10">
    <TableRow>
      <TableHead>AWB</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.length === 0 ? (
      <TableRow>
        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
          No shipments found
        </TableCell>
      </TableRow>
    ) : (
      data.map(row => ...)
    )}
  </TableBody>
</Table>
```

---

## Dialogs & Modals

### Requirements
1. **Clear close button**: X icon or Cancel button
2. **Keyboard accessible**: Escape to close
3. **Focus trap**: Tab stays within modal
4. **Destructive confirmation**: Two-step for dangerous actions

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

### Destructive Action Pattern
```tsx
// Two-step confirmation for dangerous operations
const [confirmText, setConfirmText] = useState('');

<Input 
  placeholder="Type DELETE to confirm"
  value={confirmText}
  onChange={(e) => setConfirmText(e.target.value)}
/>
<Button 
  variant="destructive" 
  disabled={confirmText !== 'DELETE'}
>
  Confirm Delete
</Button>
```

---

## Forms

### Layout
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>
  <Button type="submit">Submit</Button>
</form>
```

### Error States
```tsx
<div className="space-y-2">
  <Label htmlFor="phone">Phone</Label>
  <Input 
    id="phone" 
    className={error ? 'border-destructive' : ''} 
  />
  {error && (
    <p className="text-sm text-destructive">{error}</p>
  )}
</div>
```

---

## Responsive Design

### Breakpoints
| Prefix | Min Width | Device |
|--------|-----------|--------|
| (none) | 0 | Mobile |
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |

### Required Patterns
```tsx
// Grid that collapses on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Sidebar that hides on mobile
<aside className="hidden lg:block w-64">

// Stack buttons on mobile
<div className="flex flex-col sm:flex-row gap-2">
```

---

## Empty States

Every list/table must have a meaningful empty state:

```tsx
{data.length === 0 && (
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
)}
```

---

## Loading States

### Skeleton Pattern
```tsx
{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
) : (
  <Content data={data} />
)}
```

### Spinner Pattern
```tsx
{isLoading && (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
)}
```
