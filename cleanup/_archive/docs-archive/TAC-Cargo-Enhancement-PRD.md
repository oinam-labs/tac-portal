# TAC Cargo Enhancement PRD

**Product:** TAC Cargo (TAC Portal)  
**Type:** Logistics Operations + Finance SaaS Dashboard  
**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** Production-Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Schema](#4-database-schema)
5. [Module Specifications](#5-module-specifications)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Security & Compliance](#7-security--compliance)
8. [Implementation Status](#8-implementation-status)
9. [Success Metrics](#9-success-metrics)

---

## 1. Executive Summary

### Current State ✅

| Area | Status | Notes |
|------|--------|-------|
| **UI/UX** | ✅ Production | World-class cyber/enterprise aesthetic with Tailwind v4 |
| **Authentication** | ✅ Production | Supabase Auth with role-based access |
| **Data Layer** | ✅ Production | Full Supabase integration, no mock-db dependency |
| **Core Modules** | ✅ Production | Shipments, Customers, Manifests, Invoices, Tracking |
| **Scanning** | ✅ Production | Offline-first queue with sync |
| **RBAC** | ✅ Production | UI + Route + RLS enforcement |
| **Audit Logs** | ✅ Production | Automatic trigger-based logging |

### Architecture Highlights

- **Frontend:** React 19 RC + Vite + TypeScript
- **State:** TanStack Query (server) + Zustand (client)
- **Backend:** Supabase (PostgreSQL 17 + Auth + Realtime + Edge Functions)
- **Observability:** Sentry for error tracking
- **Testing:** Vitest (unit) + Playwright (E2E)

---

## 2. Product Overview

### Vision

A production-ready logistics operations platform enabling:
- **Single source of truth** via Supabase
- **Offline-ready scanning** workflows for warehouse operations
- **Role-based access control** with audit trails
- **Enterprise-grade UX** with consistent design patterns

### Target Users

| Role | Count | Primary Functions |
|------|-------|-------------------|
| Admin | 1-2 | Full access, user management, system configuration |
| Manager | 1-2 | Operations oversight, reporting, all module access |
| OPS Staff | 2-3 | Shipments, manifests, tracking, customer interactions |
| Warehouse Staff | 2-4 | Scanning, inventory, package handling (hub-restricted) |
| Invoice Staff | 1-2 | Finance operations, invoice generation, payments |
| Support | 1-2 | Read-only access for customer inquiries |

### Core Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                        TAC Cargo Portal                         │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Analytics  │  Shipments  │  Tracking  │  Manifests │
├─────────────────────────────────────────────────────────────────┤
│   Scanning  │  Inventory  │  Exceptions │  Invoices  │  Customers │
├─────────────────────────────────────────────────────────────────┤
│                    Management  │  Settings                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture

### Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19 RC |
| Build Tool | Vite | 6.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Radix UI + shadcn/ui | Latest |
| Animation | Motion (Framer) + GSAP | Latest |
| Server State | TanStack React Query | 5.x |
| Client State | Zustand | 5.x |
| Database | Supabase (PostgreSQL) | 17.6 |
| Auth | Supabase Auth | Latest |
| Realtime | Supabase Realtime | Latest |
| Observability | Sentry | Latest |
| Unit Testing | Vitest | Latest |
| E2E Testing | Playwright | Latest |

### Data Flow

```
┌──────────────┐    ┌───────────────┐    ┌─────────────────┐
│  UI Pages    │───▶│  React Query  │───▶│  Service Layer  │
│  /pages/*    │    │  Hooks        │    │  /lib/services  │
└──────────────┘    └───────────────┘    └─────────────────┘
                                                  │
                           ┌──────────────────────┴──────────────────────┐
                           ▼                                              ▼
                    ┌─────────────┐                              ┌──────────────┐
                    │  Supabase   │◀────────────────────────────▶│   Realtime   │
                    │  PostgreSQL │                              │  Subscriptions│
                    └─────────────┘                              └──────────────┘
```

### Key Architectural Rules

1. **No Direct Supabase in Pages** - All data access through hooks/services
2. **Org Scoping Everywhere** - Every query filtered by `org_id`
3. **UUID as Primary Key** - AWB is indexed business key only
4. **Immutable Tracking Events** - Append-only audit trail
5. **Idempotent Scanning** - Duplicate scans handled gracefully

---

## 4. Database Schema

### Entity Relationship Diagram

```
                    ┌──────────┐
                    │   orgs   │
                    └────┬─────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌────────┐    ┌────────┐    ┌──────────┐
      │  hubs  │    │  staff │    │ customers│
      └────┬───┘    └────────┘    └────┬─────┘
           │                           │
           └─────────┬─────────────────┘
                     ▼
              ┌────────────┐
              │  shipments │
              └──────┬─────┘
       ┌─────────────┼─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
  │ packages │ │ manifests│ │ invoices │ │ exceptions │
  └──────────┘ └────┬─────┘ └──────────┘ └────────────┘
                    ▼
            ┌───────────────┐
            │ manifest_items│
            └───────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ tracking_events │
           └─────────────────┘
```

### Table Summary

| Table | Purpose | Key Fields | RLS |
|-------|---------|------------|-----|
| `orgs` | Multi-tenant organizations | id, name, slug, settings | ✅ |
| `hubs` | Operational locations (IMPHAL, NEW_DELHI) | code, name, type, address | ✅ |
| `staff` | User accounts | auth_user_id, email, role, hub_id | ✅ |
| `customers` | Customer records | customer_code, name, phone, gstin | ✅ |
| `shipments` | Core shipment entities | awb_number, status, weights, consignee | ✅ |
| `packages` | Individual package units | shipment_id, package_number, weight | ✅ |
| `manifests` | Dispatch batches | manifest_no, type, from/to_hub, status | ✅ |
| `manifest_items` | Shipment-manifest junction | manifest_id, shipment_id, scanned_at | ✅ |
| `tracking_events` | Immutable tracking history | event_code, source, hub_id, meta | ✅ |
| `invoices` | Finance documents | invoice_no, line_items, total, status | ✅ |
| `exceptions` | Problem tracking | type, severity, status, resolution | ✅ |
| `audit_logs` | Compliance trail | action, entity_type, before/after | ✅ |

### Key Constraints

| Constraint | Table | Description |
|------------|-------|-------------|
| `UNIQUE(org_id, awb_number)` | shipments | AWB unique per org |
| `UNIQUE(org_id, invoice_no)` | invoices | Invoice # unique per org |
| `UNIQUE(org_id, manifest_no)` | manifests | Manifest # unique per org |
| `UNIQUE(manifest_id, shipment_id)` | manifest_items | No duplicate shipments in manifest |
| `CHECK(status IN (...))` | shipments | Valid status values only |
| `CHECK(role IN (...))` | staff | Valid role values only |

### Database Functions

| Function | Purpose |
|----------|---------|
| `generate_awb_number(org_id)` | Auto-generate AWB: TAC{YYYY}{NNNN} |
| `generate_invoice_number(org_id)` | Auto-generate INV-{YYYY}-{NNNN} |
| `generate_manifest_number()` | Trigger: MNF-{YYYY}-{NNNN} |
| `get_user_org_id()` | Get current user's org from session |
| `get_user_hub_id()` | Get current user's hub |
| `has_role(roles[])` | Check if user has any of specified roles |
| `can_access_hub(hub_id)` | Check hub access permission |
| `audit_log_changes()` | Trigger: automatic audit logging |

---

## 5. Module Specifications

### 5.1 Dashboard

**Purpose:** Real-time operational overview with KPIs and quick actions.

**Features:**
- KPI cards (shipments today, in-transit, delivered, exceptions)
- Recent activity feed with realtime updates
- Quick action buttons for common tasks
- Chart visualizations (trends, hub distribution)

**Data Sources:**
- `shipments` aggregate queries
- `tracking_events` for recent activity
- Realtime subscriptions for live updates

---

### 5.2 Shipments

**Purpose:** Core shipment lifecycle management.

**Features:**
- Create new shipment with auto-AWB generation
- View shipment details with tracking history
- Update shipment status with validation
- Link to customer, manifest, invoice
- Package-level tracking

**Status Flow:**
```
CREATED → PICKED_UP → RECEIVED_AT_ORIGIN_HUB → LOADED_FOR_LINEHAUL
    → IN_TRANSIT_TO_DESTINATION → RECEIVED_AT_DEST_HUB
    → OUT_FOR_DELIVERY → DELIVERED
    
(Any status) → EXCEPTION_RAISED → EXCEPTION_RESOLVED → (Resume flow)
(Any status) → CANCELLED (terminal)
```

**Key Validations:**
- Status transitions must follow defined rules
- Customer must exist
- Origin ≠ Destination hub
- Weight must be positive

---

### 5.3 Manifests

**Purpose:** Batch shipments for dispatch/transport.

**Features:**
- Create manifest (auto-numbered MNF-YYYY-NNNN)
- Add shipments via scanning or manual selection
- View manifest contents with totals
- Close manifest → updates all shipment statuses
- Depart/Arrive tracking
- Print manifest cover sheet and labels

**Status Flow:**
```
OPEN → CLOSED → DEPARTED → ARRIVED (terminal)
```

**Rules:**
- Cannot add shipment to multiple open manifests
- Cannot add shipment from wrong origin hub
- Closing manifest updates all shipments to LOADED_FOR_LINEHAUL

---

### 5.4 Scanning

**Purpose:** Barcode-driven warehouse operations.

**Features:**
- Camera-based barcode scanning
- Manual AWB entry fallback
- Manifest QR code scanning
- Success/error feedback (beep, vibration)
- Duplicate scan warning
- Offline queue with auto-sync

**Supported Formats:**
```
Raw AWB:    "TAC20260001"
JSON:       { "v": 1, "awb": "TAC20260001" }
Manifest:   { "v": 1, "type": "manifest", "id": "<uuid>" }
```

**Offline Queue:**
- Scans stored in IndexedDB/localStorage
- Auto-retry every 10-20 seconds when online
- UI shows pending/synced/failed counts

---

### 5.5 Invoices

**Purpose:** Finance document generation and management.

**Features:**
- Auto-generate invoice from shipment
- Line item management
- GST/tax calculation (CGST, SGST, IGST)
- PDF generation
- Status tracking (Draft → Issued → Paid)
- Payment recording

**Invoice Number Format:** `INV-{YYYY}-{NNNN}`

**Line Item Structure:**
```json
{
  "description": "Air Freight (10kg @ ₹120/kg)",
  "quantity": 1,
  "rate": 1200,
  "amount": 1200
}
```

---

### 5.6 Customers

**Purpose:** Customer relationship management.

**Features:**
- CRUD operations for customers
- Customer code auto-generation
- Address management (billing, shipping)
- GSTIN tracking for business customers
- Credit limit tracking
- Customer type: INDIVIDUAL, BUSINESS, CORPORATE

---

### 5.7 Tracking

**Purpose:** Public/internal shipment tracking.

**Features:**
- Search by AWB number
- Timeline view of all events
- Current status display
- Hub location tracking
- Realtime updates via subscription

---

### 5.8 Exceptions

**Purpose:** Problem tracking and resolution.

**Types:**
- DAMAGE, SHORTAGE, MISROUTE, DELAY
- CUSTOMER_REFUSAL, ADDRESS_ISSUE, OTHER

**Severity Levels:** LOW, MEDIUM, HIGH, CRITICAL

**Workflow:**
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

**Features:**
- Link to shipment
- Image attachments
- Assignment to staff
- Resolution notes
- Audit trail

---

### 5.9 Inventory

**Purpose:** Hub-level stock visibility.

**Features:**
- View packages at each hub
- Filter by status, date
- Bin location tracking
- Hub-restricted view for warehouse staff

---

### 5.10 Management

**Purpose:** User and system administration.

**Features:**
- User management (CRUD)
- Role assignment
- Hub assignment
- Audit log viewer
- System settings

---

## 6. User Roles & Permissions

### Role Definitions

| Role | Description | Hub Restriction |
|------|-------------|-----------------|
| ADMIN | Full system access | None |
| MANAGER | Full access (no schema changes) | None |
| OPS | Operations: shipments, manifests, tracking | None |
| WAREHOUSE_IMPHAL | Scanning, inventory at Imphal hub | IMPHAL |
| WAREHOUSE_DELHI | Scanning, inventory at Delhi hub | NEW_DELHI |
| INVOICE | Finance operations | None |
| SUPPORT | Read-only access | None |

### Module Access Matrix

| Module | ADMIN | MANAGER | OPS | WAREHOUSE | INVOICE | SUPPORT |
|--------|-------|---------|-----|-----------|---------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Shipments | ✅ | ✅ | ✅ | ✅ (view) | ✅ (view) | ✅ (view) |
| Tracking | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manifests | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Scanning | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Inventory | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Exceptions | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Customers | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (view) |
| Management | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Enforcement Layers

1. **UI Layer** - Nav items hidden based on role
2. **Route Layer** - Protected routes with role guards
3. **Database Layer** - RLS policies enforce org/hub isolation

---

## 7. Security & Compliance

### Authentication

- Supabase Auth with email/password
- JWT tokens with automatic refresh
- Session persistence with secure storage
- Automatic logout on token expiry

### Row Level Security (RLS)

All tables have RLS enabled with policies:
- `org_id = get_user_org_id()` for tenant isolation
- Hub-based restrictions for warehouse roles
- Read-only policies for support role

### Audit Trail

Automatic audit logging via database triggers:
- Who (actor_staff_id)
- What (action: INSERT/UPDATE/DELETE)
- Which (entity_type, entity_id)
- When (created_at)
- Before/After state (JSONB diff)

### Data Protection

- Sensitive data cleared on logout
- No hardcoded credentials
- Environment variables for secrets
- HTTPS enforced in production

---

## 8. Implementation Status

### Completed ✅

| Phase | Deliverable | Status |
|-------|-------------|--------|
| Phase 0 | Foundation (types, query keys, error handling) | ✅ Complete |
| Phase 1 | Data Unification (Supabase as single truth) | ✅ Complete |
| Phase 2 | Barcode Scanning + Manifest Workflow | ✅ Complete |
| Phase 2.5 | Offline-first Scan Queue | ✅ Complete |
| Phase 3 | RBAC + RLS + Audit Logs | ✅ Complete |
| Phase 4 | UI/UX Polish | ✅ Complete |
| Phase 5 | Testing + Observability | ✅ Complete |

### Key Files

| Category | Location |
|----------|----------|
| Types | `types/domain.ts`, `types.ts`, `lib/database.types.ts` |
| Query Keys | `lib/queryKeys.ts` |
| Hooks | `hooks/` |
| Services | `lib/services/` |
| Stores | `store/` |
| Pages | `pages/` |
| Components | `components/` |
| Config | `config/features.ts` |

---

## 9. Success Metrics

### Operational

| Metric | Target | Current |
|--------|--------|---------|
| Scan-to-manifest time | < 2 seconds | ✅ Achieved |
| Data persistence on reload | 100% | ✅ Achieved |
| Scan sync success rate | > 95% | ✅ Achieved |
| Page load time (LCP) | < 2.5s | ✅ Achieved |

### Business

| Metric | Target |
|--------|--------|
| Invoice generation time | < 30 seconds |
| AWB lookup time | < 1 second |
| Exception resolution time | < 24 hours |
| User adoption rate | > 90% |

### Quality

| Metric | Target | Current |
|--------|--------|---------|
| TypeScript coverage | 100% | ✅ 100% |
| Unit test coverage | > 80% | In progress |
| E2E critical path coverage | 100% | ✅ Complete |
| Sentry error rate | < 1% | ✅ < 0.5% |

---

## Appendix

### A. Environment Variables

```env
VITE_SUPABASE_URL=https://xkkhxhgkyavxcfgeojww.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_SENTRY_DSN=<sentry_dsn>
```

### B. NPM Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --ext .ts,.tsx",
  "test:unit": "vitest run",
  "test": "playwright test"
}
```

### C. Related Documents

- [schema.sql](./schema.sql) - Database schema
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [TAC-Cargo-Enhancement-tasks.md](./TAC-Cargo-Enhancement-tasks.md) - Implementation tasks

---

*Document Version: 2.0 | Last Updated: January 2026*
