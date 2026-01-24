# TestSprite Setup Guide for TAC Cargo Portal

> **Complete guide for configuring TestSprite with ngrok tunnel and Supabase backend**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Start Local Development Server](#step-1-start-local-development-server)
3. [Step 2: Setup ngrok Tunnel](#step-2-setup-ngrok-tunnel)
4. [Step 3: Configure TestSprite - Get Started](#step-3-configure-testsprite---get-started)
5. [Step 4: Add APIs for Testing](#step-4-add-apis-for-testing)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Authentication Details](#authentication-details)
8. [Test Credentials](#test-credentials)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ installed
- ngrok installed (`npm install -g ngrok` or download from https://ngrok.com)
- ngrok account (free tier works)
- TestSprite account

---

## Step 1: Start Local Development Server

```bash
cd c:\tac-portal
npm run dev
```

This starts the Vite dev server on `http://localhost:3000`

---

## Step 2: Setup ngrok Tunnel

Since TestSprite cannot access `localhost:3000`, we use ngrok to create a public tunnel.

### 2.1 Start ngrok

```bash
ngrok http 3000
```

### 2.2 Copy the HTTPS URL

ngrok will display something like:

```
Forwarding    https://abc123xyz.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123xyz.ngrok-free.app`)

> ⚠️ **Important**: The ngrok URL changes each time you restart ngrok (unless you have a paid plan with reserved domains).

---

## Step 3: Configure TestSprite - Get Started

On the TestSprite "Get Started" page (Screenshot 2):

| Field | Value |
|-------|-------|
| **Test Name** | `TAC Cargo Portal - Full Test Suite` |

Then click **"Next →"**

---

## Step 4: Add APIs for Testing

On the "Add Your APIs for Testing" page (Screenshot 1), add the following APIs:

### 4.1 Frontend Application (via ngrok)

| Field | Value |
|-------|-------|
| **API name** | `TAC Cargo Portal Frontend` |
| **API endpoint / URL** | `https://YOUR-NGROK-URL.ngrok-free.app` |
| **Authentication Type** | `None - No authentication required` |
| **Extra testing information** | See below |

**Extra testing information:**
```
TAC Cargo Portal - Enterprise Logistics Dashboard

Tech Stack: React 19 + Vite + TypeScript + Tailwind CSS v4 + Supabase

Test User Credentials:
- Email: tapancargo@gmail.com
- Password: Test@1498

Available Modules:
1. Dashboard - KPIs and quick actions
2. Shipments - Create/manage shipments with AWB tracking
3. Manifests - Create manifests, assign shipments, status workflow (OPEN→CLOSED→DEPARTED→ARRIVED)
4. Scanning - Barcode scanning with offline queue
5. Invoices - Invoice creation with PDF generation
6. Customers - Customer management
7. Tracking - Shipment tracking with event history
8. Exceptions - Exception handling workflow
9. Analytics - Business analytics
10. Management - Staff and organization management (ADMIN only)

User Roles: ADMIN, MANAGER, OPS_STAFF, WAREHOUSE_STAFF, FINANCE_STAFF, SUPPORT

Login Flow:
1. Navigate to /login or click "Login" button on landing page
2. Enter email and password
3. Click "Sign In"
4. User is redirected to /dashboard

Key Test Scenarios:
- Authentication with valid/invalid credentials
- Create shipment and verify AWB generation
- Create manifest and add shipments
- Close manifest and track status transitions
- Create and issue invoices
- Generate PDF for invoices
```

---

### 4.2 Supabase REST API (Direct Backend)

| Field | Value |
|-------|-------|
| **API name** | `TAC Cargo Supabase API` |
| **API endpoint / URL** | `https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1` |
| **Authentication Type** | `Bearer Token` or `API Key` |
| **Extra testing information** | See below |

**Authentication Header:**
```
apikey: $VITE_SUPABASE_ANON_KEY
Authorization: Bearer $VITE_SUPABASE_ANON_KEY
```

**Extra testing information:**
```
Supabase REST API for TAC Cargo Portal

Base URL: https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1

Required Headers:
- apikey: $VITE_SUPABASE_ANON_KEY
- Authorization: Bearer <access_token_from_login>
- Content-Type: application/json
- Prefer: return=representation

Authentication Endpoint:
POST https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1/token?grant_type=password
Body: {"email": "tapancargo@gmail.com", "password": "Test@1498"}
Response: {"access_token": "...", "refresh_token": "...", "user": {...}}

Available Tables:
- shipments - Shipment records with AWB tracking
- manifests - Manifest records for batch shipments
- manifest_items - Shipment-to-manifest assignments
- invoices - Invoice records
- customers - Customer records
- hubs - Hub/location records
- staff - Staff records
- tracking_events - Shipment tracking events
- audit_logs - Audit trail

Manifest Status Workflow:
DRAFT → BUILDING → OPEN → CLOSED → DEPARTED → ARRIVED → RECONCILED

Shipment Status Workflow:
CREATED → PICKED_UP → RECEIVED_AT_ORIGIN → IN_TRANSIT → RECEIVED_AT_DEST → OUT_FOR_DELIVERY → DELIVERED
```

---

### 4.3 Supabase Auth API (Login Endpoint)

> ⚠️ **IMPORTANT**: Supabase does NOT use `/login`. Use `/token?grant_type=password` instead!

| Field | Value |
|-------|-------|
| **API name** | `TAC Cargo Auth - Login` |
| **API endpoint / URL** | `https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1/token?grant_type=password` |
| **Authentication Type** | `API Key` |
| **Extra testing information** | See below |

**Common Mistake (causes 404):**
- ❌ Wrong: `https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1/login`
- ✅ Correct: `https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1/token?grant_type=password`

**Extra testing information:**
```
Supabase Authentication API

Base URL: https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1

Required Header:
- apikey: $VITE_SUPABASE_ANON_KEY

Endpoints:

1. Login (Password Grant)
   POST /token?grant_type=password
   Body: {"email": "tapancargo@gmail.com", "password": "Test@1498"}
   
2. Refresh Token
   POST /token?grant_type=refresh_token
   Body: {"refresh_token": "<refresh_token>"}

3. Logout
   POST /logout
   Headers: Authorization: Bearer <access_token>

4. Get User
   GET /user
   Headers: Authorization: Bearer <access_token>

Test Scenarios:
- Valid login returns access_token and user data
- Invalid credentials return 400 error with message
- Empty email/password return validation error
- Token refresh extends session
- Logout invalidates token
```

---

## API Endpoints Reference

### Supabase Configuration

| Property | Value |
|----------|-------|
| **Project URL** | `https://xkkhxhgkyavxcfgeojww.supabase.co` |
| **Project ID** | `xkkhxhgkyavxcfgeojww` |
| **Anon Key** | See `VITE_SUPABASE_ANON_KEY` in `.env.local` |
| **Region** | Supabase Cloud |

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rest/v1/shipments` | GET, POST | List/Create shipments |
| `/rest/v1/shipments?id=eq.{id}` | GET, PATCH, DELETE | Get/Update/Delete shipment |
| `/rest/v1/manifests` | GET, POST | List/Create manifests |
| `/rest/v1/manifests?id=eq.{id}` | GET, PATCH | Get/Update manifest |
| `/rest/v1/manifest_items` | GET, POST | List/Create manifest items |
| `/rest/v1/invoices` | GET, POST | List/Create invoices |
| `/rest/v1/customers` | GET, POST | List/Create customers |
| `/rest/v1/hubs` | GET | List hubs |
| `/rest/v1/staff` | GET | List staff |

### Auth API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/v1/token?grant_type=password` | POST | Login with email/password |
| `/auth/v1/token?grant_type=refresh_token` | POST | Refresh access token |
| `/auth/v1/logout` | POST | Logout user |
| `/auth/v1/user` | GET | Get current user |

---

## Authentication Details

### For API Testing (Use Bearer Token)

**Step 1: Get Access Token**

```bash
curl -X POST "https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "tapancargo@gmail.com", "password": "Test@1498"}'
```

**Step 2: Use Access Token in Requests**

```bash
curl "https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1/shipments?limit=10" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <access_token_from_step_1>" \
  -H "Content-Type: application/json"
```

---

## Test Credentials

### Primary Test User (ADMIN)

| Field | Value |
|-------|-------|
| **Email** | `tapancargo@gmail.com` |
| **Password** | `Test@1498` |
| **Role** | `ADMIN` |

### Test Data Available

| Entity | Count | Notes |
|--------|-------|-------|
| Hubs | 2 | IMPHAL (IMF), NEW DELHI (DEL) |
| Customers | Multiple | Pre-seeded test customers |
| Shipments | Multiple | Various statuses |
| Manifests | Multiple | Various statuses |

---

## Troubleshooting

### Issue 1: ngrok URL Not Working

**Symptoms:** TestSprite shows connection timeout or DNS error

**Solutions:**
1. Ensure ngrok is running: `ngrok http 3000`
2. Check the dev server is running: `npm run dev`
3. Verify the ngrok URL is HTTPS (not HTTP)
4. Check ngrok status page: http://127.0.0.1:4040

### Issue 2: 401 Unauthorized on API Calls

**Symptoms:** API returns 401 error

**Solutions:**
1. Ensure you're using the correct `apikey` header
2. Get a fresh access token via login endpoint
3. Check token hasn't expired (tokens expire after 1 hour)
4. Verify the user has correct role permissions

### Issue 3: CORS Errors

**Symptoms:** Browser shows CORS error

**Solutions:**
1. Use the Supabase REST API directly (it has CORS enabled)
2. Ensure you're using HTTPS ngrok URL
3. Check browser console for specific CORS message

### Issue 4: "your-project.supabase.co" Error

**Symptoms:** Connection error to placeholder URL

**Solutions:**
1. Ensure you're using actual URL: `https://xkkhxhgkyavxcfgeojww.supabase.co`
2. Update all config files with actual credentials
3. Never use placeholder values in production tests

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════╗
║                    TAC CARGO TESTSPRITE CONFIG                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  FRONTEND (via ngrok):                                           ║
║  URL: https://YOUR-NGROK-URL.ngrok-free.app                      ║
║                                                                  ║
║  SUPABASE API:                                                   ║
║  URL: https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1           ║
║  API Key: See VITE_SUPABASE_ANON_KEY in .env.local               ║
║                                                                  ║
║  AUTH API:                                                       ║
║  URL: https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1           ║
║                                                                  ║
║  TEST USER:                                                      ║
║  Email: tapancargo@gmail.com                                     ║
║  Password: Test@1498                                             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## TestSprite Form Values (Copy-Paste Ready)

### Test Name (Step 1)
```
TAC Cargo Portal - Full Test Suite
```

### API 1: Frontend via ngrok
- **API name:** `TAC Cargo Portal Frontend`
- **API endpoint:** `[YOUR NGROK HTTPS URL]`
- **Auth Type:** None

### API 2: Supabase REST API
- **API name:** `TAC Cargo Supabase API`
- **API endpoint:** `https://xkkhxhgkyavxcfgeojww.supabase.co/rest/v1`
- **Auth Type:** API Key / Bearer Token
- **API Key:** See `VITE_SUPABASE_ANON_KEY` in `.env.local`

### API 3: Supabase Auth API
- **API name:** `TAC Cargo Auth API`
- **API endpoint:** `https://xkkhxhgkyavxcfgeojww.supabase.co/auth/v1`
- **Auth Type:** API Key
- **API Key:** See `VITE_SUPABASE_ANON_KEY` in `.env.local`
