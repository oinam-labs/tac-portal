---
name: tac-accessibility-auditor
description: Accessibility (a11y) expert for TAC Portal. Use when auditing WCAG 2.1 compliance, fixing accessibility issues, implementing keyboard navigation, or ensuring screen reader compatibility.
metadata:
  author: tac-portal
  version: "1.0"
---

# TAC Accessibility Auditor

## Compliance Target
**WCAG 2.1 Level AA** - Legal requirement for enterprise software serving diverse users including warehouse staff who may have visual, motor, or cognitive disabilities.

---

## Core Principles (POUR)

### 1. Perceivable
Users must be able to perceive the information presented.

### 2. Operable
Users must be able to operate the interface.

### 3. Understandable
Information and operation must be understandable.

### 4. Robust
Content must be robust enough for assistive technologies.

---

## Critical Requirements

### Color Contrast (WCAG 1.4.3)

**Minimum ratios:**
- Normal text: 4.5:1
- Large text (18px+ bold, 24px+): 3:1
- UI components: 3:1

```tsx
// ❌ FAIL: Low contrast
<p className="text-gray-400 bg-gray-200">Hard to read</p>

// ✅ PASS: Sufficient contrast
<p className="text-gray-900 bg-gray-100">Easy to read</p>
```

**Testing:**
```bash
# Chrome DevTools
1. Right-click element → Inspect
2. Styles panel → Color picker
3. Check "Contrast ratio" indicator
```

### Focus Indicators (WCAG 2.4.7)

```tsx
// ❌ FAIL: Removed focus outline
<button className="focus:outline-none">Click</button>

// ✅ PASS: Visible focus ring
<button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Click
</button>
```

