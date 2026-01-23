✅ Enhanced Instruction Prompt (Production-Level QA + Audit)

Role:
Act as a Senior QA Engineer + Product Analyst + Enterprise Logistics Systems Auditor for the TAC Cargo dashboard.

1) Objective

Your task is to run a complete end-to-end validation of the TAC Cargo Dashboard to confirm:

All dashboard pages and modules are working correctly

Features match the PRD + tasks documentation

API + Database behavior matches real logistics company operational needs

The project meets enterprise-level production readiness standards

Critical issues, missing features, broken flows, and UX gaps are identified

A comprehensive test report + audit report is delivered (NO CODE in this phase)

2) Documentation Sources (Must Analyze First)

Before opening the application, analyze the following documents carefully and extract:

Functional requirements

Workflows

Data models (expected tables, fields, relations)

Feature acceptance criteria

Pending tasks vs completed tasks

Enterprise readiness expectations

Documentation paths:

C:\tac-portal\docs\TAC-Cargo-Enhancement-PRD.md

C:\tac-portal\docs\TAC-Cargo-Enhancement-tasks.md

3) Login Credentials for Testing

After analyzing documentation, open the dashboard in the browser and login using:

Email: tapancargo@gmail.com

Password: Test@1498

4) Test Coverage Requirements (Must Test Every Page)

You must test each and every page, validating:

UI functionality

Navigation correctness

CRUD flows

Form validations

Edge cases

Data persistence

Role access behavior (if applicable)

Loading states + errors

Performance and responsiveness

Workflow consistency across modules

Pages to be tested fully:

Overview

Dashboard

Analytics

Operations

Shipments

Tracking

Manifests

Scanning

Inventory

Exceptions

Business

Invoices

Customers

Management

System

Settings

5) API + Database Verification (Supabase MCP Required)

Use Supabase MCP to validate backend correctness including:

API calls and network requests

Database reads/writes

Table consistency with documentation expectations

RLS policies correctness (security)

Data integrity (foreign keys, constraints)

Auditability for logistics operations

Performance bottlenecks (slow queries / excessive reads)

You must confirm:

Each page interacts correctly with the right Supabase tables

Each action results in correct database updates

No silent failures / partial writes

Error responses are handled properly

6) Enterprise Logistics Validation (Real Business Readiness)

Audit whether the product truly behaves like an enterprise logistics company platform, including:

Shipment lifecycle support

Manifest lifecycle correctness

Scanning reliability + traceability

Inventory accuracy + reconciliation capability

Exception workflow practicality

Invoice workflow reliability + correctness

Customer management completeness

Operational clarity for admins and staff

7) Code Review Requirement (No Code Output)

Perform a deep code review and architecture audit using:

@.agent/skills

Focus areas:

Folder structure sanity

Component organization

API layer design

Error handling strategy

Logging & observability readiness

Security / authentication implementation

Role access control readiness

Data fetching patterns (performance)

Reusability and maintainability

✅ Do not write code.
✅ Only identify improvements + issues in report form.

8) Deliverables (Report First — No Code)

Produce a detailed QA + Audit Report containing:

A) Documentation Alignment Report

What matches PRD/tasks

What is missing

What is implemented incorrectly

B) Functional Testing Results

Passed / Failed by page/module

Broken workflows

UI/UX bugs

Edge case failures

C) API + Database Audit

Supabase issues

Missing tables/columns

Incorrect relationships

Wrong query patterns

Security (RLS) concerns

D) Enterprise Readiness Evaluation

What prevents production deployment

What is acceptable for MVP only

What must be fixed for real operations

E) Severity Classification

Classify issues using:

P0 (Blocker / Production Stopper)

P1 (Critical)

P2 (Major)

P3 (Minor)

P4 (Enhancement)

F) Recommendations Roadmap

“Fix now”

“Fix next sprint”

“Later improvements”

✅ TAC Cargo Dashboard — QA + Enterprise Audit Report Template
0) Report Meta

Project: TAC Cargo Portal (TAC-Portal)

Environment: (Local / Staging / Production)

Build/Commit ID: (if available)

Test Date: (YYYY-MM-DD)

Tester Name: (Name)

Browser(s): (Chrome / Edge / Firefox)

OS: (Windows / macOS)

Test Type: Functional + API + DB + Security + UX + Enterprise readiness

Supabase Project: (Project name / URL)

Test Credentials Used:

Email: tapancargo@gmail.com

Password: Test@1498

1) Documentation Review Summary (Must be done first)
1.1 Documents Reviewed

C:\tac-portal\docs\TAC-Cargo-Enhancement-PRD.md

C:\tac-portal\docs\TAC-Cargo-Enhancement-tasks.md

1.2 Key Intended Business Outcome (From PRD)

What TAC Cargo aims to achieve (1–2 lines):

…

1.3 Core Modules Expected (From Docs)

Expected modules & workflows extracted from PRD/tasks:

…

1.4 PRD vs Implementation Confidence

Rate alignment:

✅ Fully aligned

⚠️ Partially aligned

❌ Misaligned

Notes:

…

2) Test Scope & Methodology
2.1 Scope (Pages Covered)

✅ Full coverage required:

Overview

Dashboard

Analytics

Operations

Shipments

Tracking

Manifests

Scanning

Inventory

Exceptions

Business

Invoices

Customers

Management

System

Settings

2.2 Testing Method

UI functional testing (click-by-click)

Workflow testing (real logistics flows)

