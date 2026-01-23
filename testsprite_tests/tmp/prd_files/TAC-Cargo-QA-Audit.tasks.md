ROLE

You are a Senior QA Engineer + Enterprise Product Auditor + Logistics Operations Analyst.

You must validate that the TAC Cargo Portal dashboard is:

working end-to-end,

aligned with documentation,

correct at API + database level,

production-ready for enterprise logistics operations.

PRIMARY GOAL

Run a full system verification of TAC Cargo dashboard modules, and deliver:

Documentation Compliance Report

Functional QA Report

API + DB Verification Report (Supabase MCP)

Enterprise Readiness Report

Code Review Audit Report (NO CODE output)

INPUT DOCUMENTATION (READ FIRST)

Analyze and extract functional requirements from:

C:\tac-portal\docs\TAC-Cargo-Enhancement-PRD.md

C:\tac-portal\docs\TAC-Cargo-Enhancement-tasks.md

You must build an internal checklist of:

required pages

required features per page

CRUD expectations

workflow expectations

data models (tables, columns, relationships)

acceptance criteria (explicit + implicit)

LOGIN DETAILS (BROWSER TESTING)

After documentation review, open the dashboard app in browser and login using:

Email: tapancargo@gmail.com

Password: Test@1498

TESTING SCOPE (MANDATORY)

You must test every page/module listed below.

Pages/Modules

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

RULES / CONSTRAINTS

✅ You must:

test UI + UX + workflows

test all CRUD paths wherever applicable

verify API requests and responses

verify Supabase database correctness using Supabase MCP

classify issues by severity (P0–P4)

recommend fixes and improvements

❌ You must NOT:

write code

implement fixes

change production data

skip any module

TEST EXECUTION PLAN
TASK 1 — Documentation Mapping

Read PRD and Tasks documents fully.

Create a PRD → Implementation Matrix:

feature name

required behavior

expected UI page

expected Supabase table(s)

acceptance criteria

Deliverable: Docs Mapping Summary

TASK 2 — Smoke Test (System-wide)

Verify app loads without crash.

Verify login works.

Verify sidebar navigation works.

Verify route protection (non-logged-in access check).

Verify global layout stability (no overlapping/scroll breaking).

Deliverable: Smoke Test Result

TASK 3 — Page-by-Page Functional Testing

For each page:

Checklist (mandatory)

Page loads (no crash)

Navigation + route correct

Page title + module context clear

UI components render correctly

Responsiveness (desktop)

Loading states

Empty states

Error states

Search/filter/sort works (if present)

CRUD works (if expected)

User feedback: toast/alerts present

State consistency (no stale data)

Deliverable per page:

✅ PASS / ❌ FAIL

issues list

evidence notes

TASK 4 — End-to-End Logistics Workflow Validation

Perform realistic enterprise tests:

Workflow A — Shipment Lifecycle

create shipment

assign customer

assign destination

update shipment status progression

verify tracking updated

verify audit visibility

Workflow B — Manifest Lifecycle

create manifest

add packages to manifest

verify totals count

finalize dispatch

verify manifest state locked (if expected)

Workflow C — Scanning Workflow

scan barcode

ensure shipment status updates properly

handle duplicate scan safely

handle invalid barcode gracefully

Workflow D — Invoice Workflow

generate invoice

verify totals/taxes/line items

verify PDF generation (if required in docs)

verify invoice stored + linked to customer

Deliverable:

workflow readiness score

breakdown of failures

TASK 5 — API Validation (Network Layer)

For each tested module, inspect network/API behavior:

Identify key API calls per action (create/edit/delete)

Validate request payload correctness

Validate response mapping correctness

Validate error handling correctness

Confirm no sensitive data leakage in responses

Deliverable:

API issues list

module-to-API mapping summary

TASK 6 — Supabase MCP Database Validation (CRITICAL)

Use Supabase MCP to verify:

correct tables are being used

inserts/updates reflect UI actions

relational integrity is correct

audit fields correctness:

created_at

updated_at

created_by / user_id

data is not duplicating unexpectedly

constraints are enforced (or missing)

Also validate:

RLS policies exist and are not overly permissive

unauthorized access is blocked

Deliverable:

DB schema alignment notes

missing columns/tables

incorrect relations

RLS/security concerns

TASK 7 — Code Review Audit (No Code Output)

Using @.agent/skills, perform a comprehensive codebase audit:

Must review

architecture quality

folder structure

reusable component patterns

state management patterns

form handling patterns

error boundaries

API client structure

performance risks

security risks

maintainability issues

Deliverable:

code quality score

high-risk modules

refactoring recommendations

ISSUE SEVERITY CLASSIFICATION

Use:

P0 Blocker = prevents system usage / data loss / security breach

P1 Critical = core business workflows broken

P2 Major = important features not working as expected

P3 Minor = UI bugs, edge case issues

P4 Enhancement = improvements / polish

Every issue must include:

module/page name

summary

steps to reproduce

expected vs actual

suspected cause (if possible)

recommended fix approach

FINAL OUTPUT FORMAT (REPORT ONLY)

Produce a final report with these sections:

1) Executive Summary

overall status: Production Ready / Not Ready

top 5 problems

readiness score

2) PRD Compliance Matrix

requirement → status

3) Full Test Results by Page

PASS/FAIL

issues list

4) Workflow Readiness Report

Shipment

Manifest

Scanning

Invoice

5) API Audit

payload correctness

error handling

missing endpoints / misuse

6) Supabase DB Audit

schema alignment

integrity

RLS/security risks

data correctness

7) Code Review Audit

architecture score

critical refactor needs

tech debt

8) Action Roadmap

Fix now (P0/P1)

Next sprint (P2)

Later (P3/P4)

✅ TAC Cargo Portal — QA Execution Checklist Sheet (Enterprise)
0) Test Session Info

Test Run ID: TAC-QA-YYYYMMDD-01

Environment: Local / Staging / Prod

Build/Commit: __________

Tester: __________

Browser: Chrome / Edge / Firefox

Device: Desktop

Start Time: __________

End Time: __________

1) Pre-Test Requirements Checklist
Item	Status	Notes
PRD reviewed (TAC-Cargo-Enhancement-PRD.md)	☐ PASS ☐ FAIL	
Tasks reviewed (TAC-Cargo-Enhancement-tasks.md)	☐ PASS ☐ FAIL	
Feature checklist extracted	☐ PASS ☐ FAIL	
Supabase MCP connected	☐ PASS ☐ FAIL	
Test login credentials ready	☐ PASS ☐ FAIL	
Network tab enabled (for API inspection)	☐ PASS ☐ FAIL	
2) Smoke Test (Global System)
Test	Steps	Expected	Status	Evidence/Notes
App loads	Open base URL	No crash, loads UI	☐ PASS ☐ FAIL	
Login works	Login using provided credentials	Redirects to dashboard	☐ PASS ☐ FAIL	
Protected routes	Open module without auth	Redirect to login	☐ PASS ☐ FAIL	
Sidebar works	Click each menu	Correct route + highlight	☐ PASS ☐ FAIL	
Global layout stable	Resize, scroll	No overlapping UI	☐ PASS ☐ FAIL	
No console errors	Inspect console	No red errors	☐ PASS ☐ FAIL	
Logout works	Logout then revisit route	Route blocked	☐ PASS ☐ FAIL	
3) Module-by-Module Page Checklist (PASS/FAIL)
✅ How to test each page

For every page, validate:

Page loads without crash

Data table renders correctly

Create/Edit/Delete works (if applicable)

Search/filter/sort works (if applicable)

Validation works

API calls succeed (Network tab)

DB writes correct (Supabase MCP)

Loading/empty/error states are handled

Enterprise UX: clarity, speed, reliability

4) Page QA Checklist Table (All Pages)
4.1 Overview
Checkpoint	Status	Notes
Route loads correctly	☐ PASS ☐ FAIL	
KPI widgets accurate	☐ PASS ☐ FAIL	
Charts load & correct	☐ PASS ☐ FAIL	
Links navigate correctly	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.2 Dashboard
Checkpoint	Status	Notes
Route loads correctly	☐ PASS ☐ FAIL	
Summary cards accurate	☐ PASS ☐ FAIL	
Quick actions work	☐ PASS ☐ FAIL	
Recent activity list correct	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.3 Analytics
Checkpoint	Status	Notes
Route loads correctly	☐ PASS ☐ FAIL	
Chart filters work	☐ PASS ☐ FAIL	
Date range logic correct	☐ PASS ☐ FAIL	
No chart render bugs	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.4 Operations
Checkpoint	Status	Notes
Route loads correctly	☐ PASS ☐ FAIL	
Ops actions usable	☐ PASS ☐ FAIL	
Status workflow supported	☐ PASS ☐ FAIL	
Bulk actions work	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.5 Shipments
Checkpoint	Status	Notes
Shipment list loads	☐ PASS ☐ FAIL	
Create shipment works	☐ PASS ☐ FAIL	
Edit shipment works	☐ PASS ☐ FAIL	
Delete shipment works (if allowed)	☐ PASS ☐ FAIL	
Status updates persist	☐ PASS ☐ FAIL	
Search/filter/sort works	☐ PASS ☐ FAIL	
API calls correct	☐ PASS ☐ FAIL	
DB row reflects change	☐ PASS ☐ FAIL	
4.6 Tracking
Checkpoint	Status	Notes
Tracking page loads	☐ PASS ☐ FAIL	
Tracking ID search works	☐ PASS ☐ FAIL	
Status timeline accurate	☐ PASS ☐ FAIL	
Edge: unknown ID handled	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.7 Manifests
Checkpoint	Status	Notes
Manifest list loads	☐ PASS ☐ FAIL	
Create manifest works	☐ PASS ☐ FAIL	
Add shipment to manifest	☐ PASS ☐ FAIL	
Finalize manifest	☐ PASS ☐ FAIL	
Totals count correct	☐ PASS ☐ FAIL	
Prevent edits after finalize	☐ PASS ☐ FAIL	
DB integrity verified	☐ PASS ☐ FAIL	
4.8 Scanning
Checkpoint	Status	Notes
Scan UI loads	☐ PASS ☐ FAIL	
Scan valid barcode works	☐ PASS ☐ FAIL	
Duplicate scan handling	☐ PASS ☐ FAIL	
Invalid barcode message	☐ PASS ☐ FAIL	
Scan updates shipment status	☐ PASS ☐ FAIL	
Scan logged in DB	☐ PASS ☐ FAIL	
4.9 Inventory
Checkpoint	Status	Notes
Inventory list loads	☐ PASS ☐ FAIL	
Item create/edit works	☐ PASS ☐ FAIL	
Stock adjustments correct	☐ PASS ☐ FAIL	
Stock cannot go negative	☐ PASS ☐ FAIL	
DB stock integrity good	☐ PASS ☐ FAIL	
4.10 Exceptions
Checkpoint	Status	Notes
Exceptions list loads	☐ PASS ☐ FAIL	
Create exception works	☐ PASS ☐ FAIL	
Assign/resolution works	☐ PASS ☐ FAIL	
SLA/status workflows present	☐ PASS ☐ FAIL	
DB aligns with shipment state	☐ PASS ☐ FAIL	
4.11 Business
Checkpoint	Status	Notes
Business dashboard loads	☐ PASS ☐ FAIL	
Financial summaries correct	☐ PASS ☐ FAIL	
Export/report works	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.12 Invoices
Checkpoint	Status	Notes
Invoice list loads	☐ PASS ☐ FAIL	
Create invoice works	☐ PASS ☐ FAIL	
Edit invoice works	☐ PASS ☐ FAIL	
Invoice totals correct	☐ PASS ☐ FAIL	
Invoice customer link correct	☐ PASS ☐ FAIL	
PDF generated (if required)	☐ PASS ☐ FAIL	
DB record stored correctly	☐ PASS ☐ FAIL	
4.13 Customers
Checkpoint	Status	Notes
Customer list loads	☐ PASS ☐ FAIL	
Create customer works	☐ PASS ☐ FAIL	
Edit customer works	☐ PASS ☐ FAIL	
Delete/Deactivate works	☐ PASS ☐ FAIL	
Customer linked across modules	☐ PASS ☐ FAIL	
4.14 Management
Checkpoint	Status	Notes
Users/roles management works	☐ PASS ☐ FAIL	
Role restrictions enforced	☐ PASS ☐ FAIL	
Audit logs present	☐ PASS ☐ FAIL	
Security issues absent	☐ PASS ☐ FAIL	
4.15 System
Checkpoint	Status	Notes
System settings load	☐ PASS ☐ FAIL	
Integration config works	☐ PASS ☐ FAIL	
Backups/logs pages load	☐ PASS ☐ FAIL	
API + DB alignment	☐ PASS ☐ FAIL	
4.16 Settings
Checkpoint	Status	Notes
Settings page loads	☐ PASS ☐ FAIL	
Profile settings work	☐ PASS ☐ FAIL	
Theme settings work	☐ PASS ☐ FAIL	
Password reset works	☐ PASS ☐ FAIL	
5) Workflow Checklist (Enterprise Logistics E2E)
Workflow A — Shipment → Manifest → Scan → Tracking
Step	Status	Notes
Create shipment	☐ PASS ☐ FAIL	
Add to manifest	☐ PASS ☐ FAIL	
Finalize manifest	☐ PASS ☐ FAIL	
Scan shipment	☐ PASS ☐ FAIL	
Tracking timeline updates	☐ PASS ☐ FAIL	
Workflow B — Shipment → Exception → Resolve
Step	Status	Notes
Create exception	☐ PASS ☐ FAIL	
Assign exception	☐ PASS ☐ FAIL	
Resolve exception	☐ PASS ☐ FAIL	
Shipment status updated	☐ PASS ☐ FAIL	
Workflow C — Invoice lifecycle
Step	Status	Notes
Create invoice from shipment	☐ PASS ☐ FAIL	
Totals & tax accurate	☐ PASS ☐ FAIL	
Invoice saved to DB	☐ PASS ☐ FAIL	
Customer linked correctly	☐ PASS ☐ FAIL	
6) Issue Log Template (Fill for every problem)

