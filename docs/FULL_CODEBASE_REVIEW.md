# 🔍 TAC Portal - Full Codebase Review Request

> **Purpose**: Trigger a comprehensive CodeRabbit review of the entire TAC Portal logistics management platform.

---

## 📊 Project Overview

**TAC Portal** is an enterprise-grade logistics management platform for cargo operations between Imphal and New Delhi hubs.

### Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19.1, TypeScript 5.8, Vite 6.2 |
| **Styling** | Tailwind CSS 4.x, shadcn/ui, Radix UI |
| **State Management** | Zustand 5.0, TanStack Query 5.x |
| **Forms & Validation** | React Hook Form 7.52, Zod 3.23 |
| **Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **Monitoring** | Sentry React SDK 10.34 |
| **Testing** | Playwright 1.57 |
| **Animation** | Framer Motion 10.16, GSAP 3.14 |
| **Rich Text** | TipTap 3.15 |

---

## 🗂️ Codebase Structure

### Pages (18 files)

```text
pages/
├── Analytics.tsx          # Business analytics dashboard
├── Customers.tsx          # Customer management
├── Dashboard.tsx          # Main dashboard entry
├── DevUIKit.tsx           # Development UI component kit
├── Exceptions.tsx         # Exception handling
├── Finance.tsx            # Financial operations
├── Inventory.tsx          # Inventory management
├── Landing.tsx            # Public landing page
├── Management.tsx         # Staff/org management
├── Manifests.tsx          # Manifest operations
├── Notifications.tsx      # Notification center
├── PrintLabel.tsx         # Label printing
├── PublicTracking.tsx     # Public shipment tracking
├── Scanning.tsx           # Barcode scanning
├── Settings.tsx           # User settings
├── ShiftReport.tsx        # Shift reporting
├── Shipments.tsx          # Shipment management
└── Tracking.tsx           # Internal tracking
```

### Components (106+ files)

```text
components/
├── auth/           # Authentication components
├── crud/           # CRUD operations (5 files)
├── customers/      # Customer-related UI
├── dashboard/      # Dashboard widgets (7 files)
├── dev/            # Development tools
├── domain/         # Domain-specific components (14 files)
├── finance/        # Finance UI (4 files)
├── landing-new/    # Landing page sections (12 files)
├── layout/         # Layout components (2 files)
├── management/     # Management UI
├── manifests/      # Manifest components (8 files)
├── optics/         # Optics registry components
├── scanning/       # Scanning UI
├── shipments/      # Shipment components (3 files)
├── shipping/       # Shipping UI (2 files)
└── ui/             # shadcn/ui primitives (40 files)
```

### Custom Hooks (13 files)

```text
hooks/
├── useAuditLogs.ts        # Audit logging
├── useCloseManifest.ts    # Manifest closing logic
├── useCustomers.ts        # Customer data management
├── useExceptions.ts       # Exception handling
├── useInvoices.ts         # Invoice operations
├── useManifests.ts        # Manifest CRUD
├── useRBAC.ts             # Role-based access control
├── useRealtime.ts         # Supabase realtime subscriptions
├── useShiftReport.ts      # Shift report generation
├── useShipments.ts        # Shipment data management
├── useStaff.ts            # Staff management
└── useTrackingEvents.ts   # Tracking event handling
```

### State Management (6 stores)

```text
store/
├── auditStore.ts          # Audit trail state
├── authStore.ts           # Authentication state
├── index.ts               # Store exports
├── managementStore.ts     # Management state
├── noteStore.ts           # Notes state
└── scanQueueStore.ts      # Scan queue management
```

### Service Layer (lib/)

```text
lib/
├── constants.ts           # App constants
├── database.types.ts      # Supabase-generated types
├── design-tokens.ts       # Design system tokens
├── email.ts               # Email utilities
├── errors.ts              # Error handling
├── feedback.ts            # Feedback utilities
├── logger.ts              # Logging service
├── motion.ts              # Animation utilities
├── org-helper.ts          # Organization helpers
├── pdf-generator.ts       # PDF generation
├── query-client.ts        # TanStack Query client
├── queryKeys.ts           # Query key factory
├── scanParser.ts          # Barcode parsing
├── sentry.ts              # Sentry configuration
├── supabase.ts            # Supabase client
├── tracking-service.ts    # Tracking service
├── utils.ts               # General utilities
├── data-access/           # Data access layer
├── hooks/                 # Library hooks
├── notifications/         # Notification system
├── schemas/               # Zod schemas
├── services/              # Business services (11 files)
└── validation/            # Validation utilities
```