API validation (Network tab)

Supabase DB validation (MCP queries)

Security readiness (RLS, auth, permissions)

Performance UX (load time, responsiveness)

3) Executive Summary (Decision Ready)
3.1 Overall Result

Choose one:

✅ Production Ready

⚠️ Staging Ready (Not Production)

❌ Not Deployable

3.2 Major Findings (Top 5)

…

…

…

…

…

3.3 Total Issues Count
Severity	Count
P0 Blocker	
P1 Critical	
P2 Major	
P3 Minor	
P4 Enhancement	
4) Global Testing Checklist (Applies to all pages)

For every page/module, validate:

4.1 UI/UX

 Page loads without crash

 Layout responsive (Desktop & Tablet minimum)

 Clear page header and actions

 Search + filter quality (fast, accurate)

 Empty state properly designed

 Loading skeletons/spinners present

 Error states handled gracefully

 Accessibility basics (labels, tab navigation)

4.2 Functional

 Buttons work

 Modals work

 Forms validate correctly

 CRUD works end-to-end

 Input sanitization / prevents invalid writes

 Pagination working (if needed)

 Sorting works

 Export/import if required

4.3 Security & Permissions

 Auth required

 Protected routes enforced

 Unauthorized user cannot access restricted modules

 Role restrictions correct (if roles exist)

 No sensitive data leakage

4.4 Data Integrity

 Correct Supabase table(s) used

 Correct write operations (insert/update/delete)

 No duplicated or missing records

 Foreign key integrity

 Audit fields (created_at, updated_at, created_by)

5) Page-by-Page Validation Report

Use this structure for each page.

5.X Page: [PAGE NAME]
A) Purpose (From Docs)

What this page should do:

…

B) Navigation & Layout

Route: /...

Sidebar active state: ✅/❌

Breadcrumb: ✅/❌

Consistency with other pages: ✅/❌

C) Features Checklist

List expected features and status:

Feature	Expected (Docs)	Works?	Notes
Feature 1	✅	✅/❌	
Feature 2	✅	✅/❌	
D) CRUD Testing

Create: ✅/❌ (Steps + result)

Read/List: ✅/❌

Update/Edit: ✅/❌

Delete: ✅/❌

Bulk actions: ✅/❌/N/A

E) API Validation

Expected API calls:

GET ...

POST ...

Actual API behavior:

✅ correct payload

❌ missing fields

❌ wrong response mapping

Error handling:

✅/❌

F) Supabase Database Validation (via MCP)

Tables touched:

shipments

manifests

etc.

DB integrity checks:

Insert correctness: ✅/❌

Update correctness: ✅/❌

Constraints: ✅/❌

RLS policy tested: ✅/❌

G) Logistics Workflow Readiness

Does it work for real operations?

✅ Yes

⚠️ Partial

❌ No

Notes:

…

H) Issues Found

List issues in severity format:

Issue #1

Severity: P0/P1/P2/P3/P4

Module/Page: …

Summary: …

Steps to reproduce:

…

…

Expected:

Actual:

Evidence:

Screenshot / Console / Network error

Recommendation:

6) Logistics Workflow End-to-End Tests (Critical)

These are real-world tests, not just UI testing.

6.1 Shipment Lifecycle Test

Create shipment ✅/❌

Assign destination ✅/❌

Update status progression ✅/❌

Tracking updates ✅/❌

Exceptions handling ✅/❌

6.2 Manifest Lifecycle Test

Add packages to manifest ✅/❌

Manifest total count correct ✅/❌

Finalize manifest ✅/❌

Export/print if required ✅/❌

Scanning verification ✅/❌

6.3 Scanning Workflow Test

Scan package ✅/❌

Duplicate scan handling ✅/❌

Wrong barcode handling ✅/❌

Offline/slow network behavior ✅/❌

6.4 Invoice Workflow Test

Generate invoice ✅/❌

PDF generation ✅/❌

Save invoice history ✅/❌

Customer linkage ✅/❌

WhatsApp sending (if included) ✅/❌

7) API + Database Audit Summary
7.1 Supabase Schema Validation

Missing tables/columns: …

Wrong naming conventions: …

Wrong relationships: …

Required indexes missing: …

7.2 Performance Checks

Slow queries detected: ✅/❌

Excessive re-fetching: ✅/❌

N+1 query behavior: ✅/❌

7.3 Security Checks

RLS missing: ✅/❌

Over-permissive rules: ✅/❌

Sensitive data exposure: ✅/❌

8) Code Review Report (No Code Output)
8.1 Codebase Structure

Folder structure quality: ✅/⚠️/❌

Naming conventions: ✅/⚠️/❌

Duplication issues: ✅/⚠️/❌

8.2 Frontend Engineering

Component design: ✅/⚠️/❌

Form handling strategy: ✅/⚠️/❌

Loading/error patterns: ✅/⚠️/❌

8.3 Backend Integration

API layer quality: ✅/⚠️/❌

Supabase usage design: ✅/⚠️/❌

State management patterns: ✅/⚠️/❌

8.4 Enterprise Readiness

Observability/logging readiness: ✅/⚠️/❌

Audit trails: ✅/⚠️/❌

Separation of concerns: ✅/⚠️/❌

9) Final Recommendations (Roadmap)
9.1 Immediate Fixes (P0 / P1)

…

…

9.2 Next Sprint Fixes (P2)

…

…

9.3 Enhancements (P3 / P4)

…

…