Issue ID: TAC-ISSUE-001

Severity: P0 / P1 / P2 / P3 / P4

Page/Module:

Summary:

Steps to reproduce:
1)
2)
3)

Expected:

Actual:

Evidence: Screenshot / Console / API response

Suspected Cause:

Recommendation:

7) Final QA Verdict (Decision)

✅ Production Ready

⚠️ Staging Ready (Not Production)

❌ Not Deployable

Reason (short):

✅ TAC Cargo Portal — Enterprise QA + PRD Compliance + API/DB Audit Report

(Report Output Template — NO CODE)

0) Report Metadata

Project: TAC Cargo Portal (TAC-Portal)

Report Type: QA + Product Audit + Enterprise Readiness Review

Environment: Local / Staging / Production

Build/Commit Hash: __________

Test Date: YYYY-MM-DD

Tester/Agent: __________

Browser(s): __________

Device: Desktop (minimum)

Supabase Project Name/ID: __________

Test Account Used:

Email: tapancargo@gmail.com

Password: Test@1498

1) Executive Summary (Decision Ready)
1.1 Production Readiness Verdict

Choose one:

✅ Production Ready

⚠️ Partially Ready (Staging Only)

❌ Not Deployable

1.2 Readiness Score

Rate each dimension (0–10):

Functional completeness: __/10

PRD compliance: __/10

API reliability: __/10

Database integrity: __/10

Security / RLS: __/10

UX enterprise quality: __/10

Performance stability: __/10

Maintainability: __/10

Overall Score: __/10

1.3 Top 10 Findings (Most Important)
2) Documentation Alignment Summary
2.1 Documents Reviewed

TAC-Cargo-Enhancement-PRD.md

TAC-Cargo-Enhancement-tasks.md

2.2 PRD-to-Implementation Status

Choose one:

✅ Fully aligned

⚠️ Partially aligned

❌ Misaligned

2.3 Key PRD Outcomes vs Delivered Features

Summarize:

What the PRD expects

What is delivered

What is missing

3) PRD Compliance Matrix (Requirement-by-Requirement)

This section should be structured like an enterprise traceability matrix.

PRD Requirement ID	Requirement	Page/Module	Implemented?	Status	Notes
PRD-001			Yes/No	✅/⚠️/❌	
PRD-002			Yes/No	✅/⚠️/❌	

Legend:

✅ Implemented Correctly

⚠️ Partially / incorrect behavior

❌ Not implemented / broken

4) Global System Testing Results
4.1 Smoke Test
Test	Status	Notes
App loads	✅/❌	
Login works	✅/❌	
Logout works	✅/❌	
Sidebar routes stable	✅/❌	
Protected routes enforced	✅/❌	
No critical console errors	✅/❌	
4.2 Global UX Quality

Layout consistency: ✅/⚠️/❌

Responsiveness: ✅/⚠️/❌

Loading/empty states quality: ✅/⚠️/❌

Error UX quality: ✅/⚠️/❌

Enterprise UI polish: ✅/⚠️/❌

5) Module-by-Module QA Report (Mandatory)

Every module must include: PASS/FAIL, key features tested, CRUD verification, API behavior, DB behavior, issues.

5.1 Overview

Status: ✅ PASS / ❌ FAIL

Key Features Tested: …

CRUD Tested: N/A / ✅ / ❌

API Validated: ✅/❌

DB Validated: ✅/❌

Notes: …

5.2 Dashboard

Status: ✅ PASS / ❌ FAIL

Key Features Tested: …

CRUD Tested: N/A / ✅ / ❌

API Validated: ✅/❌

DB Validated: ✅/❌

Notes: …

5.3 Analytics

Status: ✅ PASS / ❌ FAIL

Key Features Tested: …

Filters + ranges: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.4 Operations

Status: ✅ PASS / ❌ FAIL

Ops workflow readiness: ✅/⚠️/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.5 Shipments

Status: ✅ PASS / ❌ FAIL

CRUD: Create ✅/❌ | Read ✅/❌ | Update ✅/❌ | Delete ✅/❌

Search/filter/sort: ✅/❌

Shipment state updates persisted: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.6 Tracking

Status: ✅ PASS / ❌ FAIL

Tracking search: ✅/❌

Timeline correctness: ✅/❌

Unknown tracking ID handling: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.7 Manifests

Status: ✅ PASS / ❌ FAIL

Create manifest: ✅/❌

Add shipments/packages: ✅/❌

Finalize manifest: ✅/❌

Lock after finalize: ✅/❌

Totals accuracy: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.8 Scanning

Status: ✅ PASS / ❌ FAIL

Scan success: ✅/❌

Duplicate scan handling: ✅/❌

Invalid barcode handling: ✅/❌

Shipment status updated after scan: ✅/❌

DB scan logs verified: ✅/❌

5.9 Inventory

Status: ✅ PASS / ❌ FAIL

Stock updates correct: ✅/❌

Negative stock prevention: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.10 Exceptions

Status: ✅ PASS / ❌ FAIL

Create exception: ✅/❌

Resolve workflow: ✅/❌

Shipment linkage: ✅/❌

SLA/status concept: ✅/⚠️/❌

DB Validated: ✅/❌

5.11 Business

Status: ✅ PASS / ❌ FAIL

Revenue/summary metrics accurate: ✅/❌

Reports/export available: ✅/❌

API Validated: ✅/❌

DB Validated: ✅/❌

5.12 Invoices

Status: ✅ PASS / ❌ FAIL

Invoice create: ✅/❌

Totals calculation: ✅/❌

Customer link: ✅/❌

PDF generation: ✅/⚠️/❌ (if required)

DB Validated: ✅/❌

5.13 Customers

Status: ✅ PASS / ❌ FAIL

Customer CRUD: ✅/❌

Link across shipments/invoices: ✅/❌

Duplicate prevention: ✅/⚠️/❌

DB Validated: ✅/❌

5.14 Management

Status: ✅ PASS / ❌ FAIL

User/roles visible: ✅/❌

Permission enforcement: ✅/❌

Audit logs: ✅/⚠️/❌

Security compliance: ✅/⚠️/❌

5.15 System

Status: ✅ PASS / ❌ FAIL

Config pages stable: ✅/❌

Integration readiness: ✅/⚠️/❌

Security pages: ✅/⚠️/❌

5.16 Settings

Status: ✅ PASS / ❌ FAIL

Profile update works: ✅/❌

Theme toggle works: ✅/❌

Password change/reset works: ✅/❌

6) Enterprise Workflow Readiness Report (Real Logistics)
6.1 Workflow A — Shipment → Manifest → Scan → Tracking

Result: ✅ PASS / ❌ FAIL

Notes:

…

6.2 Workflow B — Shipment → Exception → Resolve

Result: ✅ PASS / ❌ FAIL

Notes:

…

6.3 Workflow C — Invoice Lifecycle

Result: ✅ PASS / ❌ FAIL

Notes:

…

7) API Audit Report (Network & Integration)
7.1 API Reliability Summary

Success rate: __%

Retry/timeout handling: ✅/❌

Error messages actionable: ✅/❌

7.2 API Problems Detected
Issue	Endpoint/Module	Severity	Notes
		P0/P1/P2/P3/P4	
8) Supabase Database Audit Report (MCP)
8.1 Schema Alignment to PRD

✅ Aligned

⚠️ Missing fields/tables

❌ Misaligned

8.2 Data Integrity & Relations

Constraints present: ✅/❌

FK relations correct: ✅/❌

Duplicates issues: ✅/❌

Audit fields present: ✅/❌

8.3 Security (RLS & Auth)

RLS enabled for critical tables: ✅/❌

Policies overly permissive: ✅/❌

Unauthorized access possible: ✅/❌

8.4 DB Issues List
Issue	Table	Severity	Notes
		P0/P1/P2/P3/P4	
9) Code Review Audit (NO CODE OUTPUT)
9.1 Architecture & Maintainability

Structure quality: ✅/⚠️/❌

Complexity management: ✅/⚠️/❌

Code duplication: ✅/⚠️/❌

9.2 Performance Risks

Excessive re-renders: ✅/❌

Heavy queries/over-fetching: ✅/❌

Poor caching strategy: ✅/❌

9.3 Security Risks

Secrets exposure risks: ✅/❌

Client-side permission logic: ✅/❌

Missing validation: ✅/❌

9.4 Recommendations

Refactors needed:

…

Patterns to enforce:

…

10) Issue Register (Full List)
10.1 Issue Summary
Issue ID	Title	Severity	Module	Status
TAC-001		P0		Open
TAC-002		P1		Open
10.2 Detailed Issue Entries

