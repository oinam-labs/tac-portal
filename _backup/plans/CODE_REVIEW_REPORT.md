# TAC Portal - Comprehensive Code Review Report

**Review Date:** February 12, 2026  
**Reviewer:** Kilo Code (Automated Analysis)  
**Project:** TAC Cargo Portal  
**Version:** 1.0.0

---

## Executive Summary

This comprehensive code review identified **7 major categories** of issues across the TAC Portal codebase. The most critical findings relate to **type system inconsistencies** and **excessive use of `any` types**, which could lead to runtime errors and reduced code maintainability.

### Risk Assessment

| Category | Severity | Files Affected | Priority |
|----------|----------|----------------|----------|
| Dual Type System | 🔴 High | 2 core files + imports | P1 |
| Excessive `any` Usage | 🔴 High | 21+ files | P1 |
| Dual Authentication Stores | 🟡 Medium | 2 store files | P2 |
| Console Logging | 🟡 Medium | 32+ instances | P2 |
| Hook Dependency Warnings | 🟡 Medium | 6 files | P2 |
| Environment Validation | 🟢 Low | 2 files | P3 |
| Test Coverage Gaps | 🟢 Low | Multiple | P3 |

---

## 1. Dual Type System Issues (HIGH PRIORITY)

### Problem Description

The project maintains **two separate type definition files** with overlapping and conflicting definitions:

#### File Locations
- [`types.ts`](types.ts) - Root-level type definitions
- [`types/domain.ts`](types/domain.ts) - Domain-specific type definitions

### Conflicting Type Definitions

#### 1.1 UserRole Enum Conflict

**In [`types.ts:35-45`](types.ts:35-45):**
```typescript
export type UserRole =
  | 'ADMIN'
  | 'MANAGER'
  | 'WAREHOUSE_IMPHAL'
  | 'WAREHOUSE_DELHI'
  | 'OPS'
  | 'INVOICE'
  | 'SUPPORT'
  | 'WAREHOUSE_STAFF'    // ← Additional role
  | 'OPS_STAFF'          // ← Additional role
  | 'FINANCE_STAFF';     // ← Additional role
```

**In [`types/domain.ts:92-100`](types/domain.ts:92-100):**
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAREHOUSE_IMPHAL = 'WAREHOUSE_IMPHAL',
  WAREHOUSE_DELHI = 'WAREHOUSE_DELHI',
  OPS = 'OPS',
  INVOICE = 'INVOICE',
  SUPPORT = 'SUPPORT',
  // Missing: WAREHOUSE_STAFF, OPS_STAFF, FINANCE_STAFF
}
```

**Impact:** Components importing from different files will have incompatible role types, causing:
- Runtime errors when checking permissions
- Failed role-based access control
- Inconsistent UI behavior

#### 1.2 ShipmentStatus Conflict

**In [`types.ts:14-25`](types.ts:14-25):**
```typescript
export type ShipmentStatus =
  | 'CREATED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'RECEIVED_AT_ORIGIN'
  | 'IN_TRANSIT'
  | 'RECEIVED_AT_DEST'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RTO'
  | 'EXCEPTION';