---

## 🎯 Review Focus Areas

### 1. Architecture & Design Patterns
- [ ] Component composition and reusability
- [ ] State management patterns (Zustand stores)
- [ ] Custom hooks organization and dependencies
- [ ] Service layer architecture
- [ ] Data flow patterns (unidirectional?)
- [ ] Separation of concerns

### 2. Security Analysis
- [ ] XSS prevention and input sanitization (DOMPurify usage)
- [ ] Authentication flow security (Supabase Auth)
- [ ] Authorization implementation (RBAC in useRBAC.ts)
- [ ] Sensitive data handling
- [ ] API key exposure prevention
- [ ] CSRF protection
- [ ] Content Security Policy

### 3. Performance Optimization
- [ ] React rendering optimization (useMemo, useCallback)
- [ ] Bundle size and code splitting
- [ ] Lazy loading implementation
- [ ] TanStack Query caching strategies
- [ ] Virtualization for large lists
- [ ] Memory leak prevention
- [ ] Animation performance (Framer Motion, GSAP)

### 4. TypeScript Type Safety
- [ ] Strict TypeScript configuration
- [ ] Type inference issues
- [ ] Runtime type validation (Zod schemas)
- [ ] Generic type usage
- [ ] Discriminated unions
- [ ] Proper error typing

### 5. Accessibility (WCAG 2.1)
- [ ] ARIA attributes usage
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Focus management
- [ ] Form accessibility

### 6. Code Quality
- [ ] Dead code detection
- [ ] Duplicate code analysis
- [ ] Consistent error handling patterns
- [ ] Code documentation
- [ ] Naming conventions
- [ ] Function complexity
- [ ] Test coverage gaps

### 7. Supabase Integration
- [ ] Query optimization
- [ ] RLS policy implementation
- [ ] Realtime subscription management
- [ ] Error handling for database operations
- [ ] Type safety with database types

### 8. Form Handling
- [ ] React Hook Form patterns
- [ ] Zod validation schemas
- [ ] Error display consistency
- [ ] Form accessibility
- [ ] Multi-step form handling

### 9. Routing & Navigation
- [ ] React Router 6 patterns
- [ ] Protected route implementation
- [ ] Code splitting with routes
- [ ] Navigation guards

### 10. Error Boundaries & Monitoring
- [ ] Sentry integration coverage
- [ ] Error boundary placement
- [ ] Error recovery strategies
- [ ] Logging completeness

---

## 📁 Key Files to Analyze

### Entry Points
- `App.tsx` - Main application routing and providers
- `index.tsx` - React DOM entry
- `index.html` - HTML template

### Configuration
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

### Core Types
- `types.ts` - Application types
- `lib/database.types.ts` - Supabase-generated types

### State Management
- `store/authStore.ts` - Auth state (11KB)
- `store/scanQueueStore.ts` - Scan queue (8KB)
- `store/managementStore.ts` - Management (5KB)

### Complex Components
- `components/magnified-bento.tsx` - Complex UI (11KB)
- `pages/Scanning.tsx` - Scanning page (18KB)
- `pages/ShiftReport.tsx` - Report generation (18KB)
- `pages/Notifications.tsx` - Notification center (17KB)
- `pages/Finance.tsx` - Financial operations (16KB)
- `pages/Customers.tsx` - Customer management (16KB)

### Services
- `lib/pdf-generator.ts` - PDF generation (26KB)
- `lib/sentry.ts` - Error monitoring (8KB)
- `lib/email.ts` - Email utilities (8KB)
- `lib/errors.ts` - Error handling (8KB)

---

## ✅ Expected Outcomes

1. **Comprehensive issue identification** across all review areas
2. **Security vulnerability detection** with remediation suggestions
3. **Performance bottleneck identification** 
4. **Type safety improvements**
5. **Accessibility audit results**
6. **Code quality recommendations**
7. **Architecture improvement suggestions**
8. **Best practice alignment verification**

---

## 📝 Notes

- This is a **logistics management platform** - domain knowledge matters
- The app handles **sensitive shipment and customer data**
- **Real-time features** are critical for operations
- **PDF generation** is a core business feature
- Multi-hub architecture (**Imphal ↔ New Delhi**)

---

Review requested: January 20, 2026