Repeat for each issue:

Issue ID: TAC-___

Severity: P0 / P1 / P2 / P3 / P4

Module/Page:

Summary:

Steps to reproduce:

Expected behavior:

Actual behavior:

Evidence:

Suspected cause:

Fix recommendation:

11) Action Plan Roadmap (What to Fix & In What Order)
11.1 Fix Now (P0 / P1)

…

…

…

11.2 Fix Next Sprint (P2)

…

…

11.3 Enhancements / Polish (P3 / P4)

…

…

12) Final Recommendation

Write a clear deployment decision:

Can this project be deployed to Production today? Yes / No

If no, what blocks it?

If yes, what must be monitored?

✅ TAC Cargo — Severity Rubric & Definition Cheat Sheet

(Enterprise Logistics QA Standard)

Why this rubric matters

In logistics systems, a “small bug” can become a massive operational failure (wrong shipments, lost inventory, billing errors).
So severity must be assigned based on business impact, not just UI impact.

P0 — BLOCKER (Production Stopper)
Definition

A failure that makes the system not usable or creates a high-risk operational/security incident.

Characteristics

Stops operations entirely

Causes data loss or corruption

Allows unauthorized access

Prevents core workflows from completing

Breaks login or access control

Cannot proceed without hotfix

Examples (TAC Cargo)

Cannot login with valid credentials

Sidebar routes crash the app

Creating shipment fails or creates broken record

Manifest finalize fails after packages added

Scanning creates duplicate/conflicting status updates

Invoice totals are wrong (over/under billing)

Supabase RLS missing → any user can access all shipment/customer data

DB writes succeed but UI shows success while data never saved (silent failure)

Expected Action

✅ Fix immediately
✅ Hotfix required
✅ Block production deployment

P1 — CRITICAL (Core Business Broken)
Definition

Core features work partially but are unreliable, creating major operational risk.

Characteristics

Workflow completes but incorrectly

Incorrect data relationships

Wrong status transitions

Significant business process disruption

High-impact logic error, but not total system crash

Examples (TAC Cargo)

Shipment status updates don’t reflect in Tracking timeline

Manifest totals count mismatch

Scanning does not update inventory/shipment state correctly

Exception cannot be resolved or resolution does not update linked shipment

Duplicate shipments created when clicking submit twice

Customer linkage missing in invoice / shipment

API returns inconsistent payload leading to wrong display

Expected Action

✅ Must be fixed before go-live
✅ Should not deploy until resolved
✅ Requires regression test after fix

P2 — MAJOR (Important Feature Broken / Serious UX Failure)
Definition

Non-core but important features fail, reducing usability and efficiency.

Characteristics

Workarounds exist, but slows users down

Some module features broken

Business can still operate but inefficiently

Major UX problems in daily usage

Examples (TAC Cargo)

Search/filter/sort broken in Shipments page

Pagination broken or slow list rendering

Inventory adjustment works but without validation warnings

Exports/reports not working

Analytics charts incorrect for some date ranges

Form validation missing → user can enter invalid data

Poor error messages (user cannot understand what failed)

Expected Action

✅ Fix in the next sprint
✅ Can deploy to staging; production depends on tolerance
✅ Needs UX + product verification

P3 — MINOR (Cosmetic, Non-blocking Bugs)
Definition

Small defects that don’t affect functionality but reduce perceived quality.

Characteristics

Cosmetic UI issues

Minor responsiveness bugs

Text formatting issues

Small UI inconsistency

Examples (TAC Cargo)

Misaligned buttons, spacing inconsistency

Wrong icon used in module

Table columns not aligned properly

Toast message uses wrong grammar

Page title mismatch

Expected Action

✅ Backlog
✅ Fix as part of polish cycle
✅ Acceptable for staging

P4 — ENHANCEMENT (Improvement / Nice-to-have)
Definition

Not a bug. A recommendation that improves enterprise readiness, speed, or UX.

Examples (TAC Cargo)

Add bulk actions (bulk manifest assignment)

Improve dashboard KPIs with advanced metrics

Add global keyboard shortcuts (scan flow speed)

Add saved filters for shipments

Add “recent actions” audit trail in UI

Add SLA timers in Exceptions module

Add automated alerts/notifications

Expected Action

✅ Product roadmap
✅ Do not block production
✅ Implement progressively

Additional Labels (Optional but Highly Useful)
1) Data Risk Tag

Add if issue involves incorrect or unsafe data handling:

[DATA-LOSS] → risk of losing records

[DATA-CORRUPTION] → wrong relational update / wrong totals

[DUPLICATION] → duplicates created (shipments, invoices)

[INTEGRITY] → broken constraints / missing FK enforcement

2) Security Risk Tag

[RLS]

[AUTH]

[PRIVACY]

[SECRETS]

3) Workflow Tag (Logistics)

[SHIPMENT]

[MANIFEST]

[SCAN]

[TRACKING]

[INVOICE]

[CUSTOMER]

[INVENTORY]

Severity Decision Rules (Very Important)

Use these rules consistently:

✅ Severity is based on:

Business impact

Operational risk

Security risk

Ability to recover / rollback

Frequency (happens always vs edge case)

❌ NOT based on:

How easy it is to fix

How complex the code is

How much time it will take

✅ TAC Cargo — Release Gate Checklist (Go / No-Go Criteria)

Enterprise Logistics Deployment Standard

1) Release Decision Summary

Release Name: TAC Cargo Release ____

Environment: Staging → Production

Release Date: YYYY-MM-DD

Approvers: Product Owner / Tech Lead / QA Lead / Ops

✅ Final Decision

Choose one:

✅ GO (Deploy to Production)

⚠️ GO with Risk (Limited rollout, monitoring required)

❌ NO-GO (Block deployment)

2) Zero-Tolerance Blocking Conditions (Automatic NO-GO)

If any of the following are true → ❌ NO-GO:

2.1 P0 Blockers

 0 open P0 issues

 No system crash on navigation or workflow execution

 No data loss / corruption risk

2.2 Security & Access Control

 Supabase RLS enabled for all sensitive tables

 No ability to access other user/company data

 No secrets exposed in client code / network

 Unauthorized access blocked

 Auth session handling secure

2.3 Billing Accuracy

 Invoice totals correct and consistent

 Tax/fees logic correct

 No mismatch between UI totals vs DB totals

2.4 Shipment & Manifest Integrity

 Shipment status transitions correct

 Manifest total count accurate

 No duplicate shipments generated by UI

 No scanning-induced conflicting updates

3) Quality Gates (Must Pass for Production)
3.1 PRD Compliance Gate

 PRD reviewed & mapped (traceability matrix complete)

 Core PRD features implemented

 No missing workflow-critical features

 Tasks.md items tracked: Done vs Pending clearly known

Minimum requirement:
✅ 100% of “core workflow features” completed.

3.2 Functional QA Gate

 Smoke test PASS

 All pages load without crash

 CRUD works on all applicable pages

 Search/filter/sort working where required

 Empty state + loading state + error state present

Minimum requirement:
✅ All critical workflows PASS (below).

3.3 Enterprise Workflow Gate (E2E)

All E2E must PASS:

A) Shipment Lifecycle

 Create shipment

 Update shipment status

 Track shipment status timeline

 Validate DB updates

B) Manifest Lifecycle

 Create manifest

 Add shipments/packages

 Finalize manifest

 Lock behavior correct after finalize

 Totals correct

C) Scanning

 Scan valid barcode updates shipment correctly

 Duplicate scan does not break state

 Invalid barcode gracefully handled

 Scans recorded in DB with audit trail

D) Exceptions

 Create exception

 Resolve exception

 Shipment state remains correct

E) Invoice

 Create invoice

 Totals accurate

 Linked to correct customer

 Invoice stored in DB

Minimum requirement:
✅ All workflows must PASS.

4) Defect Gates (Strict Quality Threshold)
4.1 Allowed Issue Thresholds
Severity	Allowed to Deploy?	Max Allowed
P0 Blocker	❌ NO	0
P1 Critical	❌ NO	0
P2 Major	⚠️ Maybe (risk)	0–3 (only non-core modules)
P3 Minor	✅ Yes	≤ 15
P4 Enhancement	✅ Yes	unlimited
5) Performance Gates (Enterprise Standard)
5.1 Baseline Performance

 Dashboard initial load < 3 seconds (on normal network)

 No long freezing UI when opening list pages

 Large data tables usable (pagination/virtualization if needed)

5.2 API Responsiveness

 No repeated failing API calls

 No infinite loading states

 Error messages shown on failure

 Retry logic for network failure (if implemented)

6) Data & Database Integrity Gates (Supabase)
6.1 Schema & Relations

 Tables match PRD expectations

 FK relations correct (shipments ↔ manifests ↔ customers)

 Constraints prevent invalid states

6.2 Audit Trail Readiness

 created_at / updated_at included

 created_by / org_id (if multi-tenant) included

 scanning logs are traceable (who scanned, when, where)

7) Operational Readiness Gates
7.1 Monitoring / Observability

 Critical errors are logged

 API failures visible in logs

 Debug info removed from production UI

7.2 Data Backup / Recovery

 Ability to recover/restore if invoice/manifest corruption happens

 Admin can diagnose issues (system module or logs)

8) UX & Enterprise Experience Gates

 UI looks professional and consistent across pages

 All actions have feedback (toast/alert)

 Forms prevent invalid operations

 Buttons and actions clearly named (logistics terminology)

 No confusing navigation loops

9) Codebase Quality Gate (No New Tech Debt)

 No obvious hacks in critical workflows

 No repeated logic across modules (use shared patterns)

 API layer consistent across pages

 No unused/abandoned feature flags

 Sensitive logic not only client-side

10) Release Notes (Mandatory)

Before GO:

 Release notes written

 Known issues listed (P3/P4 only)

 Rollback strategy written (if needed)

 Owner assigned for post-release monitoring

✅ Final Approval Section (Sign-off)
Role	Name	Approval
QA Lead		✅/❌
Tech Lead		✅/❌
Product Owner		✅/❌
Ops/Support		✅/❌

✅ TAC Cargo — Logistics Data Model Validation Checklist (Supabase)

Enterprise DB Schema Validation Standard

1) Purpose

Validate that Supabase database schema supports:

Logistics shipment lifecycle

Manifest operations

Scanning traceability

Inventory reconciliation

Exception handling

Invoice correctness

Audit and enterprise compliance

2) Global Database Rules (Must Apply to All Tables)
2.1 Standard Columns (Enterprise Minimum)

Every operational table MUST have:

 id (UUID preferred)

 created_at (timestamp)

 updated_at (timestamp)

 created_by / user_id (uuid reference)

 org_id / company_id (uuid reference) (required if multi-tenant)

 is_active or deleted_at (soft delete preferred)

✅ Why: enterprise systems require traceability and safe deletes.

2.2 Naming Standards

 snake_case table names

 snake_case column names

 no mixed naming (shipmentId should NOT exist in DB layer)

2.3 Data Integrity Requirements

 FK constraints exist (where applicable)

 Unique constraints exist for:

tracking IDs

invoice numbers

manifest numbers

 Indexes exist on frequently searched fields:

tracking_id

invoice_number

customer_id

manifest_id

status

created_at

2.4 RLS (Row Level Security) Standards

For each table:

 RLS enabled

 select policy exists

 insert policy exists

 update policy exists

 delete policy exists

 policies prevent cross-tenant reads/writes