**Global focus styles:**
```css
/* globals.css */
*:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

### Keyboard Navigation (WCAG 2.1.1)

**Every interactive element must be:**
1. Focusable via Tab key
2. Activatable via Enter/Space
3. Escapable (modals close on Escape)

```tsx
// Custom button with keyboard support
function ActionButton({ onClick, children }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
```

### Form Labels (WCAG 1.3.1, 3.3.2)

```tsx
// ❌ FAIL: No label association
<input type="text" placeholder="Enter AWB" />

// ✅ PASS: Explicit label
<label htmlFor="awb-input">AWB Number</label>
<input id="awb-input" type="text" aria-describedby="awb-hint" />
<span id="awb-hint">Format: TAC followed by 8 digits</span>

// ✅ PASS: Using FormField component (Shadcn)
<FormField
  control={form.control}
  name="awb"
  render={({ field }) => (
    <FormItem>
      <FormLabel>AWB Number</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Format: TAC followed by 8 digits</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## ARIA Patterns

### Icon-Only Buttons

```tsx
// ❌ FAIL: No accessible name
<button onClick={onDelete}>
  <TrashIcon />
</button>

// ✅ PASS: aria-label
<button onClick={onDelete} aria-label="Delete invoice">
  <TrashIcon aria-hidden="true" />
</button>

// ✅ PASS: Visually hidden text
<button onClick={onDelete}>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Delete invoice</span>
</button>
```

### Status Messages

```tsx
// Live region for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  {status === 'loading' && 'Loading invoices...'}
  {status === 'success' && `${count} invoices loaded`}
  {status === 'error' && 'Failed to load invoices'}
</div>
```

### Modals/Dialogs

```tsx
// Shadcn Dialog (already accessible)
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Details</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Shipment Details</DialogTitle>
      <DialogDescription>
        View and manage shipment information
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Required behaviors:**
- Focus trapped inside modal
- Escape key closes modal
- Focus returns to trigger on close
- Background content hidden from screen readers

### Data Tables

```tsx
<table role="grid" aria-label="Invoices list">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Invoice #</th>
      <th scope="col">Customer</th>
      <th scope="col">Amount</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {invoices.map((invoice) => (
      <tr key={invoice.id}>
        <td>{invoice.number}</td>
        <td>{invoice.customer}</td>
        <td>₹{invoice.amount.toLocaleString()}</td>
        <td>
          <button aria-label={`View invoice ${invoice.number}`}>
            View
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### Tabs

```tsx
<Tabs defaultValue="overview">
  <TabsList aria-label="Shipment sections">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="packages">Packages</TabsTrigger>
    <TabsTrigger value="timeline">Timeline</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Content */}
  </TabsContent>
</Tabs>
```

---

## Image Accessibility

### Informative Images

```tsx
// ❌ FAIL: Missing alt
<img src="/shipment-map.png" />

// ✅ PASS: Descriptive alt
<img 
  src="/shipment-map.png" 
  alt="Shipment route from Imphal to New Delhi, currently in transit at Patna"
/>
```

### Decorative Images

```tsx
// Hide from screen readers
<img src="/decorative-bg.png" alt="" role="presentation" />

// Or use CSS background
<div className="bg-[url('/decorative-bg.png')]" />
```

---

## Testing Tools

### Automated

```bash
# axe-core (best automated scanner)
npm install -D @axe-core/react

# Usage in component
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

**Keyboard:**
- [ ] Can Tab through all interactive elements
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Focus indicator visible on all focused elements
- [ ] Can activate buttons with Enter or Space
- [ ] Can close modals with Escape
- [ ] No keyboard traps

**Screen Reader (NVDA/VoiceOver):**
- [ ] Page title announced on load
- [ ] Headings create logical outline
- [ ] Links/buttons have descriptive names
- [ ] Form labels announced with inputs
- [ ] Error messages announced
- [ ] Dynamic content updates announced

**Visual:**
- [ ] Text resizes to 200% without breaking
- [ ] Color is not the only way to convey info
- [ ] Contrast ratios meet requirements
- [ ] No text in images

---

## Common Issues & Fixes

### Issue: Click handler on div

```tsx
// ❌ Not keyboard accessible
<div onClick={handleClick}>Click me</div>

// ✅ Use button
<button onClick={handleClick}>Click me</button>

// ✅ Or add keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Issue: Status badges rely on color only

```tsx
// ❌ Only color indicates status
<span className={status === 'error' ? 'bg-red-500' : 'bg-green-500'} />

// ✅ Text + icon + color
<Badge variant={status}>
  {status === 'error' && <AlertIcon aria-hidden />}
  {status}
</Badge>
```

### Issue: Form errors not announced

```tsx
// ❌ Error not associated
<input />
{error && <span className="text-red-500">{error}</span>}

// ✅ Error linked and announced
<input 
  aria-invalid={!!error}
  aria-describedby={error ? 'input-error' : undefined}
/>
{error && (
  <span id="input-error" role="alert" className="text-red-500">
    {error}
  </span>
)}
```

### Issue: Missing skip link

```tsx
// Add to top of page
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white p-2 z-50"
>
  Skip to main content
</a>

// Target in main
<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

---

## Accessibility Audit Report Template

```markdown
# Accessibility Audit: [Page/Component Name]

**Date:** YYYY-MM-DD
**Auditor:** [Name]
**WCAG Version:** 2.1 AA

## Summary
- Critical Issues: X
- Major Issues: X
- Minor Issues: X
- **Compliance Status:** [Pass/Fail]

## Critical Issues (P1)
Must fix before release

| ID | Issue | WCAG | Location | Fix |
|----|-------|------|----------|-----|
| 1 | Missing form labels | 1.3.1 | Login form | Add `<label>` elements |

## Major Issues (P2)
Fix within sprint

| ID | Issue | WCAG | Location | Fix |
|----|-------|------|----------|-----|

## Minor Issues (P3)
Fix when possible

| ID | Issue | WCAG | Location | Fix |
|----|-------|------|----------|-----|

## Passed Checks
- ✅ Color contrast (4.5:1+)
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Alt text on images
```

---

## When to Use This Skill

- "Audit this page for accessibility"
- "Make this component accessible"
- "Fix screen reader issues"
- "Add keyboard navigation"
- "Check WCAG compliance"
- "Add ARIA labels"
