
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** tac-portal
- **Date:** 2026-01-22
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Role-based authentication success
- **Test Code:** [TC001_Role_based_authentication_success.py](./TC001_Role_based_authentication_success.py)
- **Test Error:** Login attempt for ADMIN role failed with message 'Contact your administrator for account access'. This indicates the account is not authorized or active. Therefore, login verification for ADMIN and other roles cannot proceed. Task stopped as user access is restricted.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/4c9965ab-8812-4375-86fa-576421f8ab22
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Role-based authentication failure
- **Test Code:** [TC002_Role_based_authentication_failure.py](./TC002_Role_based_authentication_failure.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/8591d23b-21aa-4986-a740-b1c123222cc2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Dashboard real-time KPI and activity display
- **Test Code:** [TC003_Dashboard_real_time_KPI_and_activity_display.py](./TC003_Dashboard_real_time_KPI_and_activity_display.py)
- **Test Error:** The task to validate the dashboard's accurate KPIs, charts, and recent activity filtered by user role with real-time updates could not be fully completed. Login and dashboard role-based data verification succeeded. However, shipment creation to trigger real-time updates failed silently with no feedback, blocking further validation. This is likely a bug in the shipment creation process. Recommend fixing this issue before retrying the test. Task stopped here.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/883541e7-3259-4c47-9928-e9cfb65c8880
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Shipment creation with AWB generation
- **Test Code:** [TC004_Shipment_creation_with_AWB_generation.py](./TC004_Shipment_creation_with_AWB_generation.py)
- **Test Error:** Login failed repeatedly with provided credentials; unable to proceed with shipment creation tests. Also unable to report the issue via UI due to click failure. Stopping further actions and recommending external issue reporting.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/9421a14a-8026-4c1c-9346-0466ce5aabc5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Shipment status lifecycle progression
- **Test Code:** [TC005_Shipment_status_lifecycle_progression.py](./TC005_Shipment_status_lifecycle_progression.py)
- **Test Error:** The task to verify shipment status transitions and audit logging could not be completed because the shipment creation form submission failed silently without creating a shipment. Despite filling all required fields with valid data, clicking 'Create Shipment' did not proceed or show any success or error message. Therefore, it was not possible to test valid or invalid status transitions or verify audit logs. Please investigate the shipment creation issue before retrying this test.
Browser Console Logs:
[ERROR] [Auth] Failed to fetch staff: {message: TypeError: Failed to fetch (xkkhxhgkyavxcfgeojww.supabase.co), details: TypeError: Failed to fetch
    at http://localhost…handleLogin (http://localhost:3000/App.tsx:85:20), hint: , code: } (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/d97b5d22-3c1a-40ba-9ce6-85f1e3b414c6
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Manifest creation and shipment assignment
- **Test Code:** [TC006_Manifest_creation_and_shipment_assignment.py](./TC006_Manifest_creation_and_shipment_assignment.py)
- **Test Error:** The manifest creation and shipment assignment workflow was tested. Login as MANAGER succeeded. Navigation to Manifests page and opening the create manifest form worked as expected. Origin and destination hubs were selected, but no shipments were available for assignment in the tested route. Shipment linking and duplicate prevention could not be fully validated due to lack of shipments. Dispatch workflow status transitions were not tested due to no manifest status changes performed. Overall, the task is partially completed with limitations due to test data availability. Further testing with available shipments is recommended to fully validate shipment assignment and dispatch status transitions.
Browser Console Logs:
[ERROR] WebSocket connection to 'wss://xkkhxhgkyavxcfgeojww.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2h4aGdreWF2eGNmZ2Vvand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NzE4NDUsImV4cCI6MjA4NDM0Nzg0NX0.eu2RhXCeL7aM1Df25QUOG7FB8krO5TVS38T4NYu7zCA&vsn=2.0.0' failed: Error in connection establishment: net::ERR_CONNECTION_CLOSED (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=611fa26f:1498:0)
[ERROR] WebSocket connection to 'wss://xkkhxhgkyavxcfgeojww.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2h4aGdreWF2eGNmZ2Vvand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NzE4NDUsImV4cCI6MjA4NDM0Nzg0NX0.eu2RhXCeL7aM1Df25QUOG7FB8krO5TVS38T4NYu7zCA&vsn=2.0.0' failed: Error in connection establishment: net::ERR_CONNECTION_CLOSED (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=611fa26f:1498:0)
[ERROR] WebSocket connection to 'wss://xkkhxhgkyavxcfgeojww.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhra2h4aGdreWF2eGNmZ2Vvand3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NzE4NDUsImV4cCI6MjA4NDM0Nzg0NX0.eu2RhXCeL7aM1Df25QUOG7FB8krO5TVS38T4NYu7zCA&vsn=2.0.0' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/node_modules/.vite/deps/@supabase_supabase-js.js?v=611fa26f:1498:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1/shipments?select=*&origin_hub_id=eq.IMPHAL&manifest_id=is.null&status=eq.RECEIVED&order=created_at.asc:0:0)
[ERROR] {message: TypeError: Failed to fetch (xkkhxhgkyavxcfgeojww.supabase.co), details: TypeError: Failed to fetch
    at http://localhost…onents/manifests/ManifestShipmentPanel.tsx:30:20), hint: , code: } (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/901e9e57-b764-4d26-a0aa-f13f9ac3f2b7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Barcode and QR code scanning offline queue and synchronization
- **Test Code:** [TC007_Barcode_and_QR_code_scanning_offline_queue_and_synchronization.py](./TC007_Barcode_and_QR_code_scanning_offline_queue_and_synchronization.py)
- **Test Error:** Offline mode toggle is missing from the System Configuration page under General Settings, blocking offline scan queueing and synchronization tests. Additionally, the attempt to report this issue via the 'Report a Bug' button failed due to an action error. Stopping further testing due to critical feature inaccessibility and reporting failure.
Browser Console Logs:
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/832f7e74-3398-4517-86ff-18c170efecad
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Duplicate barcode scan detection
- **Test Code:** [TC008_Duplicate_barcode_scan_detection.py](./TC008_Duplicate_barcode_scan_detection.py)
- **Test Error:** Testing stopped due to critical loading/authentication issue on the scanning page. The system is stuck on 'Verifying credentials...' and no further actions can be performed. Please investigate this issue before continuing duplicate barcode scan prevention tests.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1/staff?select=id%2Cauth_user_id%2Cemail%2Cfull_name%2Crole%2Chub_id%2Corg_id%2Cis_active%2Chub%3Ahubs%28code%29&auth_user_id=eq.e238b3fe-a453-4777-a69f-28fa1b8e53ba:0:0)
[ERROR] [Auth] Failed to fetch staff: {message: TypeError: Failed to fetch (xkkhxhgkyavxcfgeojww.supabase.co), details: TypeError: Failed to fetch
    at http://localhost… (http://localhost:3000/store/authStore.ts:25:29), hint: , code: } (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[WARNING] [Auth] No staff record found for user: tapancargo@gmail.com (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/pages/Dashboard.tsx:0:0)
[ERROR] %o

%s

%s
 TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/Dashboard.tsx The above error occurred in one of your React components. React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] [ErrorBoundary] Caught error: TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/Dashboard.tsx {componentStack: 
    at Lazy (<anonymous>)
    at main (<anonymous…    at App (http://localhost:3000/App.tsx:429:21)} (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/5b431107-00b9-4843-9fca-235f0f39232a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Invoice creation with tax and discount calculations
- **Test Code:** [TC009_Invoice_creation_with_tax_and_discount_calculations.py](./TC009_Invoice_creation_with_tax_and_discount_calculations.py)
- **Test Error:** Tested invoice creation workflow up to the final payment step. Filled all required invoice details including consignor, consignee, cargo, and payment with GST and discount applied. Verified the grand total calculation as ₹1,510.00 inclusive of GST. However, the 'Confirm & Book' button to save and issue the invoice was not found or not clickable, preventing completion of the workflow. Invoice status transition and unique invoice number generation could not be verified due to this limitation. Task partially completed.
Browser Console Logs:
[ERROR] [Auth] Failed to fetch staff: {message: TypeError: Failed to fetch (xkkhxhgkyavxcfgeojww.supabase.co), details: TypeError: Failed to fetch
    at http://localhost…handleLogin (http://localhost:3000/App.tsx:85:20), hint: , code: } (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/a60aad8e-c976-42b5-a271-94fd0a5ccbaf
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Invoice PDF generation with embedded barcode
- **Test Code:** [null](./null)
- **Test Error:** Test execution timed out after 15 minutes
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/47846c06-69da-4d27-965b-2b2a34cf9264
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Exception handling and resolution workflow
- **Test Code:** [TC011_Exception_handling_and_resolution_workflow.py](./TC011_Exception_handling_and_resolution_workflow.py)
- **Test Error:** Test stopped due to critical issue: Shipment details page is empty with no UI elements to create shipment exceptions. Cannot proceed with testing creation, linking, and resolution of shipment exceptions.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/store/index.ts:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/components/domain/CommandPalette.tsx:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/store/authStore.ts:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/fe6d5afa-78fc-4b3f-b66f-926070976c14
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Inventory management with bin location and aging analysis
- **Test Code:** [TC012_Inventory_management_with_bin_location_and_aging_analysis.py](./TC012_Inventory_management_with_bin_location_and_aging_analysis.py)
- **Test Error:** The WAREHOUSE_STAFF user account is currently restricted from logging in, as indicated by the message 'Contact your administrator for account access'. Due to this access restriction, it is not possible to proceed with validating warehouse stock tracking CRUD operations, bin location assignment, or stock aging analysis display. Please resolve the account access issue with the system administrator to enable login and continue testing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/037668ed-2210-4a90-bd30-16ecd156eb5d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Internal and public shipment tracking event history
- **Test Code:** [TC013_Internal_and_public_shipment_tracking_event_history.py](./TC013_Internal_and_public_shipment_tracking_event_history.py)
- **Test Error:** The task to verify shipment tracking pages for correct event history timeline with real-time updates could not be completed. Login as OPS_STAFF failed repeatedly due to inability to input password and authentication failure. Attempts to report the issue via the UI were unsuccessful. Consequently, internal shipment tracking page and public tracking interface could not be accessed or verified. Recommend manual intervention to resolve authentication and input issues before retrying this task.
Browser Console Logs:
[ERROR] WebSocket connection to 'ws://localhost:3000/?token=Hk9cWdZUCRG8' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/@vite/client:801:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/?token=Hk9cWdZUCRG8' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/@vite/client:814:0)
[ERROR] [vite] failed to connect to websocket.
your current setup:
  (browser) localhost:3000/ <--[HTTP]--> localhost:3000/ (server)
  (browser) localhost:3000/ <--[WebSocket (failing)]--> localhost:3000/ (server)
Check out your Vite / network configuration and https://vite.dev/config/server-options.html#server-hmr . (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/3c38ae1f-aa90-4dba-b8a2-a8d27a6a2692
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Admin management of staff roles and organizations
- **Test Code:** [TC014_Admin_management_of_staff_roles_and_organizations.py](./TC014_Admin_management_of_staff_roles_and_organizations.py)
- **Test Error:** Unable to proceed with the task as ADMIN login fails repeatedly with no error message, and the attempt to report the issue via 'Report a Bug' button also failed due to an action error. Please investigate the login functionality and bug reporting mechanism. Task stopped.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/d7d35d3e-3a4c-494c-a0c1-cf923bb5f8d5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Audit log viewing and export
- **Test Code:** [TC015_Audit_log_viewing_and_export.py](./TC015_Audit_log_viewing_and_export.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/ed6af017-ded1-4c10-94f2-24dcc241a463
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 API error handling and retry logic
- **Test Code:** [TC016_API_error_handling_and_retry_logic.py](./TC016_API_error_handling_and_retry_logic.py)
- **Test Error:** The login page remains empty and non-interactive after reload, preventing any login attempts or issue reporting. Unable to proceed with testing API error handling in shipment CRUD operations due to this critical access issue. Reporting this issue and stopping further actions.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/components/domain/CommandPalette.tsx:0:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/c64689b5-9fb9-422a-9c8d-e6d5e3e768f9
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 UI consistency for loading, empty, and error states
- **Test Code:** [TC017_UI_consistency_for_loading_empty_and_error_states.py](./TC017_UI_consistency_for_loading_empty_and_error_states.py)
- **Test Error:** Authentication failed repeatedly with provided credentials, preventing access to pages needed for testing loading, empty, and error states. Additionally, the attempt to report the issue via the 'Report a Bug' button failed due to an action error. Unable to proceed further. Please investigate the login issue and UI bug reporting functionality before continuing testing.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/33c069be-ac1a-477a-95a7-f6c9949c160f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Accessibility compliance for major UI components
- **Test Code:** [TC018_Accessibility_compliance_for_major_UI_components.py](./TC018_Accessibility_compliance_for_major_UI_components.py)
- **Test Error:** Accessibility testing for keyboard navigation, color contrast, and screen reader support was partially completed. Keyboard navigation and ARIA role verification on main and login pages were successful. However, color contrast verification was incomplete due to inability to extract computed styles. The test was interrupted by a navigation error page preventing further testing. Recommend investigating the navigation failure and retrying the tests.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/ce7fdfd0-330c-41ad-8474-9566a42ec6ea
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Real-time data update and resource cleanup
- **Test Code:** [TC019_Real_time_data_update_and_resource_cleanup.py](./TC019_Real_time_data_update_and_resource_cleanup.py)
- **Test Error:** The test to confirm real-time subscriptions receive timely updates and resources are unsubscribed or cleaned up when components unmount could not be fully completed. The application encountered a critical error on the landing page with the message 'Failed to fetch dynamically imported module: http://localhost:3000/pages/Landing.tsx', preventing access to the dashboard and shipment pages. Attempts to trigger backend data changes and verify real-time UI updates were unsuccessful due to this blocking error. The 'Report a Bug' button was clicked multiple times but did not initiate any visible bug report process or page change. Further testing is halted until the application error is resolved. Please address this critical issue to enable comprehensive testing of real-time subscriptions and resource cleanup.
Browser Console Logs:
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_EMPTY_RESPONSE (at http://localhost:3000/pages/Landing.tsx:0:0)
[ERROR] %o

%s

%s
 TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/Landing.tsx The above error occurred in the <Route> component. React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary. (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] [ErrorBoundary] Caught error: TypeError: Failed to fetch dynamically imported module: http://localhost:3000/pages/Landing.tsx {componentStack: 
    at RenderedRoute (http://localhost:3000/node_…    at App (http://localhost:3000/App.tsx:429:21)} (at http://localhost:3000/node_modules/.vite/deps/@sentry_react.js?v=611fa26f:6984:37)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error during WebSocket handshake: net::ERR_CONNECTION_RESET (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Connection closed before receiving a handshake response (at http://localhost:3000/@vite/client:1034:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] Failed to load resource: net::ERR_CONNECTION_CLOSED (at https://o4510734784069632.ingest.de.sentry.io/api/4510734787346512/envelope/?sentry_version=7&sentry_key=e5f289a33dc393fa55497d9c8e4498e0&sentry_client=sentry.javascript.react%2F10.35.0:0:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
[ERROR] WebSocket connection to 'ws://localhost:3000/' failed: Error in connection establishment: net::ERR_SOCKET_NOT_CONNECTED (at http://localhost:3000/@vite/client:1034:0)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/007f3df1-7e27-4da2-89fe-022589174dc6/d199921c-ba4f-477b-80f9-1a17f22b880b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **10.53** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---