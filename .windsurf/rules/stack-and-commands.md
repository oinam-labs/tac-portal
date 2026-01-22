---
description: Stack constraints and verification commands for TAC Cargo
activation: always
---

# Stack & Commands Rule

## Why This Rule Exists
TAC Cargo is a **Vite + React 19 SPA** (NOT Next.js). Incorrect assumptions about SSR, server components, or file-based routing will break the application. This rule ensures all agents and developers operate with correct stack knowledge.

---

## Stack Constraints (Non-Negotiable)

### Runtime
- **Framework**: Vite + React 19 + TypeScript
- **Routing**: react-router-dom (client-side only, NO file-based routing)
- **Build**: `vite build` produces static assets in `dist/`
- **NO SSR**: This is a pure SPA. No server components, no getServerSideProps, no API routes.

### Data Layer
- **Database**: Supabase (PostgreSQL + Auth)
- **Client**: `@supabase/supabase-js` via `lib/supabase.ts`
- **Server State**: TanStack React Query (`@tanstack/react-query`)
- **Client State**: Zustand with persistence (`zustand/middleware`)

### UI
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion + GSAP
- **Icons**: Lucide React

### Testing
- **Unit**: Vitest (`npm run test:unit`)
- **E2E**: Playwright (`npm run test`)
- **Coverage**: `npm run test:unit:coverage`

### Observability
- **Error Tracking**: Sentry (`@sentry/react`)
- **Logging**: `lib/logger.ts`

---

## Verification Commands

Always use these exact commands for verification:

```bash
# Type checking (MUST pass before any PR)
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Unit tests
npm run test:unit
npm run test:unit:watch   # Interactive mode

# E2E tests
npm run test              # Headless
npm run test:ui           # Interactive UI
npm run test:headed       # Visible browser

# Formatting
npm run format:check
npm run format
```

---

## Patterns to Enforce

### Imports
```typescript
// Correct - use path aliases
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

// Wrong - relative paths for deep imports
import { supabase } from '../../../lib/supabase';
```

### Data Fetching
```typescript
// Correct - TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['shipments', filters],
  queryFn: () => shipmentService.list(filters)
});

// Wrong - useEffect + useState for server data
useEffect(() => {
  fetch('/api/shipments')... // NO API ROUTES
}, []);
```

### State Management
```typescript
// Correct - Zustand for cross-component client state
const { user, setUser } = useAuthStore();

// Correct - React Query for server state
const { data: customers } = useCustomers();

// Wrong - Redux or Context for server state
```

---

## Anti-Patterns to Reject

1. **Next.js patterns**: `getServerSideProps`, `getStaticProps`, API routes, server components
2. **File-based routing**: Creating files expecting automatic route registration
3. **Direct fetch for CRUD**: Use services + React Query hooks
4. **localStorage for server data**: Use React Query caching
5. **Inline SQL**: All queries go through services using Supabase client
