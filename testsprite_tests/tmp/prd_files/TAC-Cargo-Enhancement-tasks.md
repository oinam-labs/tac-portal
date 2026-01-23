# TAC Cargo Enhancement Tasks

**Version:** 2.0  
**Last Updated:** January 2026  
**Status:** Implementation Complete - Maintenance Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Completed Phases](#completed-phases)
3. [Maintenance Tasks](#maintenance-tasks)
4. [Future Enhancements](#future-enhancements)
5. [Testing Checklists](#testing-checklists)
6. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

### Project Status: ✅ Production Ready

All core implementation phases have been completed. This document now serves as:
- Historical record of completed work
- Maintenance task reference
- Future enhancement backlog
- Testing and QA checklists

### Architecture Summary

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React 19 + Vite + TypeScript | ✅ Complete |
| State | TanStack Query + Zustand | ✅ Complete |
| Database | Supabase PostgreSQL 17 | ✅ Complete |
| Auth | Supabase Auth + RBAC | ✅ Complete |
| Testing | Vitest + Playwright | ✅ Complete |
| Observability | Sentry | ✅ Complete |

---

## Completed Phases

### Phase 0: Foundation & Guardrails ✅

| Task | File(s) | Status |
|------|---------|--------|
| Create domain types with branded types | `types/domain.ts` | ✅ |
| Standardize query keys | `lib/queryKeys.ts` | ✅ |
| Supabase client setup | `lib/supabase.ts` | ✅ |
| Error mapping utilities | `lib/errors.ts` | ✅ |
| Feature flags | `config/features.ts` | ✅ |
| Global error boundary | `components/ErrorBoundary.tsx` | ✅ |

### Phase 1: Data Unification ✅

| Module | Migration Status | Key Files |
|--------|-----------------|-----------|
| Shipments | ✅ Supabase | `hooks/useShipments.ts`, `lib/services/shipmentService.ts` |
| Tracking | ✅ Supabase | `hooks/useTrackingEvents.ts` |
| Manifests | ✅ Supabase | `hooks/useManifests.ts` |
| Invoices | ✅ Supabase | `hooks/useInvoices.ts` |
| Customers | ✅ Supabase | `hooks/useCustomers.ts`, `lib/services/customerService.ts` |
| Exceptions | ✅ Supabase | `pages/Exceptions.tsx` |
| Staff | ✅ Supabase | `hooks/useStaff.ts` |
| Audit Logs | ✅ Supabase | `hooks/useAuditLogs.ts` |

**Key Achievement:** Mock-db completely removed from production flows.

### Phase 2: Barcode & Automation ✅

| Task | Status | Implementation |
|------|--------|----------------|
| Barcode parsing (3 formats) | ✅ | Raw AWB, JSON, Manifest QR |
| Scanner UX (beep, vibrate) | ✅ | Web Audio API + Vibration API |
| Manifest scanning workflow | ✅ | Scan manifest → Scan AWBs → Close |
| Label printing | ✅ | `lib/pdf-generator.ts` |
| Duplicate scan detection | ✅ | Unique constraint + UI warning |

### Phase 2.5: Offline-First Scanning ✅

| Task | Status | Implementation |
|------|--------|----------------|
| Scan queue store | ✅ | Zustand with persist middleware |
| Auto-retry sync | ✅ | 10-20 second interval when online |
| Queue UI indicators | ✅ | Pending/synced/failed counts |
| Conflict resolution | ✅ | Server-side idempotency |

### Phase 3: RBAC + RLS + Audit ✅

| Task | Status | Implementation |
|------|--------|----------------|
| Role definitions | ✅ | `types/domain.ts` - ROLE_PERMISSIONS |
| UI nav restrictions | ✅ | `useCanAccessModule()` hook |
| Route guards | ✅ | Protected routes in `App.tsx` |
| RLS policies | ✅ | `get_user_org_id()` function |
| Audit logging | ✅ | DB triggers on all critical tables |
| Hub-based restrictions | ✅ | `can_access_hub()` function |

### Phase 4: UI/UX Polish ✅

| Task | Status |
|------|--------|
| Radix UI standardization (Dialog, Select, Tabs) | ✅ |
| Skeleton loading states | ✅ |
| Empty states with CTA | ✅ |
| Error states with retry | ✅ |
| Motion animations | ✅ |
| Consistent typography/spacing | ✅ |

### Phase 5: Testing & Observability ✅

| Task | Status | Location |
|------|--------|----------|
| Vitest unit tests | ✅ | `tests/unit/` |
| Playwright E2E tests | ✅ | `tests/e2e/` |
| Sentry integration | ✅ | `lib/sentry.ts` |
| Error boundaries | ✅ | Components |
| Performance monitoring | ✅ | Sentry tracing |

---

## Maintenance Tasks

### Daily Operations

| Task | Frequency | Owner |
|------|-----------|-------|
| Monitor Sentry for new errors | Daily | Dev team |
| Review audit logs for anomalies | Daily | Admin |
| Verify offline scan queue sync | Daily | Ops |

### Weekly Tasks

| Task | Description |
|------|-------------|
| Database vacuum | Run `VACUUM ANALYZE` on large tables |
| Review pending exceptions | Ensure no stuck exceptions |
| Check invoice overdue status | Mark overdue invoices |

### Monthly Tasks

| Task | Description |
|------|-------------|
| Security audit | Review RLS policies and access logs |
| Performance review | Check slow queries in Supabase dashboard |
| Dependency updates | Run `npm outdated` and update safely |

---

## Future Enhancements

### Priority 1: Near-term

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Mobile responsive scanning | Optimize scanning UI for mobile devices | Medium |
| Email invoice delivery | Send invoices via Resend/Supabase Edge | Medium |
| Bulk operations | Multi-select for status updates | Low |
| Advanced search | Full-text search across AWB, customer, consignee | Medium |

### Priority 2: Medium-term

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Customer portal | Self-service tracking for customers | High |
| Driver app | Mobile app for delivery drivers | High |
| Analytics dashboard | Advanced reporting with charts | Medium |
| Webhook integrations | External system notifications | Medium |

### Priority 3: Long-term

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Multi-warehouse routing | AI-optimized route planning | High |
| External carrier APIs | Integration with 3PL providers | High |
| Accounting integration | Connect to Tally/QuickBooks | High |
| Mobile native app | React Native version | High |

---

## Testing Checklists

### Shipment Flow E2E

```
□ Login as OPS user
□ Navigate to Shipments
□ Click "New Shipment"
□ Select customer from dropdown
□ Fill consignee details
□ Add package(s) with weights
□ Submit → AWB generated
□ Verify shipment appears in list
□ Click shipment → View details
□ Verify tracking timeline shows CREATED event
□ Refresh page → Data persists
```

### Manifest Flow E2E

```
□ Login as OPS user
□ Navigate to Manifests
□ Click "Create Manifest"
□ Select hub route (e.g., IMPHAL → NEW_DELHI)
□ Select mode (AIR/TRUCK)
□ Submit → Manifest created (MNF-XXXX-XXXX)
□ Add shipments to manifest
□ Verify totals update (count, weight)
□ Close manifest
□ Verify shipments status → LOADED_FOR_LINEHAUL
□ Mark departed
□ Mark arrived
```

### Scanning Flow E2E

```
□ Login as WAREHOUSE_IMPHAL user
□ Navigate to Scanning
□ Verify camera permission requested
□ Scan valid AWB barcode
□ Verify success feedback (beep, green flash)
□ Verify tracking event created
□ Scan same AWB again → Duplicate warning
□ Scan invalid barcode → Error message
□ Disconnect network
□ Scan AWB → Queued locally
□ Verify queue indicator shows pending
□ Reconnect network
□ Verify auto-sync within 20 seconds
□ Verify queue indicator shows synced
```

### Invoice Flow E2E

```
□ Login as INVOICE user
□ Navigate to Invoices
□ Click "Create Invoice"
□ Select shipment
□ Verify line items auto-populate
□ Adjust amounts if needed
□ Submit → Invoice created (INV-XXXX-XXXX)
□ View PDF preview
□ Print invoice
□ Mark as paid
□ Verify status change
□ Verify audit log entry
```

### Exception Flow E2E

```
□ Login as OPS user
□ Navigate to Exceptions
□ Click "Report Exception"
□ Select shipment by AWB
□ Select exception type
□ Set severity
□ Add description
□ Submit → Exception created
□ Verify shipment status → EXCEPTION_RAISED
□ Assign to staff member
□ Add resolution notes
□ Mark resolved
□ Verify shipment can resume normal flow
```

### RBAC E2E

```
□ Login as ADMIN → Can access all modules
□ Login as MANAGER → Can access all modules
□ Login as OPS → Cannot access Invoices, Scanning, Inventory
□ Login as WAREHOUSE_IMPHAL → Cannot access Invoices, Manifests
□ Login as WAREHOUSE_DELHI → Can only see Delhi hub data
□ Login as INVOICE → Cannot access Scanning, Manifests
□ Login as SUPPORT → Read-only, cannot edit
□ Direct URL access to blocked module → Redirected
```

---

## Troubleshooting Guide

### Common Issues

#### 1. "No staff record found" on login

**Cause:** Auth user exists but no linked staff record.

**Solution:**
```sql
-- Check if staff record exists
SELECT * FROM staff WHERE email = 'user@example.com';

-- Create staff record if missing
INSERT INTO staff (org_id, email, full_name, role, auth_user_id)
VALUES (
  '<org_uuid>',
  'user@example.com',
  'User Name',
  'OPS',
  '<auth_user_uuid>'
);
```

#### 2. "Organization context not set" error

**Cause:** User's staff record missing `org_id`.

**Solution:**
```sql
-- Update staff record with org_id
UPDATE staff SET org_id = '<org_uuid>' WHERE id = '<staff_uuid>';
```

#### 3. Realtime subscriptions not working

**Cause:** Table not in realtime publication.

**Solution:**
```sql
-- Check realtime status
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Add table if missing
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
```

#### 4. Offline scans not syncing

**Cause:** Network detection or queue corruption.

**Solution:**
1. Check browser console for errors
2. Clear localStorage: `localStorage.removeItem('scan-queue')`
3. Refresh page
4. Re-scan items

#### 5. Invoice number generation fails

**Cause:** Counter table missing org entry.

**Solution:**
```sql
-- Initialize counter for org
INSERT INTO invoice_counters (org_id, year, last_number)
VALUES ('<org_uuid>', 2026, 0)
ON CONFLICT DO NOTHING;
```

#### 6. RLS policy blocking access

**Cause:** User org_id mismatch or function not returning correctly.

**Debug:**
```sql
-- Check current user org
SELECT get_user_org_id();

-- Verify user is in staff table with correct org
SELECT * FROM staff WHERE auth_user_id = auth.uid();
```

---

## Database Migrations Reference

### Migration History (49 total)

| Version | Name | Description |
|---------|------|-------------|
| 20260119030650 | create_orgs_and_hubs | Base tables |
| 20260119030700 | create_staff | Staff table |
| 20260119030704 | create_customers | Customers table |
| 20260119030720 | create_shipments | Shipments table |
| 20260119030722 | create_packages | Packages table |
| 20260119030731 | create_manifests | Manifests table |
| 20260119030733 | create_manifest_items | Junction table |
| 20260119030741 | create_tracking_events | Tracking table |
| 20260119030745 | create_invoices | Invoices table |
| 20260119030753 | create_exceptions | Exceptions table |
| 20260119030755 | create_audit_logs | Audit table |
| 20260119030808 | create_awb_generator_function | AWB function |
| 20260119030817 | enable_rls_policies | RLS Phase 1 |
| 20260119030823 | enable_rls_policies_2 | RLS Phase 2 |
| 20260119030832 | create_audit_trigger_function | Audit triggers |
| 20260119030833 | enable_realtime | Realtime pub |
| 20260119030850 | seed_initial_data | Seed data |
| ... | ... | ... |
| 20260121224927 | consolidate_invoices_rls_policies | Final RLS |

### Creating New Migrations

```bash
# Generate migration file
npx supabase migration new <migration_name>

# Apply migration
npx supabase db push

# Generate types
npx supabase gen types typescript --project-id xkkhxhgkyavxcfgeojww > lib/database.types.ts
```

---

## Quick Reference

### Key Files

| Purpose | File |
|---------|------|
| Domain types | `types/domain.ts` |
| Query keys | `lib/queryKeys.ts` |
| Supabase client | `lib/supabase.ts` |
| Database types | `lib/database.types.ts` |
| Auth store | `store/authStore.ts` |
| Feature flags | `config/features.ts` |
| Shipment hooks | `hooks/useShipments.ts` |
| Services | `lib/services/*.ts` |

### NPM Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run test:unit    # Vitest unit tests
npm run test         # Playwright E2E
```

### Supabase Commands

```bash
npx supabase start       # Local dev
npx supabase db push     # Push migrations
npx supabase gen types   # Generate types
npx supabase functions serve  # Edge functions
```

---

*Last Updated: January 2026*
