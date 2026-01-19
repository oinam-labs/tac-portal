# TAC Portal Code Review Checklist

## Pre-Review Setup
- [ ] Pull latest changes from the branch
- [ ] Read the PR description and linked issues
- [ ] Understand the scope of changes

---

## Architecture Review

### Component Structure
- [ ] Single Responsibility Principle followed
- [ ] Components < 300 lines
- [ ] No prop drilling > 3 levels deep
- [ ] Business logic extracted to custom hooks

### State Management
- [ ] Zustand used for global UI state only
- [ ] TanStack Query used for server state
- [ ] No redundant state (derived values calculated, not stored)
- [ ] State colocated with usage

### File Organization
```
✅ Correct Structure:
components/
├── domain/              # Business components
│   ├── InvoiceCard/
│   │   ├── index.tsx
│   │   ├── InvoiceCard.tsx
│   │   └── useInvoiceCard.ts
├── ui/                  # Shadcn primitives
└── layouts/             # Page layouts

❌ Anti-patterns:
- Mixing UI and domain components
- Deep nesting (> 4 levels)
- Utils files > 200 lines
```

---

## TypeScript Quality

### Type Safety
- [ ] No `any` types
- [ ] No `@ts-ignore` comments
- [ ] Proper error type narrowing
- [ ] Zod schemas for runtime validation

### Interface Design
```typescript
// ✅ Good: Explicit, documented
interface InvoiceCreatePayload {
  /** Customer reference ID */
  customerId: string;
  /** AWB number in format TAC00000000 */
  awb: string;
  /** Line items with prices */
  items: InvoiceLineItem[];
}

// ❌ Bad: Vague, undocumented
interface Data {
  id: string;
  data: object;
}
```

---

## React Best Practices

### Hooks
- [ ] Custom hooks start with `use`
- [ ] `useEffect` has cleanup function
- [ ] Dependencies array is correct
- [ ] No hooks inside conditions/loops

### Rendering
- [ ] Keys provided for list items
- [ ] No inline object/array literals in JSX
- [ ] Expensive calculations memoized
- [ ] Large lists virtualized

### Forms
- [ ] React Hook Form used
- [ ] Zod validation schemas
- [ ] Error messages shown
- [ ] Loading states on submit

---

## Security Checklist

### Authentication
- [ ] Protected routes check auth state
- [ ] JWT not stored in localStorage
- [ ] Session timeout handled
- [ ] Logout clears all state

### Data Handling
- [ ] User input sanitized
- [ ] No `dangerouslySetInnerHTML`
- [ ] Sensitive data not logged
- [ ] RLS policies verified

### API Security
- [ ] Rate limiting considered
- [ ] CORS properly configured
- [ ] Error messages don't leak info

---

## Performance Checklist

### Bundle
- [ ] Routes lazy-loaded
- [ ] Heavy deps dynamically imported
- [ ] Tree shaking verified
- [ ] No duplicate dependencies

### Runtime
- [ ] No unnecessary re-renders
- [ ] Images optimized (WebP)
- [ ] API calls cached
- [ ] Debounced search inputs

---

## Accessibility

### Keyboard
- [ ] Tab order logical
- [ ] Focus visible
- [ ] Escape closes modals
- [ ] Enter submits forms

### Screen Readers
- [ ] Alt text on images
- [ ] ARIA labels on icons
- [ ] Form labels associated
- [ ] Headings hierarchical

---

## Testing

### Coverage
- [ ] Unit tests for utils/hooks
- [ ] Integration tests for forms
- [ ] E2E for critical paths
- [ ] Edge cases covered

### Quality
- [ ] Tests are readable
- [ ] No flaky tests
- [ ] Mocks are realistic
- [ ] Assertions are specific

---

## Documentation

- [ ] Complex logic has comments
- [ ] Public APIs documented
- [ ] README updated if needed
- [ ] Breaking changes noted

---

## Final Verdict

| Category | Score |
|----------|-------|
| Architecture | /10 |
| TypeScript | /10 |
| React | /10 |
| Security | /10 |
| Performance | /10 |
| Accessibility | /10 |
| Testing | /10 |

**Total**: /70

- **60+**: Approve
- **50-59**: Approve with minor fixes
- **40-49**: Request changes
- **<40**: Major rewrite needed