3) Core Tables Checklist (Minimum Enterprise DB)

These are the core “must exist” tables for a logistics platform.

A) USERS / ORG TABLES
A1) profiles

Purpose: user profile details linked to Supabase Auth users.

Expected fields:

 id (uuid, same as auth.users.id)

 full_name

 email

 phone

 role (admin/staff/operator/manager)

 org_id

 created_at, updated_at

Validation:

 id matches authenticated user

 role used in UI permission checks

 RLS prevents users from reading others

A2) organizations / companies

Purpose: logistics company or branch structure.

Expected:

 id

 name

 code (unique)

 address

 contact_email

 created_at, updated_at

Validation:

 org/branch concept is real and used

B) CUSTOMER TABLES
B1) customers

Purpose: customer master list.

Expected fields:

 id

 org_id

 customer_code (unique per org)

 name

 phone

 email

 address

 city

 state

 pincode

 gst_number (optional)

 is_active / deleted_at

 audit fields

Validation:

 No duplicate customers by phone (or customer_code)

 Linked to shipments and invoices

C) SHIPMENT TABLES
C1) shipments (MOST CRITICAL)

Purpose: core shipment record.

Expected fields:

 id

 org_id

 tracking_id (unique)

 shipment_number (optional unique)

 customer_id (FK customers.id)

 origin_branch_id (FK branches)

 destination

 destination_city

 destination_state

 destination_pincode

 receiver_name

 receiver_phone

 weight

 pieces_count

 shipment_value

 status (enum-like)

 remarks

 audit fields

Status values should support:

 CREATED

 RECEIVED

 MANIFESTED

 DISPATCHED

 IN_TRANSIT

 ARRIVED

 OUT_FOR_DELIVERY

 DELIVERED

 RETURNED

 CANCELLED

Validation:

 status transitions controlled

 cannot jump to DELIVERED without route events

 tracking_id query indexed

C2) shipment_events / tracking_events

Purpose: tracking timeline.

Expected fields:

 id

 org_id

 shipment_id (FK shipments.id)

 event_type

 event_time

 location

 remarks

 created_by

 audit fields

Validation:

 Every status update generates an event

 UI tracking timeline comes from this table

D) MANIFEST TABLES
D1) manifests

Purpose: manifest header record.

Expected fields:

 id

 org_id

 manifest_number (unique)

 origin_branch_id

 destination_branch_id

 status (DRAFT / FINALIZED / DISPATCHED / RECEIVED)

 total_packages (calculated)

 total_weight (optional)

 finalized_at

 finalized_by

 audit fields

Validation:

 finalize locks changes

 total_packages matches manifest_items count

 manifest_number indexed

D2) manifest_items

Purpose: link shipments/packages to manifest.

Expected fields:

 id

 org_id

 manifest_id (FK manifests.id)

 shipment_id (FK shipments.id)

 added_by

 added_at

 audit fields

Validation:

 unique constraint: (manifest_id + shipment_id)

 shipment cannot be in two active manifests (unless allowed)

 adding shipment updates shipment status → MANIFESTED

E) SCANNING TABLES
E1) scan_logs

Purpose: enterprise traceability (barcode scanning audit).

Expected fields:

 id

 org_id

 scan_code (barcode/tracking ID)

 shipment_id (nullable until resolved)

 manifest_id (optional)

 scan_type (INBOUND / OUTBOUND / ARRIVAL / DELIVERY)

 scan_time

 scan_location

 device_id (optional)

 scanned_by (FK profiles.id)

 audit fields

Validation:

 scanning always creates scan log

 scan duplicates handled safely

 scan logs queryable for audit investigations

F) INVENTORY TABLES (Optional depending on PRD)

If PRD expects inventory module, these must exist.

F1) inventory_items

Purpose: stock master.

Expected:

 id

 org_id

 sku (unique)

 name

 category

 unit

 audit fields

F2) inventory_transactions

Purpose: stock ledger.

Expected:

 id

 org_id

 inventory_item_id

 transaction_type (IN/OUT/ADJUSTMENT)

 quantity

 reference_type (SHIPMENT/MANIFEST/etc.)

 reference_id

 created_by

 audit fields

Validation:

 No direct stock edits without ledger entry

 Always traceable

G) EXCEPTIONS TABLES
G1) exceptions

Purpose: logistics issue tracking.

Expected fields:

 id

 org_id

 shipment_id (FK)

 type (DAMAGED / LOST / ADDRESS_ISSUE / DELAY / PAYMENT / OTHER)

 severity (LOW/MEDIUM/HIGH)

 status (OPEN / IN_PROGRESS / RESOLVED / CLOSED)

 assigned_to

 resolution_notes

 resolved_at

 audit fields

Validation:

 Exception affects shipment state logically (if PRD requires)

 SLA fields optional but recommended

H) INVOICE TABLES
H1) invoices

Purpose: billing records.

Expected fields:

 id

 org_id

 invoice_number (unique)

 customer_id (FK)

 shipment_id (optional FK) OR multiple shipments supported

 subtotal

 tax

 discount

 total

 status (DRAFT / ISSUED / PAID / CANCELLED)

 issued_at

 audit fields

Validation:

 totals computed consistently

 invoice_number indexed

 no negative totals possible

H2) invoice_items

Purpose: line items.

Expected fields:

 id

 org_id

 invoice_id (FK)

 description

 qty

 unit_price

 line_total

Validation:

 invoice total = sum(invoice_items) + tax - discount

 no mismatch allowed

I) AUDIT / LOGGING (Recommended for Enterprise)
I1) audit_logs

Purpose: record critical admin actions.

Expected:

 id

 org_id

 actor_user_id

 action_type

 target_type

 target_id

 metadata (jsonb)

 created_at

Validation:

 high-risk actions always logged:

shipment delete

manifest finalize

invoice cancel

permission changes

4) Data Model Certification Score
4.1 Score Sheet

Rate each area 0–10:

Shipment model completeness: __/10

Manifest correctness: __/10

Scanning traceability: __/10

Invoice correctness: __/10

Exceptions support: __/10

RLS security: __/10

Audit readiness: __/10

Final Data Model Score: __/10

✅ TAC Cargo — Supabase RLS Policy Audit Checklist

Enterprise Security & Multi-tenant Isolation Standard

1) Objective

Ensure Supabase Row Level Security (RLS) policies:

prevent unauthorized access

enforce tenant isolation (org_id)

restrict CRUD operations correctly

protect sensitive logistics + customer + invoice data

support production-grade compliance

2) RLS Gate (Zero Tolerance)

If any of these conditions fail → automatic NO-GO for Production.

Mandatory Security Gates

 RLS enabled on all sensitive tables

 No table uses USING (true) for authenticated users on sensitive data

 No unauthenticated access to operational tables

 Policies include tenant filtering (org_id)

 “Staff vs Admin” restrictions enforced where needed

 User cannot access other org data (cross-tenant leak check)

3) Required Tables That MUST Have RLS Enabled

RLS must be enabled for ALL:

Tier 1 (Absolute Critical)

 shipments

 shipment_events / tracking_events

 manifests

 manifest_items

 scan_logs

 customers

 invoices

 invoice_items

 exceptions

Tier 2 (Also recommended critical)

 profiles

 organizations

 audit_logs

 inventory tables (if used)

4) Policy Coverage Checklist (Per Table)

Each table must have ALL 4 policy types:

Table	SELECT	INSERT	UPDATE	DELETE
shipments	☐	☐	☐	☐
customers	☐	☐	☐	☐
manifests	☐	☐	☐	☐
manifest_items	☐	☐	☐	☐
scan_logs	☐	☐	☐	☐
invoices	☐	☐	☐	☐
invoice_items	☐	☐	☐	☐
exceptions	☐	☐	☐	☐
shipment_events	☐	☐	☐	☐
audit_logs	☐	☐	☐	☐

✅ Required: no sensitive table should be missing any policy type.

5) Tenant Isolation Standard (org_id)
5.1 Golden Rule

Every operational table must include:

 org_id column (uuid)

 policies enforce org_id match

5.2 Required Enforcement Logic (Conceptual)

RLS must ensure:

record.org_id == user.org_id

user.org_id derived from profiles table

never trust client-provided org_id without checks

6) RLS Audit Checks: What To Look For
6.1 Dangerous Patterns (Critical Fail)

If found anywhere → P0 Security Issue

 USING (true) on Tier 1 tables

 Policies allowing anon access

 Policies without org_id constraint

 Policies only checking auth.uid() but not tenant

 Policies that allow UPDATE/DELETE to any authenticated user

6.2 Cross-Tenant Leak Test (Mandatory)

Perform these tests:

Test 1 — Data visibility

Login with Org A user

Try viewing shipments belonging to Org B

Expected: ✅ blocked / empty

Fail: ❌ data visible

Test 2 — ID guessing

Try opening shipment detail by ID you don’t own

Expected: ✅ blocked

Fail: ❌ detail loads

Test 3 — Write abuse

Try inserting data with forged org_id

Expected: ✅ blocked or overwritten by server

Fail: ❌ insert succeeds

7) Table-by-Table RLS Expectations (Enterprise)

These are policy intent standards (not code) — used for audit.

7.1 profiles

Risk: high (exposes identity info)

Policy expectations:

SELECT: user can read own profile

UPDATE: user can update own fields (not role/org_id)

Admin can read org profiles

Admin can change roles

Audit checklist:

 users can’t modify role

 users can’t modify org_id

7.2 shipments

Policy expectations:

staff can read org shipments

staff can create shipments in org

updates restricted by role

deletes normally admin-only (soft delete recommended)

Checklist:

 staff cannot delete shipments

 create must auto-assign org_id (trusted backend)

 update does not allow editing tracking_id after created (recommended)

7.3 manifests + manifest_items

Policy expectations:

staff can create + edit in DRAFT only

once FINALIZED, only specific actions allowed

prevent adding shipments across org boundaries

Checklist:

 cannot add shipment from another org

 cannot edit finalized manifests

7.4 scan_logs

Policy expectations:

insert allowed only for authenticated org users

no delete for staff (audit integrity)

scanning logs immutable (recommended)

Checklist:

 staff cannot delete scan logs

 scan logs always belong to org

7.5 customers

Policy expectations:

staff read org customers

staff create/edit

delete: admin only OR soft delete

Checklist:

 customer phone/email not exposed across orgs

 no public/anon access

7.6 invoices + invoice_items

Policy expectations:

staff can create invoice for org customers

invoices immutable after ISSUED or PAID

cancel requires admin role

Checklist:

 invoice totals can’t be manipulated to negative

 invoice_number unique per org

 staff cannot delete paid invoice

7.7 exceptions

Policy expectations:

staff can create exception

only assigned staff/admin can update

resolution logged and traceable

Checklist:

 exception is linked to shipment_id

 status updates audited

7.8 shipment_events

Policy expectations:

events generated by system actions

immutable record of timeline

staff can select but not delete

Checklist:

 staff cannot delete events

 event_time consistent

7.9 audit_logs

Policy expectations:

insert by system only

immutable logs

select only admin/managers

Checklist:

 staff cannot delete audit logs

 logs are not editable

8) Common Supabase RLS Mistakes (Checklist)

Mark if found:

 Policies assume frontend ensures security (❌ wrong)

 org_id missing in some tables

 org_id stored in client storage and trusted blindly

 Using only auth.uid() without tenant mapping

 “Admin-only pages” enforced only in UI, not DB

 Missing policies for UPDATE/DELETE

 No policy tests performed

