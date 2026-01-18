---
name: tac-component-architect
description: Expert shadcn/ui component architect for TAC Portal. Use when creating new components, refactoring UI, ensuring design system consistency, or building complex form interactions.
---

# TAC Component Architect - Shadcn/UI Expert

## Design Philosophy
**Composition over Configuration**. Build small, focused components that compose into powerful interfaces. Every component should be:
- **Accessible**: WCAG 2.1 AA compliant
- **Themeable**: Works in light/dark mode
- **Responsive**: Mobile-first design
- **Performant**: Minimal re-renders

---

## Component Patterns

### 1. Form Components (Invoice/Shipment Forms)

**Pattern**: Multi-step wizard with `react-hook-form` + `zod`

```tsx
// ✅ RECOMMENDED STRUCTURE
interface StepProps {
  form: UseFormReturn<FormData>;
  onNext: () => void;
  onBack: () => void;
}

function Step1Basics({ form, onNext }: StepProps) {
  const { register, formState: { errors } } = form;
  
  return (
    <div className="space-y-6">
      <FormField
        label="AWB Number"
        error={errors.awb?.message}
        required
      >
        <Input {...register('awb')} placeholder="TAC48878789" />
      </FormField>
      
      <Button onClick={onNext}>Continue</Button>
    </div>
  );
}
```

**Key Principles**:
- Lift state to parent (FormProvider)
- Each step is a pure component
- Validation happens on-submit, not on-change
- Progress indicator shows current step

### 2. Data Tables (Invoice List, Shipment List)

**Pattern**: Server-side pagination with filters

```tsx
// ✅ RECOMMENDED STRUCTURE
function InvoiceTable({ filters }: { filters: FilterState }) {
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters)
  });

  if (isLoading) return <Skeleton rows={10} />;

  return (
    <Table>
      <TableHeader>...</TableHeader>
      <TableBody>
        {data.map(invoice => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.invoiceNumber}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(invoice.status)}>
                {invoice.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Enhancements**:
- Row selection with checkboxes
- Column sorting (click header)
- Bulk actions (delete, export)
- Virtual scrolling for 1000+ rows

### 3. Search & Autocomplete (Customer Search)

**Pattern**: Debounced input with fuzzy matching

```tsx
function CustomerSearch({ onSelect }: { onSelect: (c: Customer) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results } = useQuery({
    queryKey: ['customers', debouncedQuery],
    queryFn: () => searchCustomers(debouncedQuery),
    enabled: debouncedQuery.length > 2
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
        />
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandList>
            {results?.map(customer => (
              <CommandItem
                key={customer.id}
                onSelect={() => onSelect(customer)}
              >
                {customer.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### 4. Modal Dialogs (Shipment Details, Confirmation)

**Pattern**: Controlled component with escape key handling

```tsx
function ShipmentDetailsDialog({ 
  open, 
  onClose, 
  shipmentId 
}: DialogProps) {
  const { data } = useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: () => fetchShipment(shipmentId),
    enabled: !!shipmentId && open
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Shipment {data?.awb}</DialogTitle>
          <DialogDescription>
            Track and manage shipment details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content */}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Mark as Delivered</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Shadcn/UI Component Library

### Available Components

**Forms**:
- `Input` - Text inputs with validation states
- `Select` - Dropdown selectors
- `Checkbox` - Boolean toggles
- `RadioGroup` - Single-choice options
- `Switch` - On/off toggle
- `Textarea` - Multi-line text
- `DatePicker` - Calendar selection

**Feedback**:
- `Toast` - Notification messages (via Sonner)
- `Alert` - Inline messages
- `Badge` - Status indicators
- `Progress` - Loading bars
- `Skeleton` - Loading placeholders

**Overlays**:
- `Dialog` - Modal windows
- `Sheet` - Slide-in panels
- `Popover` - Floating menus
- `Tooltip` - Hover hints
- `DropdownMenu` - Action menus

**Navigation**:
- `Tabs` - Content switching
- `Accordion` - Collapsible sections
- `Breadcrumb` - Page hierarchy
- `Pagination` - Page navigation

**Layout**:
- `Card` - Content containers
- `Separator` - Visual dividers
- `ScrollArea` - Scrollable regions
- `Table` - Data grids

### Installation
```bash
# Add new component
npx shadcn-ui@latest add [component-name]

# Example
npx shadcn-ui@latest add dialog
```

---

## Design Tokens (Tailwind CSS)

### Color Palette
```css
/* Primary (Purple) */
bg-primary text-primary border-primary

/* Accent (Cyan) */
bg-accent text-accent

/* Status Colors */
bg-success/20 text-success (Green)
bg-destructive/20 text-destructive (Red)
bg-warning/20 text-warning (Yellow)

/* Neutrals */
bg-background (White/Dark)
bg-card (Elevated surface)
bg-muted (Subdued background)
```

### Spacing Scale
```css
gap-1  /* 0.25rem = 4px */
gap-2  /* 0.5rem = 8px */
gap-3  /* 0.75rem = 12px */
gap-4  /* 1rem = 16px */
gap-6  /* 1.5rem = 24px */
gap-8  /* 2rem = 32px */
```

### Typography
```css
text-xs   /* 12px */
text-sm   /* 14px */
text-base /* 16px */
text-lg   /* 18px */
text-xl   /* 20px */
text-2xl  /* 24px */
text-3xl  /* 30px */
```

---

## Accessibility Checklist

**Keyboard Navigation**:
- [ ] Tab order is logical
- [ ] Escape closes modals
- [ ] Enter submits forms
- [ ] Arrow keys navigate lists

**Screen Readers**:
- [ ] All images have `alt` text
- [ ] Buttons have descriptive labels
- [ ] Form inputs have associated `<label>`
- [ ] ARIA roles where HTML semantics insufficient

**Focus Management**:
- [ ] Focus trap in modals
- [ ] Focus returns to trigger after close
- [ ] Focus indicators visible (outline)

---

## Component Resources

Review `resources/` for:
- `component-template.tsx` - Boilerplate structure
- `form-patterns.md` - Common form recipes
- `table-examples.tsx` - Data table variations

---

## When to Use This Skill

- "Create a new component"
- "Build a form for [entity]"
- "Add a data table"
- "Make this accessible"
- "Follow shadcn patterns"
