
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** tac-portal
- **Date:** 2026-01-24
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Successful shipment creation with valid inputs
- **Test Code:** [TC001_Successful_shipment_creation_with_valid_inputs.py](./TC001_Successful_shipment_creation_with_valid_inputs.py)
- **Test Error:** Login attempt failed due to access restrictions. Cannot proceed with shipment creation without valid credentials. Please provide valid login credentials or alternative access to continue testing shipment creation.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONTENT_LENGTH_MISMATCH (at http://localhost:3000/contact.png:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/166bc424-5b40-4c4b-b837-6b0098f4bfe8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Validate shipment status transition rules
- **Test Code:** [TC002_Validate_shipment_status_transition_rules.py](./TC002_Validate_shipment_status_transition_rules.py)
- **Test Error:** Unable to proceed with shipment status testing due to login access denial. The system shows 'Contact your administrator for account access' error after login attempts with provided credentials. Please verify user access or provide valid credentials to continue.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/b81d064e-85b0-4296-9582-b842a158745b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Manifest creation and shipment assignment
- **Test Code:** [TC003_Manifest_creation_and_shipment_assignment.py](./TC003_Manifest_creation_and_shipment_assignment.py)
- **Test Error:** Login failed repeatedly with valid credentials, blocking all further testing steps. Reported the issue and stopping the task.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONTENT_LENGTH_MISMATCH (at http://localhost:3000/contact.png:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/3807b33b-0f58-4aea-8f5e-693cd0eba460
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Offline-first scan queue persistence and sync
- **Test Code:** [TC004_Offline_first_scan_queue_persistence_and_sync.py](./TC004_Offline_first_scan_queue_persistence_and_sync.py)
- **Test Error:** Stopped testing due to missing scanning page or scanning feature. Unable to proceed with offline scanning persistence and synchronization verification. Please resolve the issue and provide access to the scanning functionality.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/9601fa22-9c86-446c-98f8-3f2a3daa89fd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 RBAC enforcement on shipment visibility and actions
- **Test Code:** [TC005_RBAC_enforcement_on_shipment_visibility_and_actions.py](./TC005_RBAC_enforcement_on_shipment_visibility_and_actions.py)
- **Test Error:** RBAC testing halted due to the page being stuck on 'Verifying credentials...' loading screen after attempting shipment modification. Access to shipments outside user's org/hub scope was possible, indicating potential RBAC violation. Modification testing could not be completed. Please investigate the loading issue and RBAC enforcement.
Browser Console Logs:
[WARNING] [tiptap warn]: Duplicate extension names found: ['link', 'underline']. This can lead to issues. (at http://localhost:3000/node_modules/.vite/deps/chunk-MO7XL7YR.js?v=f531ade9:13567:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/06672915-9350-48b7-9967-1cbad6a14a0a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Invoice generation with GST tax calculation and PDF creation
- **Test Code:** [TC006_Invoice_generation_with_GST_tax_calculation_and_PDF_creation.py](./TC006_Invoice_generation_with_GST_tax_calculation_and_PDF_creation.py)
- **Test Error:** Login failed repeatedly despite correct credentials and clicking Sign In button. Cannot proceed with invoice verification task. Reporting issue and stopping further actions.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/895e42a5-af54-4cf5-9d80-4330cef9ccef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Exception creation and resolution linked to shipments
- **Test Code:** [TC007_Exception_creation_and_resolution_linked_to_shipments.py](./TC007_Exception_creation_and_resolution_linked_to_shipments.py)
- **Test Error:** Testing stopped due to persistent loading screen blocking exceptions management functionality. Exception creation, update, resolution, and audit could not be verified.
Browser Console Logs:
[ERROR] Failed to load resource: the server responded with a status of 406 () (at https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1/shipments?select=id&awb_number=eq.AWB123456789:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/fc2f1cb0-591d-4ed9-a75c-9b9109415d1a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Dashboard KPIs and real-time data updates
- **Test Code:** [TC008_Dashboard_KPIs_and_real_time_data_updates.py](./TC008_Dashboard_KPIs_and_real_time_data_updates.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/0d9498bb-f2e2-46c0-b525-e4095b34b5b5
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Audit log captures critical database mutations immutably
- **Test Code:** [TC009_Audit_log_captures_critical_database_mutations_immutably.py](./TC009_Audit_log_captures_critical_database_mutations_immutably.py)
- **Test Error:** Testing stopped due to the application being stuck on a loading screen after attempting to add a note to a shipment. Unable to verify audit logs for update operations or proceed further. Please resolve the issue to continue testing.
Browser Console Logs:
[ERROR] TypeError: Failed to fetch
    at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7191:23
    at _handleRequest2 (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7481:20)
    at _request (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7471:22)
    at SupabaseAuthClient.signInWithPassword (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:9232:21)
    at signIn (http://localhost:3000/store/authStore.ts:125:76)
    at handleLogin (http://localhost:3000/App.tsx:130:26)
    at executeDispatch (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=f531ade9:13622:11)
    at runWithFiberInDEV (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=f531ade9:997:72)
    at processDispatchQueue (http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=f531ade9:13658:37)
    at http://localhost:3000/node_modules/.vite/deps/react-dom_client.js?v=f531ade9:14071:11 (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7482:12)
[ERROR] [Auth] Sign in error: AuthRetryableFetchError: Failed to fetch
    at _handleRequest2 (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7484:11)
    at async _request (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:7471:16)
    at async SupabaseAuthClient.signInWithPassword (http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=f531ade9:9232:15)
    at async signIn (http://localhost:3000/store/authStore.ts:125:56)
    at async handleLogin (http://localhost:3000/App.tsx:130:20) (at http://localhost:3000/store/authStore.ts:129:20)
[WARNING] [tiptap warn]: Duplicate extension names found: ['link', 'underline']. This can lead to issues. (at http://localhost:3000/node_modules/.vite/deps/chunk-MO7XL7YR.js?v=f531ade9:13567:12)
[WARNING] [tiptap warn]: Duplicate extension names found: ['link', 'underline']. This can lead to issues. (at http://localhost:3000/node_modules/.vite/deps/chunk-MO7XL7YR.js?v=f531ade9:13567:12)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/5fbf16ef-0666-4abb-925d-79a6ccd29c91
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 UI rendering across themes, responsiveness, and accessibility
- **Test Code:** [TC010_UI_rendering_across_themes_responsiveness_and_accessibility.py](./TC010_UI_rendering_across_themes_responsiveness_and_accessibility.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/e843a462-4468-4113-abe5-c3ec25b6bd19
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Shipment filtering and search with multi-tenant scoping
- **Test Code:** [TC011_Shipment_filtering_and_search_with_multi_tenant_scoping.py](./TC011_Shipment_filtering_and_search_with_multi_tenant_scoping.py)
- **Test Error:** Testing stopped due to failure in applying shipment filters and verifying data isolation. Shipment list shows all shipments without proper scoping to user's organization and hub. Filters are not functioning as expected, causing potential data leakage.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/afce76e3-27a4-462d-8e0f-351d1eeb2039
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Manifest lifecycle status transitions and validation
- **Test Code:** [TC012_Manifest_lifecycle_status_transitions_and_validation.py](./TC012_Manifest_lifecycle_status_transitions_and_validation.py)
- **Test Error:** The task to ensure manifest status changes follow lifecycle constraints was partially completed. We successfully logged in, created a new manifest with status OPEN, and navigated the manifest management section. However, attempts to test invalid status transitions (OPEN directly to ARRIVED) failed due to UI interaction issues with the status change controls. Consequently, we could not verify that invalid transitions are rejected or that valid transitions (OPEN -> CLOSED -> DEPARTED -> ARRIVED) are allowed and reflected in the UI. Further investigation or fixes in the UI are needed to complete this testing fully.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/25aa91ed-8709-4ecc-b47f-62c49b5947b9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Shipment scan duplicate detection during scanning workflow
- **Test Code:** [TC013_Shipment_scan_duplicate_detection_during_scanning_workflow.py](./TC013_Shipment_scan_duplicate_detection_during_scanning_workflow.py)
- **Test Error:** Stopped testing due to unresponsive Login button on homepage preventing login and further test steps. Reported the issue.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/c7310b05-b76b-4e3d-acf1-cea0bc0bd7fb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 User authentication and role-based route protection
- **Test Code:** [TC014_User_authentication_and_role_based_route_protection.py](./TC014_User_authentication_and_role_based_route_protection.py)
- **Test Error:** Login attempt with provided user credentials failed due to account access restrictions. Cannot validate role and organization context or route access permissions. Please verify user account status or provide alternative credentials for testing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/dcca0b9d-e7fe-4075-834c-36c877ba19dc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Exception SLA breach notification and escalation
- **Test Code:** [TC015_Exception_SLA_breach_notification_and_escalation.py](./TC015_Exception_SLA_breach_notification_and_escalation.py)
- **Test Error:** The task to verify that exceptions with defined SLAs trigger notifications or escalations when the deadline is breached is partially completed. We successfully logged in, navigated to the Exceptions page, attempted to create an exception with a short SLA deadline, and accessed the notification settings. However, the created exception did not appear in the exceptions list, and we could not simulate system time passing beyond the SLA deadline to confirm notification or escalation triggers. Therefore, the verification is incomplete due to these limitations.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/2cb5446d-5df7-4c00-8590-cdfacf003da8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Profile and application preference update with theme toggle
- **Test Code:** [TC016_Profile_and_application_preference_update_with_theme_toggle.py](./TC016_Profile_and_application_preference_update_with_theme_toggle.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/6b15dabb-0bb8-4b1d-8c21-6f5d59474961/15543f2a-6663-4122-908b-7b6d7b653756
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **18.75** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---