9) Final RLS Security Verdict
9.1 Verdict

✅ Secure for Production

⚠️ Needs Improvement (OK for staging)

❌ Unsafe (No-Go)

9.2 RLS Risk Score (0–10)

Tenant isolation: __/10

CRUD restrictions: __/10

Audit immutability: __/10

Cross-tenant leak prevention: __/10

Final Security Score: __/10

✅ TAC Cargo Portal — Production Readiness Scorecard

Enterprise Logistics Release Evaluation

1) Overall Production Readiness Verdict

Choose one:

✅ Production Ready (GO)

⚠️ Staging Ready Only (GO with Risk)

❌ Not Deployable (NO-GO)

Verdict Justification (2–4 lines):

…

2) Readiness Score Summary (A–D Grade)
2.1 Score Interpretation
Score	Grade	Meaning
90–100	A	Enterprise-ready, safe to deploy
75–89	B	Deployable with monitoring + minor fixes
60–74	C	Not recommended for production
<60	D	Unstable / high risk

✅ Final Score: ___ / 100 → Grade: ___

3) Production Readiness Breakdown (Weighted)

Each section is scored and weighted to reflect logistics business reality.

Category	Weight	Score	Weighted Score	Notes
PRD Compliance	15	__/10	__/15	
Functional QA (Pages)	20	__/10	__/20	
E2E Workflows (Logistics)	20	__/10	__/20	
API Reliability	10	__/10	__/10	
DB Integrity (Supabase)	10	__/10	__/10	
Security / RLS	15	__/10	__/15	
UX Enterprise Quality	5	__/10	__/5	
Performance / Stability	5	__/10	__/5	
TOTAL	100		__/100	
4) Hard Release Gates (Must Be True)

If ANY item fails → ❌ NO-GO, regardless of score.

4.1 Security Gate

 RLS enabled for all sensitive tables

 No cross-tenant reads possible

 No insert/update bypass possible

 No unauthorized access via guessed IDs

4.2 Business Integrity Gate

 Shipment status lifecycle works correctly

 Tracking timeline accurate

 Manifest totals correct + locks properly after finalize

 Scanning updates state correctly + logs traceable

 Invoice totals correct (no mismatch)

4.3 Stability Gate

 No P0 issues open

 No P1 issues open

 App does not crash on any dashboard route

5) Severity Health Summary
Severity	Count	Allowed for Production?	Status
P0 Blocker		❌ No	✅/❌
P1 Critical		❌ No	✅/❌
P2 Major		⚠️ Limited	✅/❌
P3 Minor		✅ Yes	✅/❌
P4 Enhancements		✅ Yes	✅/❌
6) Module Stability Snapshot (PASS/FAIL)
Module	PASS/FAIL	Major Notes
Overview	✅/❌	
Dashboard	✅/❌	
Analytics	✅/❌	
Operations	✅/❌	
Shipments	✅/❌	
Tracking	✅/❌	
Manifests	✅/❌	
Scanning	✅/❌	
Inventory	✅/❌	
Exceptions	✅/❌	
Business	✅/❌	
Invoices	✅/❌	
Customers	✅/❌	
Management	✅/❌	
System	✅/❌	
Settings	✅/❌	
7) Workflow Readiness Snapshot (Most Important)
Workflow	PASS/FAIL	Notes
Shipment → Tracking	✅/❌	
Shipment → Manifest	✅/❌	
Manifest → Scanning	✅/❌	
Exception lifecycle	✅/❌	
Invoice lifecycle	✅/❌	
8) Key Risks (If Deploying)

List the most dangerous risks that could cause business problems:

Risk: …
Impact: …
Likelihood: High/Medium/Low
Mitigation: …

Risk: …
Impact: …
Likelihood: High/Medium/Low
Mitigation: …

9) Fix Roadmap (Deployment-focused)
Fix NOW (Before Production)

…

…

Fix NEXT Sprint (Stabilization)

…

…

Later Improvements (Enhancement)

…

…

10) Final Recommendation Statement (Stakeholder Friendly)

Write a final decision in plain business language:

“Based on PRD compliance, workflow tests, API & database validation, and security/RLS audit, TAC Cargo Portal is currently (GO/NO-GO) for production release. The primary blockers are: ____. Once resolved, the projected readiness will improve to Grade __.”

✅ TAC Cargo — Realistic Logistics Test Data Setup Checklist

Enterprise QA Data Standard

1) Why This Matters

Most logistics dashboards “look fine” until real workflows are tested with realistic data like:

multiple customers with different destinations

multi-piece shipments

mixed weights, prices

shipments grouped in manifests

scanning logs

exceptions

invoices with multiple line items

This checklist ensures:
✅ reproducible QA
✅ predictable verification
✅ faster bug detection
✅ clean audit trail testing

2) Test Data Naming Standard (Avoid Confusion)

Use consistent prefixes so QA data is easy to identify and delete later:

Customer name prefix: QA-

Shipment receiver prefix: QA-

Invoice prefix: QA-INV-

Manifest prefix: QA-MNF-

✅ Example:

Customer: QA-Customer-01

Receiver: QA-Receiver-01

Manifest: QA-MNF-20260120-01

Invoice: QA-INV-20260120-01

3) Master Test Dataset (Minimum Required)
A) Customers Dataset (Create at least 5)

Create these customers:

Customer Code	Customer Name	Location	Type
QA-C001	QA-Customer-01	Imphal	Regular
QA-C002	QA-Customer-02	Guwahati	Frequent
QA-C003	QA-Customer-03	Kolkata	High-value
QA-C004	QA-Customer-04	Delhi	Remote
QA-C005	QA-Customer-05	Mumbai	Bulk

Validation:

 Phone/email unique

 Address complete

 Customer code unique per org

B) Shipment Dataset (Create at least 15)

Create shipments distributed by complexity:

Shipment Mix Rules

 5 single-piece shipments

 5 multi-piece shipments (2–5 pieces)

 3 heavy shipments (20kg+)

 2 high-value shipments (value 50,000+)

Shipment statuses to cover

Make sure you have shipments across statuses:

 CREATED

 MANIFESTED

 DISPATCHED

 IN_TRANSIT

 ARRIVED

 DELIVERED

 EXCEPTION

C) Manifest Dataset (Create at least 3)
Manifest	Purpose	Shipments
QA-MNF-01	Standard dispatch	5 shipments
QA-MNF-02	Mixed weights	5 shipments
QA-MNF-03	High value	3 shipments

Rules:

 at least one manifest must be finalized

 totals must match shipments count

 once finalized, edits must be restricted

D) Scanning Dataset (Log at least 20 scans)

Scan set includes:

 10 valid scans

 5 duplicate scans

 5 invalid/unknown barcode scans

Rules:

valid scans should update shipment state

duplicate scans should not corrupt state

invalid scans should show error + log

E) Exceptions Dataset (Create at least 4)
Exception Type	Link Shipment	Status
DAMAGED	Shipment A	OPEN
DELAY	Shipment B	IN_PROGRESS
LOST	Shipment C	OPEN
ADDRESS_ISSUE	Shipment D	RESOLVED

Rules:

 exceptions must be linked to shipments

 resolving should update shipment workflow correctly

F) Invoice Dataset (Create at least 5)

Invoice distribution:

 2 invoices for single shipment

 2 invoices for multiple shipments (if supported)

 1 invoice with discount

 tax applied in at least 3 invoices

Rules:

invoice_number must be unique

totals must match invoice_items sum

linked to correct customer

4) Recommended Field Values (Realistic)

To detect bugs, use realistic patterns:

Destination patterns

Use a mix of:

nearby cities

far cities

different pin codes

mixed states

Weight patterns

0.5 kg

2 kg

7.5 kg

21 kg

50 kg

Shipment value patterns

500

2500

7500

55000

120000

5) Validation Checklist (After Data Setup)
A) UI Validation

 Shipments list shows all created shipments

 Filter by customer works

 Filter by status works

 Search by tracking ID works

 Manifests show totals accurately

 Tracking timeline reflects scan events

B) API Validation

 API calls succeeded (no 400/500 errors)

 payload includes required fields

 responses map correctly to UI state

C) DB Validation (Supabase MCP)

For each dataset created:

 row exists

 org_id correct

 created_by correct

 relations correct (FK integrity)

6) Test Data Cleanup Strategy (Optional but Recommended)
Cleanup Option A — Soft delete only

Best for audit testing:

 mark is_active=false

 store deleted_at

Cleanup Option B — Hard delete QA-only records

Only safe if:

system has no dependencies or audit requirements

Use rule:

delete only records starting with QA-

7) Success Criteria for QA Data Setup

Test data setup is complete when:

 5 customers created

 15 shipments created with mixed complexity

 3 manifests created and at least 1 finalized

 20 scan logs created with valid/duplicate/invalid cases

 4 exceptions created and lifecycle tested

 5 invoices created with totals verified

 ✅ TAC Cargo Portal — Full E2E Test Script (Enterprise QA)

Scope: UI + Workflow + API + Supabase DB Validation
Rule: Do NOT write code. Only perform testing + report findings.

0) Test Session Setup
0.1 Pre-requisites

 PRD reviewed: TAC-Cargo-Enhancement-PRD.md

 Tasks reviewed: TAC-Cargo-Enhancement-tasks.md

 Supabase MCP connected

 Browser DevTools open: Network + Console

0.2 Login Credentials

Email: tapancargo@gmail.com

Password: Test@1498

1) Smoke Test — Core System Availability
Test 1.1 — App Load

Steps

Open dashboard URL

Observe initial render

Expected

App loads without white screen

No fatal console errors

UI layout stable

Validation

 PASS / [ ] FAIL
Notes: …

Test 1.2 — Login Flow

Steps

Navigate to login page

Enter credentials

Click login

Expected

Successful authentication

Redirect to Overview/Dashboard

Session established

Validation

 PASS / [ ] FAIL
Evidence: …

Test 1.3 — Navigation Baseline

Steps

Click each sidebar route once

Confirm route changes

Confirm active menu highlight

Expected

No crash on any page

Correct page titles

Validation

 PASS / [ ] FAIL
Issues: …

2) E2E Workflow A — Shipment Lifecycle + Tracking

Goal: Validate core logistics behavior end-to-end.

Test 2.1 — Create Customer (Required dependency)

Steps

Go to Customers

Click Create Customer

Create customer:

Name: QA-Customer-01

Phone: unique

City/state/pincode: valid

Expected

Customer record created

Customer appears in list

Form resets or closes properly

API Validation

Network shows request succeeded (200/201)

Payload includes expected customer fields

DB Validation (Supabase MCP)

Record exists in customers

correct org_id

correct created_at

Result

 PASS / [ ] FAIL
Notes: …

Test 2.2 — Create Shipment

Steps

Go to Shipments

Click Create Shipment

Fill required fields:

Customer: QA-Customer-01

Receiver: QA-Receiver-01

Destination: valid city/state/pincode

Weight: 2kg

Pieces: 2

Shipment value: 2500

Expected

Shipment created successfully

Unique tracking ID generated

Shipment appears in list immediately

Status defaults to CREATED (or PRD expected)

API Validation

shipment insert endpoint succeeds

response contains shipment ID + tracking_id

DB Validation

record in shipments