```

**In [`types/domain.ts:32-44`](types/domain.ts:32-44):**
```typescript
export enum ShipmentStatus {
  CREATED = 'CREATED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  // ... same values but as enum
}
```

**Issue:** One is a **type alias**, the other is an **enum**. This affects:
- Type narrowing in conditionals
- Runtime value access
- Bundle size (enums generate JS code)

#### 1.3 ManifestStatus Conflict

**In [`types.ts:27`](types.ts:27):**
```typescript
export type ManifestStatus = 'OPEN' | 'CLOSED' | 'DEPARTED' | 'ARRIVED';
```

**In [`types/domain.ts:46-54`](types/domain.ts:46-54):**
```typescript
export enum ManifestStatus {
  DRAFT = 'DRAFT',        // ← Additional status
  BUILDING = 'BUILDING',  // ← Additional status
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  RECONCILED = 'RECONCILED',  // ← Additional status
}
```

**Impact:** The domain.ts version has **3 additional statuses** (DRAFT, BUILDING, RECONCILED) that don't exist in types.ts, causing potential runtime errors.

### Import Analysis

Files importing from `types.ts`:
- [`App.tsx`](App.tsx:18)
- [`components/domain/CustomerDetails.tsx`](components/domain/CustomerDetails.tsx:4)
- [`components/finance/MultiStepCreateInvoice.tsx`](components/finance/MultiStepCreateInvoice.tsx:52)

Files importing from `types/domain.ts`:
- [`hooks/useRBAC.ts`](hooks/useRBAC.ts:8)
- [`store/scanQueueStore.ts`](store/scanQueueStore.ts:11)

### Recommended Solution

1. **Consolidate to a single source of truth** - Keep `types/domain.ts` as the authoritative source
2. **Update `types.ts`** to re-export from `types/domain.ts` for backward compatibility
3. **Use enums consistently** for better runtime introspection
4. **Run a migration script** to update all imports

---

## 2. Excessive `any` Type Usage (HIGH PRIORITY)

### Problem Description

The codebase has **21+ files** with `@typescript-eslint/no-explicit-any` eslint-disable comments, indicating significant type safety gaps.

### Affected Files

#### Services Layer (Most Critical)
| File | Line | Reason Cited |
|------|------|--------------|
| [`lib/services/manifestService.ts`](lib/services/manifestService.ts:12) | 12 | Supabase client operations |
| [`lib/services/shipmentService.ts`](lib/services/shipmentService.ts:5) | 5 | Supabase client operations |
| [`lib/services/invoiceService.ts`](lib/services/invoiceService.ts:120) | 120, 136, 166 | Supabase client operations |
| [`lib/services/customerService.ts`](lib/services/customerService.ts:5) | 5 | Supabase client operations |
| [`lib/services/staffService.ts`](lib/services/staffService.ts:5) | 5 | Supabase client operations |
| [`lib/services/auditService.ts`](lib/services/auditService.ts:5) | 5 | Supabase client operations |
| [`lib/services/exceptionService.ts`](lib/services/exceptionService.ts:5) | 5 | Supabase client operations |
| [`lib/services/trackingService.ts`](lib/services/trackingService.ts:5) | 5 | Supabase client operations |
| [`lib/services/shiftReportService.ts`](lib/services/shiftReportService.ts:5) | 5 | Supabase client operations |
| [`lib/services/rbacService.ts`](lib/services/rbacService.ts:24) | 24 | Type-safe client |

#### Hooks Layer
| File | Line | Reason Cited |
|------|------|--------------|
| [`hooks/useShipments.ts`](hooks/useShipments.ts:154) | 154 | Supabase insert operation |
| [`hooks/useManifests.ts`](hooks/useManifests.ts:1) | 1 | Supabase operations |

#### Store Layer
| File | Line | Reason Cited |
|------|------|--------------|
| [`store/scanQueueStore.ts`](store/scanQueueStore.ts:6) | 6 | Supabase operations |
| [`store/managementStore.ts`](store/managementStore.ts:1) | 1 | Supabase operations |

#### Utilities
| File | Line | Reason Cited |
|------|------|--------------|
| [`lib/pdf-generator.ts`](lib/pdf-generator.ts:1) | 1 | PDF generation |
| [`lib/utils/label-utils.ts`](lib/utils/label-utils.ts:1) | 1 | Label generation |
| [`lib/motion.ts`](lib/motion.ts:31) | 31 | Framer Motion types |

### Root Cause Analysis

The primary cause is **incomplete Supabase database type generation**. The project has [`lib/database.types.ts`](lib/database.types.ts) (28,285 chars) but the types may not be properly used in queries.

### Example Issue from [`hooks/useShipments.ts:154-158`](hooks/useShipments.ts:154-158)

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data, error } = await (supabase.from('shipments') as any)
  .insert(insertPayload)
  .select()
  .single();
```

**Problem:** The type assertion `as any` bypasses TypeScript's validation, potentially allowing:
- Invalid column names
- Wrong data types
- Missing required fields

### Recommended Solution

