# TAC Cargo Dashboard — Full User Flow Stabilization, Domain Enforcement & Production Data Readiness
## Single Execution Instruction (Local First, Pre-Git, Pre-PR)

---

## 0. PURPOSE & AUTHORITY

This document is the **single source of truth** for converting the TAC Cargo dashboard from a **mixed MVP / demo state** into a **production-ready system**.

It mandates:

1. Fixing **all broken user flows**
2. Enforcing **correct logistics domain rules** (IMF hub)
3. Eliminating **React crashes and invalid UI states**
4. Removing **all mock / placeholder / fake data**
5. Wiring the frontend to **real customer, shipment, invoice, and manifest data**
6. Protecting the system with **UI, API, DB, CI, and E2E guards**
7. Preparing a **clean, reviewable PR** for CodeRabbit

⚠️ **All work must be completed locally in `C:\tac-portal` before pushing to Git.**

---

## 1. DOMAIN LAW (NON-NEGOTIABLE)

### Canonical Hub Codes

DEL, GAU, CCU, IMF


### Forbidden Everywhere

IXA


Any occurrence of `IXA` at **any layer** is a **blocking defect**.

---

## 2. EXECUTION PRIORITY (DO NOT CHANGE)

1. Broken user flows
2. Crash & stability issues
3. Mock data removal
4. Domain correctness (IMF)
5. Data integrity (DB)
6. Guards & automation
7. PR readiness

---

## 3. CRITICAL USER FLOWS (MUST WORK END-TO-END)

### 3.1 Invoice → Dispatch → Label → Manifest (PRIMARY FLOW)

**Required Behavior**
- Invoice creation generates a real shipment record
- Invoice PDF and Label PDF downloads are independent
- Manifest creation is the authoritative dispatch step

**Validation**
- Create Invoice
- Download Invoice PDF
- Download Label PDF
- Create Manifest
- Confirm routing shows:

IMF → DEL


**Forbidden**
- Shared state between invoice and label
- Manifest creation tied to invoice UI state

---

### 3.2 Shipment → Print Label (BLOCKER)

**Required**
- Label printing must work directly from Shipment Details
- Shipment ID must be sufficient

**Forbidden Error**

No shipment data found. Please generate label from Invoices dashboard.


---

### 3.3 Manifest Creation (CRASH FIX)

**Required**
- No React crashes
- Hub dropdown shows:

Imphal Hub (IMF)


**Forbidden**
- `Imphal Hub (IXA)`
- React error:

Failed to execute 'removeChild' on 'Node'


Audit:
- Conditional rendering
- Missing keys
- DOM manipulation
- Realtime subscription cleanup

---

### 3.4 Customer Search (Invoice Flow)

**Required**
- Consigner / Consignee search returns real customers
- Empty states handled correctly

**Forbidden**
- `{}` treated as valid data
- False “No customers found” when data exists

---

### 3.5 Routing & Sidebar Integrity

**Required**
- Sidebar labels match routes
- No dead links
- No hash-routing mismatches

---

## 4. MOCK DATA CLEANUP (NEW — MANDATORY)

### Objective
Remove **all mock, placeholder, demo, hardcoded, or fake data** and ensure the dashboard can be used for **real operational use** with real customers.

This applies to **all modules** listed below.

---

## 4.1 Modules That MUST Be Cleaned

Mock data must be removed from **every layer** (UI, API, DB, state):

- Overview
- Dashboard
- Analytics
- Operations
- Shipments
- Tracking
- Manifests
- Scanning
- Inventory
- Exceptions
- Business
- Invoices
- Customers
- Management
- System
- Settings

---

## 4.2 What Counts as Mock Data (STRICT)

❌ Hardcoded numbers  
❌ Fake KPIs (e.g. “123 Shipments”)  
❌ Static arrays in components  
❌ Temporary JSON files  
❌ Seed/demo records shown by default  
❌ Placeholder charts with fabricated data  
❌ “Lorem ipsum” business content  

If the data does **not come from a real backend source**, it must be removed.

---

## 4.3 Required Production-Ready Behavior