tracking_id unique

created_by correct

Result

 PASS / [ ] FAIL

Test 2.3 — Shipment Search + Filter + Sort

Steps

Search by tracking ID

Filter by status = CREATED

Sort by created_at descending

Expected

Results correct

No stale list or wrong display

No infinite loader

Result

 PASS / [ ] FAIL

Test 2.4 — Shipment Update

Steps

Open shipment detail

Update receiver phone or destination

Save changes

Expected

Updates saved

UI reflects updated value

API Validation

update endpoint returns success

no validation errors

DB Validation

shipment row updated

updated_at changed

Result

 PASS / [ ] FAIL

Test 2.5 — Tracking Timeline Verification

Steps

Go to Tracking

Search tracking ID created earlier

Expected

Shipment timeline visible

Shows at least CREATED event

No “not found” error for valid ID

DB Validation

record exists in shipment_events/tracking_events (if used)

Result

 PASS / [ ] FAIL

3) E2E Workflow B — Shipment → Manifest → Finalize

Goal: validate enterprise manifest operations.

Test 3.1 — Create Manifest (Draft)

Steps

Go to Manifests

Click Create Manifest

Fill:

Manifest name/number: QA-MNF-01

Origin branch

Destination branch

Expected

Manifest created in DRAFT status

DB Validation

row exists in manifests

status = DRAFT

Result

 PASS / [ ] FAIL

Test 3.2 — Add Shipments to Manifest

Steps

Open manifest detail

Click add shipments

Add 3 shipments including the one created earlier

Expected

Manifest shows added shipments list

Total packages count matches items

No duplicate entry allowed

DB Validation

rows exist in manifest_items

unique constraint works

Result

 PASS / [ ] FAIL

Test 3.3 — Finalize Manifest

Steps

Click Finalize Manifest

Confirm action

Expected

status changes to FINALIZED (or DISPATCHED per PRD)

cannot add/remove items after finalize

shipments status updated (MANIFESTED/DISPATCHED)

API Validation

finalize request succeeds

server response updates manifest state

DB Validation

manifests.status updated

finalized_at, finalized_by populated

shipments.status updated

Result

 PASS / [ ] FAIL
Severity if fail: P0/P1 (Manifest integrity is critical)

4) E2E Workflow C — Scanning Operations

Goal: validate scan reliability + audit trail.

Test 4.1 — Scan Valid Shipment

Steps

Go to Scanning

Scan / enter tracking_id of manifested shipment

Confirm scan action

Expected

UI confirms successful scan

Shipment status updated accordingly (e.g., IN_TRANSIT)

Tracking timeline updated

Scan log created

DB Validation

row created in scan_logs

scan linked to shipment_id

scan_time correct

Result

 PASS / [ ] FAIL

Test 4.2 — Duplicate Scan Handling

Steps

Scan the same tracking_id again immediately

Expected

System prevents duplicate state corruption

Either:

warning toast: already scanned

or logs duplicate without changing shipment state

DB Validation

No invalid duplicate shipment event

If duplicate scan logged, it is marked safely

Result

 PASS / [ ] FAIL
Severity if fail: P1 (state corruption risk)

Test 4.3 — Invalid Barcode Handling

Steps

Enter random barcode: QA-INVALID-000

Attempt scan

Expected

clear error message

no crash

no incorrect DB insertion into shipments

Result

 PASS / [ ] FAIL

5) E2E Workflow D — Exceptions Lifecycle

Goal: validate operational issue handling.

Test 5.1 — Create Exception for Shipment

Steps

Go to Exceptions

Create exception:

shipment: select manifested shipment

type: DELAY

severity: HIGH

notes: “QA test delay”

Expected

Exception created and visible

Shipment state affected properly (if PRD expects)

DB Validation

row created in exceptions

shipment_id linked correctly

Result

 PASS / [ ] FAIL

Test 5.2 — Resolve Exception

Steps

Open exception

Set status RESOLVED

Add resolution notes

Expected

status updates

workflow continues safely

tracking timeline reflects exception/resolution (if PRD expects)

DB Validation

exceptions updated_at updated

resolved_at set

Result

 PASS / [ ] FAIL

6) E2E Workflow E — Invoice Lifecycle

Goal: validate billing accuracy (enterprise critical).

Test 6.1 — Create Invoice

Steps

Go to Invoices

Create invoice for QA-Customer-01

Add items OR link shipment

Include:

subtotal

tax

discount (optional)

Save invoice

Expected

invoice created

invoice_number generated

totals correct

DB Validation

row in invoices

invoice_items rows exist

totals match sum(items) + tax - discount

Result

 PASS / [ ] FAIL
Severity if fail: P0 (billing correctness)

Test 6.2 — Invoice PDF (If Required)

Steps

Open invoice detail

Click “Generate PDF” / “Download PDF”

Expected

PDF generated successfully

correct customer, totals, invoice number

Result

 PASS / [ ] FAIL

7) Module Sanity (Remaining Pages)

These pages must be validated even if not part of E2E workflows:

7.1 Inventory

list loads

stock adjustments safe

negative stock prevented

7.2 Business

reports load

metrics consistent with invoices/shipments

7.3 Analytics

charts load

date range filters correct

7.4 Management

roles/permissions enforced

audit logs available (if required)

7.5 System + Settings

profile updates ok

theme toggle ok

password reset ok (if available)

8) Final Results Summary
8.1 Workflow Pass/Fail
Workflow	Result	Severity if Fail
Shipment lifecycle	✅/❌	P0/P1
Manifest lifecycle	✅/❌	P0/P1
Scanning	✅/❌	P1
Exceptions	✅/❌	P2
Invoices	✅/❌	P0
9) Final Issue Register Output (Mandatory)

For every issue found:

Issue ID

Severity

Module/Page

Summary

Steps

Expected vs Actual

Evidence

Recommendation

✅ TAC Cargo — QA Automation Readiness Plan

Enterprise Logistics Platform Quality Strategy

1) Objective

Build a scalable QA strategy for TAC Cargo Portal that supports:

fast regression testing

stable releases

prevention of production incidents

enterprise-grade confidence in shipments/manifests/scanning/invoices

This plan defines:

what to automate first

what must remain manual

readiness requirements (data, IDs, selectors, environment)

release pipeline “quality gates”

2) Key Principle: Automate by Business Risk

In logistics systems, automate based on impact, not convenience.

Automation Priority Order (Highest Risk First)

Invoices / billing correctness (P0 risk)

Manifest integrity (P0/P1 risk)

Scanning workflow (P1 risk)

Shipments lifecycle + tracking (P0/P1 risk)

Exceptions handling (P2 risk)

Customers (P2 risk)

Settings/System/Theme/UX polish (P3/P4 risk)

3) Recommended Automation Layers (Best Practice)

Automation should be done across 3 levels:

Layer A — Unit Tests (Fastest)

Scope:

utility functions

calculations (tax/total)

status transition rules

input validation

✅ Goal: catch logic errors early
⛔ Not sufficient alone

Layer B — Integration Tests (API + DB)

Scope:

Supabase queries/inserts

API endpoints behavior

RLS enforcement

DB constraints & FK integrity

✅ Goal: validate backend correctness
✅ Best ROI for Supabase-based apps

Layer C — E2E UI Tests (Playwright/Cypress)

Scope:

full workflow simulation in browser

page navigation checks

form behavior and UI regressions

✅ Goal: guarantee the system works like a real operator uses it
⚠️ Slower and more brittle, must be carefully designed

4) Automation Readiness Requirements (Must Fix First)

Before automation can be reliable, these conditions must exist.

4.1 Stable Selectors (Critical)

Every important UI component must have stable selectors:

data-testid="shipments-create-btn"

data-testid="manifest-finalize-btn"

data-testid="scan-input"

Without this:

tests become flaky

automation breaks every UI change

✅ Requirement: Add data-testid on all core workflow buttons & form fields.

4.2 Test Environment Strategy

You must have a safe environment for automation:

Staging project in Supabase (recommended)

Dedicated automation test user

Test dataset that can be reset safely

✅ Requirement:

staging database OR QA schema

“QA-only cleanup job” (manual or scripted)

4.3 Deterministic Test Data

E2E automation requires predictable data behavior.

Must-have:

predictable prefixes: QA-...

unique constraints handling

ability to reset dataset

ability to create & delete test entities safely

✅ Requirement:

test fixture scripts OR clean “Setup Test Data” flow

4.4 Time & Async Stability

UI tests fail if the app doesn’t handle async properly.

Required UI behaviors:

consistent loading states

disabling submit buttons during mutation

success/failure toast

retry on transient errors

✅ Requirement:

prevent double-submits

consistent API error rendering

5) What to Automate First (Top 10 Test Cases)

These will give the highest ROI and prevent production disasters.

🔥 Tier 1 (Must Automate)

Login → Dashboard navigation smoke

Create shipment (minimum fields)

Create manifest (draft)

Add shipments to manifest

Finalize manifest → verify lock

Scanning: scan valid tracking id

Scanning: duplicate scan does not corrupt

Tracking: timeline updated

Invoice: create invoice & totals correct

RLS: cannot access cross-tenant shipment data (if multi-tenant)

6) What Should Stay Manual (Human QA)

Some tests should remain manual because they require judgement:

UI/UX polish evaluation

dashboard visual design review

data readability & field labeling

usability of scanning flow

performance perception under large data

operational clarity for staff

✅ These tests belong in a “Manual UX Audit Checklist”.

7) Automation Roadmap (Phased Rollout)
Phase 1 — Foundation (Week 1–2)

Deliverables:

data-testid coverage

stable staging environment

QA test account(s)

baseline smoke tests automated (5–10 tests)

Outcome:
✅ stable CI signal: “system is alive”

Phase 2 — Core Workflows (Week 3–5)

Deliverables:

shipments workflow automated

manifests workflow automated

scanning workflow automated

invoice totals automated

Outcome:
✅ regressions caught before merging/deploying

Phase 3 — Hardening + Security (Week 6+)

Deliverables:

RLS attack tests (ID guessing, cross-org access)

exception workflow tests

performance regression thresholds

Outcome:
✅ enterprise-grade confidence

8) CI/CD Quality Gates (Release Engineering)

Integrate into pipeline:

Gate 1 — PR Checks (Fast)

lint/typecheck

unit tests

Gate 2 — Merge to Main

integration tests

schema checks

RLS tests

Gate 3 — Deployment to Staging

E2E workflow tests

Gate 4 — Production Release

must pass all Tier 1 E2E workflows

0 P0, 0 P1 issues

9) Flaky Test Prevention Rules

To keep tests stable:

never rely on UI text selectors

never depend on current date/time without control

avoid random data

avoid testing animations

use explicit wait for network (not sleep)

isolate each test (create its own data)

10) Final Automation Readiness Scorecard

Score each (0–10):

Stable selectors: __/10

Staging environment maturity: __/10

Test data reliability: __/10

API determinism: __/10

UI loading/error states: __/10

RLS testability: __/10

✅ Final Automation Readiness: __/60

45+ = Ready to automate core workflows

30–44 = Partial automation only

<30 = Too early; fix foundations first

✅ TAC Cargo Portal — QA Operating Procedure (SOP)

Enterprise Logistics Software Quality Standard

1) Purpose

This SOP defines the official QA process for TAC Cargo Portal to ensure the platform is:

stable under operational use

compliant with PRD requirements

