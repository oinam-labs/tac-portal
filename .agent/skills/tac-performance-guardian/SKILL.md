---
name: tac-performance-guardian
description: Performance monitoring and optimization expert for TAC Portal. Use when diagnosing slow renders, optimizing bundle size, improving Core Web Vitals, or ensuring 60fps interactions.
---

# TAC Performance Guardian

## Performance Budget(Non-Negotiable)

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Custom Metrics
- **Invoice Creation**: < 2s (p95)
- **Search Results**: < 300ms
- **Page Transitions**: < 200ms
- **Bundle Size**: < 300KB (gzipped)

---

## Diagnostics

### 1. Identify Slow Components

**React DevTools Profiler**:
```tsx
// Wrap suspicious component
<Profiler
  id="InvoiceForm"
  onRender={(id, phase, actualDuration) => {
    if (actualDuration > 16) { // > 1 frame (60fps)
      console.warn(`${id} took ${actualDuration}ms`);
    }
  }}
>
  <InvoiceForm />
</Profiler>
```

**Why Did You Render?**:
```bash
npm install @welldone-software/why-did-you-render
```

```tsx
// index.tsx
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true
  });
}
```

### 2. Bundle Analysis

**Run**:
```bash
# Vite
npm run build -- --mode analyze

# Check output
ls -lh dist/assets/*.js
```

**Script** (`scripts/analyze-bundle.sh`):
```bash
#!/bin/bash
# Identify large dependencies
npx vite-bundle-visualizer

# Check tree-shaking
npx rollup-plugin-visualizer
```

---

## Optimization Strategies

### 1. Code Splitting

**Route-based**:
```tsx
// ❌ BAD: All routes loaded upfront
import Finance from './pages/Finance';
import Shipments from './pages/Shipments';

// ✅ GOOD: Lazy load route bundles
const Finance = lazy(() => import('./pages/Finance'));
const Shipments = lazy(() => import('./pages/Shipments'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/finance" element={<Finance />} />
        <Route path="/shipments" element={<Shipments />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-based**:
```tsx
// Lazy load heavy components
const PDFViewer = lazy(() => import('./components/PDFViewer'));
```

### 2. Memoization

**useMemo** (expensive calculations):
```tsx
const subtotal = useMemo(() => 
  items.reduce((sum, item) => sum + item.price * item.qty, 0),
  [items]
);
```

**useCallback** (event handlers):
```tsx
const handleSubmit = useCallback((data: FormData) => {
  createInvoice(data);
}, [createInvoice]);
```

**React.memo** (prevent child re-renders):
```tsx
const InvoiceRow = memo(({ invoice }: { invoice: Invoice }) => (
  <tr>
    <td>{invoice.invoiceNumber}</td>
    <td>{invoice.total}</td>
  </tr>
));
```

### 3. Virtualization (Large Lists)

**react-window**:
```tsx
import { FixedSizeList } from 'react-window';

function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={invoices.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {invoices[index].invoiceNumber}
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 4. Image Optimization

```tsx
// ❌ BAD: Unoptimized images
<img src="/logo.png" />

// ✅ GOOD: Responsive with lazy loading
<img
  src="/logo-small.webp"
  srcSet="/logo-small.webp 400w, /logo-large.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="TAC Logo"
/>
```

---

## Common Performance Issues

### Issue 1: Unnecessary Re-renders

**Symptom**: Component re-renders on every keystroke

**Diagnosis**:
```tsx
useEffect(() => {
  console.count(`Component rendered`);
});
```

**Fix**: Debounce input
```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  search(debouncedQuery);
}, [debouncedQuery]);
```

### Issue 2: Large Bundle Size

**Symptom**: Initial load > 5s

**Diagnosis**:
```bash
npm run build
# Check dist/assets/*.js sizes
```

**Fix**: Dynamic imports
```tsx
// Instead of:
import moment from 'moment'; // 72KB!

// Use:
import { formatDistance } from 'date-fns'; // 2KB
```

### Issue 3: Slow API Calls

**Symptom**: UI freezes during fetch

**Fix**: Optimistic UI updates
```tsx
const { mutate } = useMutation({
  mutationFn: createInvoice,
  onMutate: async (newInvoice) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['invoices']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['invoices']);
    
    // Optimistically update
    queryClient.setQueryData(['invoices'], (old) => 
      [...old, newInvoice]
    );
    
    return { previous };
  },
  onError: (err, newInvoice, context) => {
    // Rollback on error
    queryClient.setQueryData(['invoices'], context.previous);
  }
});
```

---

## Monitoring

### Lighthouse CI

**GitHub Actions** (`.github/workflows/lighthouse.yml`):
```yaml
name: Lighthouse
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/finance
          budgetPath: ./budget.json
```

**Budget** (`budget.json`):
```json
{
  "performance": 90,
  "accessibility": 100,
  "best-practices": 90,
  "seo": 90
}
```

### Real User Monitoring

**Web Vitals**:
```tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics
  console.log(metric);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

---

## Performance Checklist

Before each release:
- [ ] Lighthouse score > 90
- [ ] Bundle size < 300KB
- [ ] No components re-render > 3 times unnecessarily
- [ ] Images optimized (WebP format)
- [ ] Code splitting on routes
- [ ] Heavy libraries lazy-loaded
- [ ] API responses cached (React Query)

---

## When to Use This Skill

- "Why is this page slow?"
- "Optimize performance"
- "Reduce bundle size"
- "Fix slow renders"
- "Improve Core Web Vitals"