### UI
- UI must render **empty states** when no data exists
- No fabricated KPIs or charts
- All counts, tables, and cards must be data-driven

### Backend
- APIs must return real data or empty arrays
- No fallback mock responses

### State Management
- No default mock state in Zustand / React Query
- No static initial datasets

---

## 4.4 Empty-State Design Rules (IMPORTANT)

Instead of mock data, show:

- “No shipments yet”
- “No invoices found”
- “Create your first customer”
- “No manifests created”

Empty states must:
- Be intentional
- Guide the user
- Never fabricate data

---

## 5. SYSTEM-WIDE DOMAIN FIX — IMF ENFORCEMENT

### UI
- Replace all `IXA` with `IMF`
- Dropdowns, labels, PDFs

### API
- Reject or normalize invalid hub codes
- Accept only:

DEL, GAU, CCU, IMF


### Realtime
- Supabase payloads must emit valid hub codes only
- No subscription churn (CLOSED ↔ SUBSCRIBED loops)

---

## 6. DATABASE SAFETY (LOCAL FIRST)

### 6.1 Data Migration (If Needed)

```sql
UPDATE shipments SET origin_hub = 'IMF' WHERE origin_hub = 'IXA';
UPDATE shipments SET destination_hub = 'IMF' WHERE destination_hub = 'IXA';

UPDATE manifests SET origin_hub = 'IMF' WHERE origin_hub = 'IXA';
UPDATE manifests SET destination_hub = 'IMF' WHERE destination_hub = 'IXA';

Verify:

SELECT COUNT(*) FROM shipments WHERE origin_hub = 'IXA' OR destination_hub = 'IXA';

6.2 CHECK Constraints (HARD LOCK)

ALTER TABLE shipments
ADD CONSTRAINT shipments_origin_hub_valid
CHECK (origin_hub IN ('DEL','GAU','CCU','IMF'));

ALTER TABLE shipments
ADD CONSTRAINT shipments_destination_hub_valid
CHECK (destination_hub IN ('DEL','GAU','CCU','IMF'));

Apply equivalents to:

manifests

routes

tracking_events

7. AUTOMATED GUARDS (MANDATORY)
7.1 Repo Audit Script

scripts/audit-hub-codes.js

Must fail if IXA exists anywhere

7.2 Playwright E2E

E2E must assert:

No UI text contains IXA

No mock data visible

Empty states render correctly

Invoice → Label → Manifest works end-to-end

8. MANUAL PRODUCTION SMOKE TEST

Create first real customer

Create Invoice

Download Invoice

Print Label

Create Manifest

Verify:

IMF → DEL

Inspect PDFs manually:

Invoice

Label

Manifest

9. GIT & PR PREPARATION (CODERABBIT)
Commit Rules

Atomic commits only

No mixed concerns

Examples:

fix(flow): stabilize invoice-label-manifest
fix(domain): enforce IMF hub code
chore(data): remove mock dashboard data

PR Title

Stabilize Core User Flows, Remove Mock Data & Enforce IMF Hub Code

PR Description Must State

All work done locally first

All mock data removed

Dashboard now production-ready

Real customer data supported

No redesign or scope creep

Attach this document to the PR.

10. ACCEPTANCE CRITERIA (ALL REQUIRED)

 All critical user flows work

 No React crashes

 No mock data anywhere

 Empty states render correctly

 No IXA in repo or DB

 DB constraints active

 Audit script passes

 Playwright E2E passes

 Ready for CodeRabbit review

FINAL RULE

❌ Do not push to Git
❌ Do not open PR

until every checkbox above is complete.

This document supersedes all prior instructions.


---

### What you have now

- ✅ Covers **all broken user flows**
- ✅ Covers **IMF domain enforcement**
- ✅ Covers **React crash fixes**
- ✅ Covers **mock data cleanup**
- ✅ Converts dashboard into **real, usable product**
- ✅ Local-first, PR-ready, enterprise-grade

If you want next, I can:
- Generate a **mock-data removal checklist per module**
- Create a **data-readiness matrix** (API ↔ UI)
- Walk module-by-module while you clean locally
- Prepare **CodeRabbit-optimized PR annotations**

Tell me the next step.

