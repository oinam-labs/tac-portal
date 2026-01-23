# TAC Cargo Dashboard — Full User Flow Stabilization & Domain Enforcement
## Single Execution Instruction (Local First, Pre-Git, Pre-PR)

---

## 0. INTENT & AUTHORITY

This document is the **single source of truth** for stabilizing the TAC Cargo dashboard.

Its purpose is to:

1. Fix **all currently broken or unstable user flows**
2. Enforce **correct logistics domain rules** (IMF hub)
3. Eliminate **React crashes, invalid states, and coupling bugs**
4. Protect the system with **guards at UI, API, DB, CI, and E2E levels**
5. Prepare a **clean, reviewable PR** suitable for CodeRabbit

⚠️ **All work must be completed locally in `C:\tac-portal` before any Git push.**

---

## 1. DOMAIN LAW (NON-NEGOTIABLE)

### Canonical Hub Codes

DEL, GAU, CCU, IMF


### Forbidden Everywhere


If `IXA` appears in **any layer** (UI, API, DB, PDF, tests, logs), it is a **blocking defect**.

---

## 2. PRIORITY ORDER (DO NOT CHANGE)

Execution priority is fixed and must be followed in this order:

1. **Broken user flows**
2. **Crash & stability issues**
3. **Domain correctness (IMF)**
4. **Data integrity (DB)**
5. **Guards & automation**
6. **PR readiness**

---

## 3. CRITICAL USER FLOWS (MUST WORK END-TO-END)

### 3.1 Invoice → Dispatch → Label → Manifest (PRIMARY FLOW)

#### Expected Truth
- Invoice creation produces a valid shipment
- Invoice download and Label download are **independent**
- Manifest creation is the **authoritative dispatch step**

#### Fix & Validate
- Create Invoice
- Download Invoice PDF
- Download Label PDF
- Create Manifest
- Confirm route shows:

IMF → DEL


#### Forbidden Failures
- Invoice download breaks label
- Label download breaks invoice
- Manifest depends on invoice screen state

---

### 3.2 Shipment → Print Label (BLOCKER FIX)

#### Required Behavior
- Printing a label from **Shipment Details** must work directly
- Shipment ID must be sufficient to generate label

#### Forbidden Error

No shipment data found. Please generate label from Invoices dashboard.


This error must not exist anywhere in the system.

---

### 3.3 Manifest Creation (CRASH & DATA FIX)

#### Required Behavior
- Manifest page must never crash
- Hub selection must show:

Imphal Hub (IMF)


#### Forbidden
- `Imphal Hub (IXA)`
- React error:

Failed to execute 'removeChild' on 'Node'


#### Audit & Fix
- `<Text>` components
- Conditional rendering
- Missing React keys
- Manual DOM manipulation
- Incorrect unmount cleanup
- Realtime subscriptions causing re-renders

---

### 3.4 Customer Search in Invoice Flow

#### Required Behavior
- Consigner / Consignee search must return valid customers
- Empty state must be handled gracefully

#### Forbidden
- `{}` treated as valid response
- False message:


#### Audit & Fix
- `<Text>` components
- Conditional rendering
- Missing React keys
- Manual DOM manipulation
- Incorrect unmount cleanup
- Realtime subscriptions causing re-renders

---

### 3.4 Customer Search in Invoice Flow

#### Required Behavior
- Consigner / Consignee search must return valid customers
- Empty state must be handled gracefully

#### Forbidden
- `{}` treated as valid response
- False message:

No customers found. Please create a customer first.

when customers exist

---

### 3.5 Routing & Sidebar Integrity

#### Required Behavior
- Sidebar labels must match actual routes
- No broken links
- No hash-based routing mismatches

---

## 4. SECONDARY USER FLOWS (MUST NOT BREAK)

These flows must be **verified for non-regression**, even if not deeply enhanced:

- Tracking timeline rendering
- Realtime shipment updates (no subscription loops)
- Shipment status history
- Document downloads (Invoice, Label, Manifest)

---

## 5. SYSTEM-WIDE DOMAIN FIX — IMF ENFORCEMENT

### 5.1 UI Layer
- Replace all `IXA` with `IMF`
- Dropdowns, labels, filters, badges
- PDFs and previews

### 5.2 Backend / API Layer
- APIs must never accept or return `IXA`
- Validate hub codes against:

['DEL', 'GAU', 'CCU', 'IMF']


### 5.3 Realtime
- Supabase payloads must emit only valid hub codes
- No CLOSED ↔ SUBSCRIBED subscription loops

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

6.2 CHECK Constraints (Hard Lock)

ALTER TABLE shipments
ADD CONSTRAINT shipments_origin_hub_valid
CHECK (origin_hub IN ('DEL','GAU','CCU','IMF'));

ALTER TABLE shipments
ADD CONSTRAINT shipments_destination_hub_valid
CHECK (destination_hub IN ('DEL','GAU','CCU','IMF'));

Apply equivalent constraints to:

manifests

routes

tracking_events (if hub stored)

7. AUTOMATED GUARDS (MANDATORY)
7.1 Repository Audit Script

Create and run locally:

scripts/audit-hub-codes.js

The script must:

Scan allowed directories

Fail if IXA exists

Exit non-zero on violation

7.2 Playwright E2E (Local)

E2E tests must assert:

No UI text contains IXA

Imphal dropdown shows only IMF

Invoice → Label → Manifest completes

No API payload contains IXA

All tests must pass locally.

8. MANUAL SMOKE TEST (REQUIRED)

Perform once locally:

Create Invoice

Download Invoice

Print Label

Create Manifest

Verify:

IMF → DEL

Manually inspect PDFs:

Invoice

Label

Manifest

Search:

IMF → DEL

Manually inspect PDFs:

Invoice

Label

Manifest

Search:

IMF ✅
IXA ❌

9. GIT & PR PREPARATION (CODERABBIT)
9.1 Commit Rules

Atomic commits

Clear intent:

fix(domain): enforce IMF hub code
fix(flow): stabilize invoice-label-manifest
fix(manifest): resolve React crash

9.2 PR Requirements

PR Title

Stabilize Core User Flows & Enforce Canonical IMF Hub Code

PR Description Must State

All fixes done locally first

Broken user flows corrected

IMF enforced at UI, API, DB, CI levels

No redesigns or scope creep

Attach this document to the PR.

10. ACCEPTANCE CRITERIA (ALL REQUIRED)

 All critical user flows work

 No React crashes

 No IXA in repo

 No IXA in DB

 DB constraints active

 Audit script passes

 Playwright E2E passes

 Ready for CodeRabbit review

11. FINAL RULE

❌ Do not push to Git
❌ Do not open PR

until every checkbox above is complete.

This document supersedes all previous instructions.


---

### What this gives you

- ✅ Covers **all broken user flows**
- ✅ Includes **everything discussed so far**
- ✅ Clear execution priority
- ✅ Local-first discipline
- ✅ CodeRabbit-friendly
- ✅ Enterprise-grade clarity

If you want next, I can:
- Convert this into **`tasks.md` style** (step-by-step checklist)
- Produce a **flow coverage matrix** mapped to this document
- Generate the **exact PR description text**
- Walk through **each phase interactively** while you execute locally

Just tell me the next step.

