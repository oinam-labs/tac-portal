Product: TAC Cargo (TAC Portal)
Type: Logistics Operations + Finance SaaS Dashboard
Team Size Target: 4–5 operational staff + Admin/Owner
Primary Goal: Convert prototype into a production-ready logistics system by unifying data, enabling warehouse workflows, and enforcing standards.

1. Executive Summary
Current Verdict (Baseline)

UI/UX: ✅ World-class cyber/enterprise aesthetic

Core Production Module: ✅ Shipments (Supabase-backed)

Other Core Modules: ⚠️ Mixed mock-db + Supabase hooks (fragmented truth)

Primary Risk

Data Integrity Failure

Manifests, Tracking, Scanning, Finance are disconnected and may not reflect real operations.

Primary Outcome

A production-ready platform with:

Single source of truth (Supabase)

Offline-ready scanning workflows

RBAC + audit logs

Polished enterprise UX

2. Objectives
O1 — Eliminate Dual Data Layer

Remove mock-db dependency from all production modules.

O2 — Build Warehouse-Grade Scanning Operations

Enable barcode-driven logistics workflows with offline queue + syncing.

O3 — Enforce Security, RBAC, Auditability

Ensure that access control exists at:

UI

Route layer

Supabase RLS

O4 — Deliver an Enterprise-grade UI/UX

Polished dashboards, stable error handling, predictable UX patterns.

3. Product Scope
In-Scope Modules

Shipments ✅

Tracking

Manifests

Scanning

Inventory

Invoices

Customers

Exceptions

Management (audit logs, role permissions)

System Settings

Out-of-Scope (For this PRD)

Multi-warehouse routing optimization AI

External carrier integration APIs

Complex accounting system

Mobile app (separate PRD)

4. Users & Roles
Roles

ADMIN: Full access

MANAGER: Full access (no schema changes)

OPS: Shipments, manifests, tracking

WAREHOUSE_IMPHAL: Scanning + inventory (Imphal only)

WAREHOUSE_DELHI: Scanning + inventory (Delhi only)

INVOICE: Finance + customers only

SUPPORT: Read-only

5. Global Standards & Rules (Non-negotiable)
Data Integrity Rules

UUID id is primary key for all tables

awb must be unique indexed, but not PK

All rows must include:

org_id

timestamps

created_by (where relevant)

Logistics Terminology Rules

AWB = shipment tracking key (operations)

Invoice # = finance identifier

Never mix AWB and invoice numbers in logic

Compliance Minimum

Immutable tracking events

Audit logs for all critical state changes

Supabase RLS must enforce tenant isolation

6. Architecture Requirements
Frontend

React 19 RC + TypeScript

Vite

Tailwind v4

Zustand (local UI/domain state)

TanStack Query (all server data)

Supabase (database + realtime + auth)

Mandatory Architecture Rules

UI pages DO NOT call Supabase directly

All reads via React Query hooks

All writes via mutation hooks

Query keys standardized

Feature flags for incomplete modules

7. Implementation Roadmap
Phase 0 — Foundation & Guardrails (Mandatory)

Goal: prevent drift + enable clean migration.

Deliverables

queryKeys.ts

domain.ts types/enums

global error handling

standardized mutation/toast UX

feature flags

Tasks

Create:

src/lib/queryKeys.ts

src/types/domain.ts

src/config/features.ts

Implement:

global ErrorBoundary

consistent toast mapping (Supabase → user-friendly)

Define:

“no direct Supabase in UI pages” rule

Acceptance Criteria

All modules compile clean

Standard query key system exists

Error boundary catches failures + shows recovery UI

Phase 1 — Data Unification (Supabase as Single Truth)

Goal: remove mock-db from all production modules safely.

Priority Migration Order

Tracking

Manifests

Scanning

Finance

Inventory

Exceptions

Key Deliverables

mock-db removed from prod flows

all modules query Supabase tables

organization scoping enforced everywhere

Tasks
1.1 Environment

configure .env.local

verify Supabase connection

seed:

org

hubs

default roles/users

1.2 Tracking Migration

Replace mock-db search with Supabase query

Realtime tracking events:

subscribe per org_id

subscribe per shipment_id / awb

1.3 Manifests Migration

Replace manifestStore mock logic

Store manifests in Supabase

Use join table:

manifest_shipments(manifest_id, shipment_id)

1.4 Scanning Migration

Each scan produces:

tracking_event row

shipment status updates (if applicable)