1. **Regenerate Supabase types** using `supabase gen types typescript --project-id <id> > lib/database.types.ts`
2. **Create typed Supabase client wrapper** that enforces types
3. **Gradually remove `any` assertions** by properly typing insert/update payloads
4. **Use Zod schemas** for runtime validation alongside TypeScript types

---

## 3. Dual Authentication Stores (MEDIUM PRIORITY)

### Problem Description

The project maintains **two separate authentication stores**:

#### Legacy Store: [`store/index.ts`](store/index.ts)

```typescript
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  // ...
  login: (user: User) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ...
      isAuthenticated: false, // Set to true to bypass login for dev if needed
      // ...
    }),
    { name: 'tac-storage', partialize: ... }
  )
);
```

**Security Concern:** Line 30 contains a comment suggesting authentication bypass for development. If accidentally enabled, this would expose all protected routes.

#### New Store: [`store/authStore.ts`](store/authStore.ts)

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      // ... Supabase auth integration
    }),
    { name: 'tac-auth', partialize: ... }
  )
);
```

### Usage Analysis

**Files using legacy `useStore`:**
- [`hooks/useRBAC.ts`](hooks/useRBAC.ts:7)
- [`components/layout/Sidebar.tsx`](components/layout/Sidebar.tsx)

**Files using new `useAuthStore`:**
- [`App.tsx`](App.tsx:16)
- [`hooks/useIdleTimeout.ts`](hooks/useIdleTimeout.ts:2)
- [`hooks/useShipments.ts`](hooks/useShipments.ts:6)

### Synchronization Issue

In [`App.tsx:98-112`](App.tsx:98-112), there's manual synchronization between stores:

```typescript
useEffect(() => {
  if (isAuthenticated && user) {
    // Sync with legacy store for backward compatibility
    legacyLogin({
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      assignedHub: (user.hubCode as HubLocation) ?? undefined,
      active: user.isActive,
      lastLogin: new Date().toISOString(),
    });
    navigate('/dashboard', { replace: true });
  }
}, [isAuthenticated, user, navigate, legacyLogin]);
```

### Recommended Solution

1. **Deprecate legacy store** - Add JSDoc `@deprecated` tags
2. **Migrate all consumers** to use `useAuthStore`
3. **Remove synchronization code** from App.tsx
4. **Delete legacy store** after migration is complete

---

## 4. Console Logging in Production (MEDIUM PRIORITY)

### Problem Description

The codebase contains **32+ instances** of `console.error`, `console.warn`, and `console.log` in production code.

### ESLint Configuration

In [`eslint.config.js:72`](eslint.config.js:72):

```typescript
'no-console': ['warn', { allow: ['warn', 'error'] }],
```

This configuration **allows** `console.error` and `console.warn`, which will appear in production builds.

### Affected Areas

#### Error Handling (Should use Sentry)
| File | Line | Code |
|------|------|------|
| [`pages/Finance.tsx`](pages/Finance.tsx:207) | 207 | `console.error('[Invoice] Invoice generation error:', error)` |
| [`pages/Finance.tsx`](pages/Finance.tsx:266) | 266 | `console.error('[Label] No AWB found on invoice')` |
| [`components/scanning/BarcodeScanner.tsx`](components/scanning/BarcodeScanner.tsx:71) | 71 | `console.error('Camera access error:', err)` |
| [`components/manifests/ManifestBuilder/ManifestBuilderWizard.tsx`](components/manifests/ManifestBuilder/ManifestBuilderWizard.tsx:271) | 271 | `console.error('Error closing manifest:', error)` |

#### Debug Logging (Should be removed)
| File | Line | Code |
|------|------|------|
| [`pages/Finance.tsx`](pages/Finance.tsx:66) | 66 | `console.warn('Shipment fetch error:', error)` |
| [`pages/PrintLabel.tsx`](pages/PrintLabel.tsx:263) | 263 | `console.warn('AWB mismatch...')` |

### Existing Infrastructure

The project already has proper logging infrastructure:

**[`lib/logger.ts`](lib/logger.ts):**
```typescript
export const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    // Structured logging with context
  },
  // ...
};
```

**[`lib/sentry.ts`](lib/sentry.ts):**
```typescript
export const SentryErrorBoundary = ...
export const setUserContext = ...
export const addBreadcrumb = ...
```

### Recommended Solution

1. **Replace `console.error`** with `logger.error()` or Sentry capture
2. **Remove debug `console.warn`** statements or convert to proper logging
3. **Update ESLint config** to disallow all console methods in production:
   ```typescript
   'no-console': process.env.NODE_ENV === 'production' 
     ? ['error', { allow: [] }] 
     : ['warn', { allow: ['warn', 'error', 'log'] }],
   ```

---

## 5. React Hook Dependency Warnings (MEDIUM PRIORITY)

### Problem Description

Six files contain `eslint-disable-next-line react-hooks/exhaustive-deps` comments, which may hide actual bugs.

### Affected Files

#### [`App.tsx:117-118`](App.tsx:117-118)
```typescript
useEffect(() => {
  if (error) clearError();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on input changes, not on error
}, [email, password]);
```
**Issue:** `clearError` is not in dependencies. If it changes, the stale closure will be used.

#### [`App.tsx:445-446`](App.tsx:445-446)
```typescript
useEffect(() => {
  // ... auth initialization
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Empty array - only run once on mount
```
**Issue:** Comment claims "only run once on mount" but `initialize` function is not stable.

#### [`pages/Settings.tsx:66-67`](pages/Settings.tsx:66-67)
```typescript
return () => { mounted = false; };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeTab, user]);
```
**Issue:** Missing dependencies may cause stale state reads.

#### [`pages/Finance.tsx:427-428`](pages/Finance.tsx:427-428)
```typescript
}),
// eslint-disable-next-line react-hooks/exhaustive-deps
[navigate]
```
**Issue:** Multiple values used in effect but not in dependency array.

#### [`pages/Scanning.tsx:59-60`](pages/Scanning.tsx:59-60)
```typescript
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOnline, pendingScans.length]);
```

#### [`components/ui/apple-cards-carousel.tsx:121-122`](components/ui/apple-cards-carousel.tsx:121-122)
```typescript
return () => window.removeEventListener('keydown', onKeyDown);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [open]);
```

### Recommended Solution

1. **Audit each disabled warning** to determine if it's legitimate
2. **Use `useCallback`** for functions used in effects
3. **Extract complex logic** to custom hooks with proper dependencies
4. **Remove unnecessary disables** where dependencies can be added safely

---

## 6. Environment Validation Not Called (LOW PRIORITY)

### Problem Description

The project has environment validation in [`lib/env.ts`](lib/env.ts) but it's not called at application startup.

#### [`lib/env.ts:23-55`](lib/env.ts:23-55)
```typescript
export function validateEnv(): Env | null {
  const raw = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    // ...
  };
  const result = envSchema.safeParse(raw);
  // ...
}
```

#### [`index.tsx:1-20`](index.tsx:1-20)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import App from './App';
import { initSentry } from './lib/sentry';

// Initialize Sentry as early as possible
initSentry();
// validateEnv() is never called!
```