secure (Supabase RLS enforced)

accurate (tracking, manifest, invoices)

production-ready at enterprise logistics level

2) Scope

This SOP applies to:

all dashboard pages/modules

all workflows: shipments → manifests → scanning → tracking → invoices

all database operations via Supabase

security and permissions validation

release readiness evaluation

3) Key Roles & Responsibilities
3.1 Product Owner (PO)

Responsible for:

PRD quality and clarity

acceptance criteria definition

approving final production release

Deliverables:

signed PRD

feature priority list

go/no-go approval

3.2 QA Lead

Responsible for:

QA planning and execution design

test scripts and QA templates

severity assignment discipline

final QA sign-off report

Deliverables:

QA report

issue register

release gate report

readiness scorecard

3.3 QA Engineer / Tester

Responsible for:

executing E2E test scripts

verifying all pages/modules

collecting evidence (screenshots/logs)

reporting defects consistently

Deliverables:

module PASS/FAIL checklist

issue reproduction steps

evidence attachments

3.4 Tech Lead

Responsible for:

architecture and code quality

ensuring best practices and security

confirming fixes + regression tests

Deliverables:

fix plan

risk assessment

code review compliance

3.5 Developer(s)

Responsible for:

fixing issues (P0–P2 priority)

updating documentation when needed

adding testability improvements (selectors)

Deliverables:

PRs with fixes

changelog updates

regression-ready builds

4) QA Testing Cadence (When QA Happens)
4.1 Standard Sprint QA Cycle
Sprint Stage	QA Activity
Start of sprint	PRD/task verification + test planning
Mid sprint	smoke tests + module checks on new features
End sprint	full regression + workflow validation
Release candidate	final release gate execution
4.2 Minimum QA Required Before Any Release

No release can happen without:

smoke test PASS

core workflows PASS

API/DB verification for key modules

RLS audit (for security)

5) QA Execution Workflow (Step-by-Step)
Step 1 — Documentation Alignment

QA must review:

TAC-Cargo-Enhancement-PRD.md

TAC-Cargo-Enhancement-tasks.md

Outcome:

PRD compliance matrix created

acceptance criteria checklist created

Step 2 — Smoke Testing

Run smoke test:

app loads

login works

navigation stable

no crash

no console errors

Outcome:

smoke PASS/FAIL recorded

Step 3 — Module-by-Module QA

Test all modules:

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

Outcome:

PASS/FAIL per page

issue evidence recorded

Step 4 — Workflow E2E Testing

Run critical enterprise workflows:

Shipment lifecycle

Manifest lifecycle

Scanning workflow

Exceptions lifecycle

Invoice lifecycle

Outcome:

workflow PASS/FAIL with business impact notes

Step 5 — API + Database Verification

For each key workflow:

validate API calls in Network tab

validate DB writes in Supabase MCP

validate integrity of relations + constraints

Outcome:

API audit summary

DB audit summary

Step 6 — Security Review (RLS)

QA lead must verify:

RLS enabled on sensitive tables

policies enforce org isolation

no cross-tenant leakage

Outcome:

RLS audit report

Step 7 — Final QA Report + Release Gate Decision

Prepare final report:

readiness score

issue register

release recommendation

Outcome:

GO / NO-GO decision with rationale

6) Severity Rules (Enforced Standards)

QA must assign severity using TAC rubric:

P0 Blocker → immediate no-go

P1 Critical → no-go

P2 Major → limited tolerance

P3 Minor → acceptable

P4 Enhancement → backlog

✅ Severity is based on business impact, not fix effort.

7) Issue Logging Standard (Mandatory Format)

Every issue must include:

Issue ID

Severity

Module/Page

Summary

Steps to reproduce

Expected vs actual

Evidence (screenshots, logs, API response)

Suspected cause (optional)

Recommendation

No issue is valid without clear reproduction steps.

8) Defect Triage Process (Enterprise)
8.1 Triage Meeting (Daily if needed)

Attendees:

QA Lead

Tech Lead

Product Owner (optional)

Developer(s)

Agenda:

confirm severity

assign owner

agree fix timeline

define retest steps

8.2 SLA for Fixing Bugs
Severity	Fix Timeline
P0	same day
P1	within 24–48 hours
P2	within 1 sprint
P3	scheduled
P4	roadmap
9) Regression Testing Rules

Every fix must include:

re-test original steps

re-test related workflow module

verify DB integrity not broken

verify RLS not weakened

check console + network

✅ No fix is accepted without regression testing.

10) Release Gate & Approval SOP
10.1 Release Gate Mandatory Criteria

To deploy production:

0 P0

0 P1

core workflows PASS

invoice totals correct

manifest integrity correct

scanning logs auditable

RLS secure

10.2 QA Sign-off Process

QA lead signs off only after:

final regression complete

final report submitted

release gate checklist completed

11) Post-Release QA Monitoring (Ops Support)

After production deployment:

Must monitor:

auth/login failures

shipment creation errors

manifest finalize errors

scanning failures

invoice mismatch

DB write errors

Outcome:

Incident log created for issues found

12) Document Control

This SOP must be updated when:

PRD changes

core workflows change

security model changes

Supabase schema changes

Maintainer:

QA Lead

Revision log:

Version: 1.0

Date:

Summary of updates:

✅ TAC Cargo Portal — Incident Response SOP

Enterprise Logistics Production Incident Handling

1) Purpose

This SOP defines how TAC Cargo team must respond to production incidents involving:

shipment lifecycle failures

tracking inaccuracies

manifest corruption or mismatch

scanning breakdowns

invoice/billing errors

database integrity failures

Supabase security / RLS leakage

uptime / login outages

The goal is to:
✅ restore operations fast
✅ prevent data corruption
✅ protect customer trust
✅ document incidents for prevention

2) Incident Classification (Severity Levels)
SEV-0: Security Breach / Data Leakage

Definition: unauthorized access or cross-tenant exposure.

Examples:

RLS misconfigured exposing shipments/customers/invoices

users can access other org data

sensitive information visible in network calls

Action:

immediate shutdown of access if needed

emergency hotfix release

SEV-1: Critical Operations Down

Definition: core logistics operations blocked.

Examples:

login fails

shipments cannot be created

scanning stops updating shipments

manifests cannot be finalized

invoices cannot be generated

SEV-2: Major Degradation / Partial Outage

Definition: operations can continue but unstable.

Examples:

tracking timeline incorrect

intermittent API failures

slow performance making dispatch workflow unusable

SEV-3: Minor Issues

Definition: usability issues, UI bugs, low risk.

Examples:

misaligned UI

minor errors with workarounds

3) Incident Response Roles (Who Does What)
Incident Commander (IC) — Required

Usually Tech Lead or Senior Engineer.

Responsible for:

leading the incident

assigning tasks

deciding rollback/hotfix

ensuring communication

QA Lead

Responsible for:

reproduction verification

impact testing

regression after fix

confirming resolution

Developer(s)

Responsible for:

diagnosing root cause

implementing hotfix safely

writing recovery scripts (if needed)

Product Owner / Ops

Responsible for:

operational decision making

customer communication direction

prioritization

4) Incident Response Workflow (Step-by-step)
STEP 1 — Detection & Logging

Incident may be detected via:

staff reports

monitoring logs

QA findings

Supabase error spikes

Mandatory Incident Ticket Fields

Incident ID: TAC-INC-YYYYMMDD-###

Detected by: user / staff / system

Module: Shipments / Tracking / Manifests / Scanning / Invoices

First seen time:

Environment:

Symptoms:

Severity guess:

Screenshots/logs:

✅ Output: Incident ticket created

STEP 2 — Severity Assignment (Within 10 minutes)

Incident Commander decides SEV level using:

SEV decision checklist:

security leak? → SEV-0

core workflow blocked? → SEV-1

partial degradation? → SEV-2

cosmetic? → SEV-3

✅ Output: SEV level confirmed

STEP 3 — Immediate Containment

Containment prevents further damage.

Containment actions by incident type:
If SEV-0 (Security)

Disable affected tables access

Restrict policies

Temporarily disable endpoints

Force logout sessions (if possible)

If Invoices Wrong (Billing)

Freeze invoice generation temporarily

Prevent issuing/printing

Flag system warning

If Scanning Corrupts Data

Disable scanning entry if state corruption happening

Switch to manual fallback (if possible)

✅ Output: damage stopped

STEP 4 — Technical Diagnosis

Use:

browser console

network failures

Supabase logs

DB consistency checks via MCP

Diagnosis checklist

 API endpoint failing?

 DB constraint violation?

 schema mismatch?

 RLS denial causing failures?

 incorrect client-side mapping?

 race condition (double submit)?

 wrong status transition logic?

✅ Output: suspected root cause written in ticket

STEP 5 — Fix Strategy Decision (Hotfix vs Rollback)

Incident Commander chooses:

Option A — Rollback

Use if:

incident started after new deploy

fix uncertain

rollback safe

Option B — Hotfix

Use if:

rollback not possible

fix clear and low-risk

urgent operational recovery needed

✅ Output: chosen strategy logged

STEP 6 — Implement Fix Safely

Rules:

fix must be minimal

no refactors during emergency

must include guardrails against recurrence

✅ Output: hotfix PR created

STEP 7 — Verification & Regression Testing

QA Lead must test:

Required Regression Suite

login

shipment creation

manifest finalize

scanning update

invoice creation & totals

Also verify:

DB integrity

no new errors introduced

logs stable

✅ Output: QA sign-off

STEP 8 — Deployment

Deploy hotfix or rollback.

Checklist:

 version tag created

 release notes minimal but clear

 known risks documented

 monitoring enabled

✅ Output: incident moves to monitoring phase

STEP 9 — Post-Incident Monitoring (1–24 hours)

Monitor:

error rate

DB writes

shipment creation volume

scanning logs

invoice totals mismatch

✅ Output: incident stable confirmation

STEP 10 — Postmortem (Within 48 hours)

Mandatory for SEV-0, SEV-1, SEV-2.

Postmortem Must Include

what happened

impact scope

timeline

root cause

contributing factors

detection gap

corrective actions

prevention actions

✅ Output: postmortem report completed

5) Incident Scenarios & Response Playbooks
Playbook A — Login Failure (SEV-1)

Symptoms:

users cannot login

Actions:

confirm Supabase auth status

check environment variables

check redirects/route guards

rollback if after deploy

Recovery:

restore auth flow immediately

verify session persistence

Playbook B — Shipments Creation Failure (SEV-1)

Symptoms:

create shipment fails

tracking_id missing

DB insert fails

Actions:

check API insert call

validate DB constraints

confirm required fields mapping

inspect RLS INSERT policies

Recovery:

shipment creation must be restored first

Playbook C — Manifest Corruption / Totals Mismatch (SEV-1)

Symptoms:

manifest totals do not match items

finalize does not lock

shipment appears in multiple manifests

Actions:

audit manifest_items uniqueness constraint

check finalize transaction logic

run DB consistency check:

manifest_items count == total_packages

rollback if needed

Recovery:

block finalize until fixed (if corruption risk)

Playbook D — Scanning Not Updating Tracking (SEV-1)

Symptoms:

scan succeeds but tracking unchanged

no scan log saved

Actions:

verify scan endpoint

validate shipment_events insert

check duplicate scan logic

ensure DB triggers (if any) working

Recovery:

restore scan log creation first (audit requirement)