Apply hub scope validation

1.5 Finance Migration

Create invoice referencing shipment_id

Validate:

shipment exists

shipment not cancelled

invoice number uniqueness per org

Acceptance Criteria

Reloading browser does not lose manifests/tracking/scans/invoices

Tracking page can find real shipments always

Tenant isolation works (no org #1 default)

mock-db not required in any core workflow

Phase 2 — Barcode & Automation (Warehouse Workflows)

Goal: build barcode-driven operational excellence.

Deliverables

raw AWB scan support

manifest QR activation workflow

label printing integration

scan success feedback UX

Core Workflow (Must Work)

Scan Manifest QR

Scan shipment AWBs repeatedly

Close manifest

Auto-update shipment statuses

Print manifest cover sheet + labels

Tasks
2.1 Scanner input formats

Support:

raw: TAC12345678

json: { v: 1, awb: "TAC12345678" }

manifest qr: { v: 1, type: "manifest", id: "<uuid>" }

2.2 Scan feedback UX

beep/vibration

show last scanned AWB

duplicate scan warning

invalid scan error message

2.3 Auto manifest linking rules

active manifest required

cannot add shipment twice

cannot add shipment from wrong hub

2.4 Label Printing

Manifest page:

Print Labels (batch)

Print Cover Sheet

Reuse existing pdf-generator.ts

Acceptance Criteria

A warehouse staff can complete manifest building without typing AWBs

Labels print for all scanned packages

Manifest totals update live

Phase 2.5 — Offline-first Scanning Queue (Critical)

Goal: scanning must work even with poor internet.

Deliverables

scanQueue Zustand store

persisted queue

auto retry sync

UI showing pending/synced/errors

Tasks

scanQueue[] persisted (localStorage)

on scan:

enqueue immediately

try sync

mark synced when successful

sync retry every 10–20 sec when online

Acceptance Criteria

scanning works without internet

sync resumes automatically

users can see if scans are pending

Phase 3 — RBAC, RLS, Audit Logs, Exceptions

Goal: secure enterprise behavior.

Deliverables

RLS policies for org access

strict RBAC enforcement

automatic audit logging system

exception module integrated

Tasks
3.1 RBAC enforcement layers

UI: hide nav + components

Route guard: prevent access

Supabase RLS: enforce truth

3.2 Audit Logging

Track:

shipment status changes

manifest open/close/depart/arrive

invoice create/update/payment

exception resolution

inventory adjustments

Audit log fields:

actor

role

org_id

entity

before/after JSON

timestamp

3.3 Exceptions Module

Must support:

damage

missing

wrong hub

delayed

mismatch

invoice dispute

Acceptance Criteria

warehouse cannot access finance even via URL

audit logs show who changed what

exceptions are linked to shipment + tracking events

Phase 4 — UI/UX Polish (Enterprise Finish)

Goal: make UI clean, polished, consistent.

Deliverables

standardized component patterns

smooth transitions

empty/skeleton/error states

accessibility upgrades

Tasks

Standardize Radix usage:

Dialogs

Tooltips

Selects

Tabs

Framer Motion polish:

page transitions

list animations

modal enter/exit

Add:

skeleton loading for every async list/table

empty states with CTA

consistent typography scale

spacing scale (8px grid)

Optional:

/dev/ui-kit instead of Storybook (preferred for small team)

Acceptance Criteria

no visual inconsistency across pages

loading and empty states feel premium

keyboard navigation is stable

Phase 5 — Features + QA + Stability

Goal: complete production readiness.

Deliverables

invoice emailing

invoice viewer

observability

tests

Tasks
Email invoices

Resend API or Supabase Edge Function

send invoice PDF

delivery status stored

PDF viewer

modal viewer for invoice

print button

Observability

Add Sentry for error tracking + performance

optional LogRocket later

Testing (Small team realistic)

Unit tests: AWB parsing + totals + validators

Playwright E2E:

create shipment

scan → manifest close

invoice create → send

Acceptance Criteria

stable release quality

critical workflows pass E2E

errors traceable in Sentry

8. Success Metrics
Operational Metrics

scan-to-manifest time reduced by 50%

zero “lost manifest on reload”

95% scan event sync success rate

Business Metrics

invoice generation time reduced

fewer disputes due to audit logs

reduced manual entry errors

9. Definition of Done (DoD)

A phase is complete when:

all acceptance criteria pass

all permissions validated

no mock-db dependency remains for that phase modules

core workflow tested end-to-end