### Current Validation

Validation happens implicitly in [`lib/supabase.ts:7-15`](lib/supabase.ts:7-15):
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.PROD) {
    throw new Error('Missing required environment variables...');
  }
  console.warn('[Supabase] Credentials not configured...');
}
```

### Recommended Solution

1. **Call `validateEnv()`** in `index.tsx` before `initSentry()`
2. **Handle validation errors** gracefully in development
3. **Fail fast** in production with clear error messages

---

## 7. Test Coverage Gaps (LOW PRIORITY)

### Problem Description

The test suite has minimal coverage for critical business logic.

### E2E Tests Analysis

#### [`tests/e2e/manifest-workflow.spec.ts`](tests/e2e/manifest-workflow.spec.ts)

```typescript
test('should create a new manifest', async ({ page }) => {
  await page.goto('/#/manifests');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Only checks page loaded - no actual manifest creation
  await expect(page.locator('body')).toContainText(/(Manifest|Dashboard|TAC)/i);
});
```

**Issues:**
- Tests only verify page loads
- No actual workflow testing
- Uses `waitForTimeout` (anti-pattern) instead of proper waits

### Unit Tests Analysis

#### [`tests/unit/store/authStore.test.ts`](tests/unit/store/authStore.test.ts)

```typescript
it('sets loading state during sign in', async () => {
  vi.mocked(supabase.auth.signInWithPassword).mockImplementation(() => new Promise(() => { }));
  useAuthStore.getState().signIn('test@example.com', 'password');
  expect(useAuthStore.getState().isLoading).toBe(true);
  // Comment: "await the promise to avoid open handles"
});
```

**Issues:**
- Test creates a hanging promise
- No assertion about final state
- Missing test cases for successful sign in

### Recommended Solution

1. **Add integration tests** for critical workflows:
   - Manifest creation and scanning
   - Invoice generation
   - Shipment tracking

2. **Improve E2E tests** to test actual functionality:
   - Fill forms
   - Submit data
   - Verify results

3. **Add unit tests** for:
   - All service functions
   - Store actions
   - Utility functions

---

## Architecture Observations

### Positive Patterns

1. **Proper Error Boundaries** - Multiple levels of error handling with [`components/error/AppErrorBoundary.tsx`](components/error/AppErrorBoundary.tsx) and [`components/ui/error-boundary.tsx`](components/ui/error-boundary.tsx)

2. **Query Key Factory** - Well-structured React Query keys in [`hooks/useShipments.ts:15-23`](hooks/useShipments.ts:15-23):
   ```typescript
   export const shipmentKeys = {
     all: ['shipments'] as const,
     lists: () => [...shipmentKeys.all, 'list'] as const,
     list: (filters?) => [...shipmentKeys.lists(), filters] as const,
     // ...
   };
   ```

3. **Branded Types** - Type-safe identifiers in [`types/domain.ts:10-21`](types/domain.ts:10-21):
   ```typescript
   export type AWB = Brand<string, 'AWB'>;
   export type UUID = Brand<string, 'UUID'>;
   ```

4. **Status Transition Rules** - Explicit state machine in [`types/domain.ts:136-158`](types/domain.ts:136-158)

5. **Idle Timeout** - Security feature in [`hooks/useIdleTimeout.ts`](hooks/useIdleTimeout.ts)

### Areas for Improvement

1. **Code Splitting** - Consider more granular lazy loading for large components like [`components/finance/MultiStepCreateInvoice.tsx`](components/finance/MultiStepCreateInvoice.tsx) (62,396 chars)

2. **API Layer Abstraction** - Create a proper API client abstraction instead of direct Supabase calls throughout components

3. **Form State Management** - Standardize form handling approach (currently mixes react-hook-form with local state)

---

## Recommendations Summary

### Immediate Actions (P1)

| Action | Effort | Impact |
|--------|--------|--------|
| Consolidate type definitions | Medium | High |
| Fix UserRole enum conflicts | Low | High |
| Regenerate Supabase types | Low | High |
| Create typed Supabase wrapper | Medium | High |

### Short-term Actions (P2)

| Action | Effort | Impact |
|--------|--------|--------|
| Migrate to single auth store | Medium | Medium |
| Replace console.* with logger | Low | Medium |
| Fix hook dependency warnings | Low | Medium |

### Long-term Actions (P3)

| Action | Effort | Impact |
|--------|--------|--------|
| Add environment validation | Low | Low |
| Improve test coverage | High | Medium |
| Refactor large components | High | Medium |

---

## Conclusion

The TAC Portal codebase demonstrates solid architectural foundations with proper error handling, type safety attempts, and security features. However, the **dual type system** and **excessive `any` usage** represent significant technical debt that should be addressed to prevent runtime errors and improve maintainability.

The most critical issue is the **UserRole enum conflict** between `types.ts` and `types/domain.ts`, which could cause authentication and authorization failures in production.

**Recommended Priority Order:**
1. Consolidate type definitions
2. Fix Supabase type safety
3. Migrate to single auth store
4. Improve logging practices
5. Address hook dependencies
6. Add environment validation
7. Expand test coverage