Playbook E — Invoice Totals Wrong (SEV-0/SEV-1)

Symptoms:

invoice total mismatch

tax/discount wrong

Action:

stop invoice issuance immediately

isolate calculation bug

verify stored totals match line totals

patch calculation & enforce DB check

Recovery:

ensure no incorrect invoices remain active

mark incorrect invoices as invalid if necessary

Playbook F — RLS Leak (SEV-0)

Symptoms:

users can access other org shipments/customers/invoices

Actions:

immediately disable public access or tighten policies

audit RLS policies on all Tier-1 tables

test cross-tenant access attempts

regenerate sessions if needed

Recovery:

release hotfix urgently

document exposure scope

6) Communication SOP (Enterprise Requirement)
Internal Communication

Incident Commander must update every:

15 mins for SEV-0/SEV-1

30–60 mins for SEV-2

External Communication (if customer impacted)

PO/Ops must:

acknowledge issue

provide workaround

provide ETA (if possible)

confirm resolution

7) Corrective Action Tracking

Every incident must produce:

1–3 immediate fixes

1–3 long-term preventative changes

monitoring improvements

Examples:

add DB constraints

enforce org isolation

add regression tests

add workflow automation tests

✅ TAC Cargo Portal — QA + Release Documentation Index

(Master Index for Enterprise QA, Security, and Deployment Readiness)

1) Purpose of This Index

This document serves as the single source of truth for:

QA execution process

PRD compliance validation

Supabase database + RLS security audits

release gate decision-making

production incident handling

It ensures TAC Cargo is tested and deployed like a real enterprise logistics platform.

2) Document Library (All QA + Release Docs)
A) Core QA Execution Documents (Mandatory)

These are the “must use every release” documents.

QA Audit Report Template (NO CODE)

File: TAC-Cargo-QA-Audit-Report.md

Purpose: Standard final report format (Executive Summary → Issues → Roadmap)

QA Execution Checklist Sheet

File: TAC-Cargo-QA-Execution-Checklist.md

Purpose: PASS/FAIL sheet for every page and workflow

Full E2E Test Script

File: TAC-Cargo-E2E-Test-Script.md

Purpose: Step-by-step workflow testing (Shipments → Manifests → Scanning → Invoices)

Severity Rubric Cheat Sheet

File: TAC-Cargo-Severity-Rubric.md

Purpose: Standardizes P0–P4 severity classification

B) PRD Compliance & Requirements Traceability

Used to ensure features match the docs.

PRD Compliance Matrix

File: Included inside TAC-Cargo-QA-Audit-Report.md (Section 3)

Purpose: Requirement-by-requirement validation tracking

QA Audit tasks.md Instruction Prompt

File: TAC-Cargo-QA-Audit.tasks.md

Purpose: A structured agent prompt to execute full QA + audit process

C) Data + Supabase Database Validation (Enterprise Readiness)

Used to ensure the backend is production-grade and safe.

Logistics Data Model Validation Checklist

File: TAC-Cargo-DataModel-Validation.md

Purpose: Verify tables, columns, constraints, relationships, audit fields

Supabase RLS Audit Checklist

File: TAC-Cargo-Supabase-RLS-Audit.md

Purpose: Ensure tenant isolation + no data leaks + correct CRUD permissions

D) Test Data Management (Repeatable QA)

Used to keep QA consistent across builds.

Realistic Logistics Test Data Setup Checklist

File: TAC-Cargo-Test-Data-Setup.md

Purpose: Creates standard QA dataset (customers, shipments, manifests, invoices)

E) Release Governance (GO / NO-GO)

Used to control production deployments.

Release Gate Checklist

File: TAC-Cargo-Release-Gate.md

Purpose: Strict criteria for GO/NO-GO decision (zero tolerance gates)

Production Readiness Scorecard

File: TAC-Cargo-Production-Readiness-Scorecard.md

Purpose: Weighted scoring with A/B/C/D grade (stakeholder-ready)

F) Scaling QA Over Time (Automation Strategy)

Used for long-term scalability.

QA Automation Readiness Plan

File: TAC-Cargo-QA-Automation-Readiness-Plan.md

Purpose: What to automate first, and how to scale into CI/CD

G) Operational Support (After Production Deployment)

Used once app is live.

QA Operating Procedure (SOP)

File: TAC-Cargo-QA-SOP.md

Purpose: Defines roles, cadence, triage, regression rules, sign-off process

Incident Response SOP

File: TAC-Cargo-Incident-Response-SOP.md

Purpose: SEV-0 → SEV-3 incident handling playbooks

3) Recommended Usage Order (Enterprise Flow)

This is the correct workflow to use these documents every release:

Step 1 — Requirements

TAC-Cargo-Enhancement-PRD.md

TAC-Cargo-Enhancement-tasks.md

Step 2 — Test Data Setup

TAC-Cargo-Test-Data-Setup.md

Step 3 — Run QA

TAC-Cargo-E2E-Test-Script.md

TAC-Cargo-QA-Execution-Checklist.md

TAC-Cargo-Severity-Rubric.md

Step 4 — Validate Backend + Security

TAC-Cargo-DataModel-Validation.md

TAC-Cargo-Supabase-RLS-Audit.md

Step 5 — Produce Final Report

TAC-Cargo-QA-Audit-Report.md

Step 6 — Release Decision

TAC-Cargo-Production-Readiness-Scorecard.md

TAC-Cargo-Release-Gate.md

Step 7 — Post-Release Monitoring

TAC-Cargo-QA-SOP.md

TAC-Cargo-Incident-Response-SOP.md

4) Owner / Responsibility Mapping (Recommended)
Document	Owner
QA checklist + E2E script	QA Engineer
QA audit report	QA Lead
PRD compliance matrix	QA Lead + Product Owner
DB model validation	Backend/Tech Lead + QA Lead
RLS audit	Tech Lead + Security Reviewer
Release Gate + Scorecard	QA Lead + Tech Lead + PO
Incident SOP	Tech Lead + Ops
5) Quality Standard Reminder (TAC Cargo)

TAC Cargo is not a simple admin panel — it is a logistics operations platform, meaning:

shipment tracking must be correct

manifest totals must never mismatch

scanning must be auditable

invoices must be accurate (P0 risk)

RLS must prevent leaks (SEV-0 risk)

✅ TAC Cargo Portal — QA Handbook (Enterprise Master Document)

Version: 1.0
Owner: QA Lead
Applies to: TAC Cargo Portal (Dashboard + Supabase + Logistics Workflows)

Table of Contents

Purpose & Scope

Roles & Responsibilities

QA Process Overview (End-to-End)

Severity Rubric (P0–P4)

Test Data Standards

Smoke Test Checklist

Module-by-Module QA Checklist

Logistics E2E Workflow Testing

API Audit Standards

Supabase Database Validation Standards

Supabase RLS Security Audit Standards

Final Report Output Standard

Production Readiness Scorecard

Release Gate (GO / NO-GO)

Regression Rules

QA Automation Readiness Strategy

Incident Response SOP

Document Control & Revision History

1) Purpose & Scope

TAC Cargo Portal is an enterprise logistics operations platform, not a generic admin dashboard.

This QA handbook ensures:

PRD requirements are met

workflows function reliably (shipments/manifests/scanning/tracking/invoices)

data integrity is enforced (Supabase DB)

security prevents cross-tenant access (RLS)

releases follow strict go/no-go criteria

production incidents are handled professionally

2) Roles & Responsibilities
Product Owner (PO)

owns PRD and acceptance criteria

approves releases

QA Lead

owns QA plan and handbook execution

produces final QA report & readiness scorecard

QA Engineer

executes tests (smoke + modules + workflows)

logs issues with evidence

Tech Lead

owns architecture quality, security, RLS correctness

approves hotfixes and deployment risk

Developers

fix issues, provide regression-ready builds

3) QA Process Overview (Enterprise Flow)
Step-by-step lifecycle

Review PRD + tasks

Setup test data (QA dataset)

Smoke test system

Full module QA

E2E workflow testing

API + Supabase DB audit

Supabase RLS audit

Compile final report

Score production readiness

Run release gate checklist

Deploy (GO/NO-GO)

Monitor post-release

4) Severity Rubric (P0–P4)
P0 Blocker

app unusable / data loss / security leak
Result: No-go

P1 Critical

core workflow broken/unreliable
Result: No-go

P2 Major

important module feature broken
Result: likely no-go unless isolated

P3 Minor

cosmetic/non-blocking issues

P4 Enhancement

improvement suggestions

5) Test Data Standards (QA Dataset)
Naming conventions

Customer: QA-Customer-01

Manifest: QA-MNF-YYYYMMDD-01

Invoice: QA-INV-YYYYMMDD-01

Minimum dataset:

5 customers

15 shipments (mixed complexity)

3 manifests (1 finalized)

20 scan logs

4 exceptions

5 invoices

6) Smoke Test Checklist (Mandatory)

App loads ✅/❌

Login works ✅/❌

Navigation stable ✅/❌

No console crash ✅/❌

Logout works ✅/❌

Protected routes enforced ✅/❌

7) Module-by-Module QA Checklist (All Pages Required)

Pages:

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

Each page must validate:

UI load stability

CRUD (where applicable)

search/filter/sort

form validation

network/API success

DB persistence correctness

8) Logistics E2E Workflow Testing (Most Critical)
Workflow A

Shipment → Manifest → Finalize → Scan → Tracking

Workflow B

Shipment → Exception → Resolve

Workflow C

Invoice creation + totals correctness

9) API Audit Standards

Validate via Network tab:

request payload correctness

response mapping correctness

error handling is user-friendly

no infinite loading states

no sensitive leakage

10) Supabase Database Validation Standards
Must validate:

tables match PRD

FK relationships correct

unique constraints exist:

tracking_id

invoice_number

manifest_number

audit columns exist (created_at, created_by, org_id)

no silent failures

11) Supabase RLS Security Audit Standards
Mandatory

RLS enabled on Tier-1 tables

SELECT/INSERT/UPDATE/DELETE policies exist

tenant isolation enforced (org_id)

no cross-tenant reads via guessed IDs

Security failure = SEV-0

12) Final QA Report Output Standard (No Code)

Report sections must include:

executive summary (GO/NO-GO)

PRD compliance matrix

module PASS/FAIL

workflow PASS/FAIL

API findings

DB findings

RLS findings

issues register

fix roadmap

13) Production Readiness Scorecard (Grade A–D)

Score categories:

PRD compliance

QA completeness

workflow readiness

API reliability

DB integrity

RLS security

UX quality

performance stability

14) Release Gate (GO / NO-GO)
Automatic NO-GO if:

any P0 or P1 open

invoice totals wrong

manifest mismatch

scanning corrupts state

RLS leak risk

15) Regression Rules

Every fix must include:

retest original bug

test related workflow

verify DB not corrupted

verify RLS not weakened

16) QA Automation Readiness Strategy

Automate first:

invoice correctness

manifest finalize integrity

scanning workflow

shipment lifecycle

RLS cross-tenant prevention

17) Incident Response SOP (Production)

Incident levels:

SEV-0: security leak

SEV-1: ops down

SEV-2: major degradation

SEV-3: minor

Incident flow:
log → classify → contain → diagnose → hotfix/rollback → verify → deploy → monitor → postmortem

18) Document Control & Revision History

Version: 1.0

Last updated: YYYY-MM-DD

Maintainer: QA Lead