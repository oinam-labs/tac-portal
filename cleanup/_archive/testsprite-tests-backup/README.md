# TestSprite Tests for TAC Cargo Portal

This directory contains automated tests generated and executed by TestSprite AI-powered testing platform.

## 📖 Quick Start

**For complete setup with ngrok, see: [`TESTSPRITE_SETUP_GUIDE.md`](./TESTSPRITE_SETUP_GUIDE.md)**

## Test Report Summary (January 23, 2026)

| Category | Pass | Fail | Total |
|----------|------|------|-------|
| Backend API | 12 | 8 | 20 |
| Frontend UI | 0 | 0 | 0 |

## Credentials Quick Reference

| Item | Value |
|------|-------|
| **Supabase URL** | See `VITE_SUPABASE_URL` in `.env.local` |
| **API Key** | See `VITE_SUPABASE_ANON_KEY` in `.env.local` |
| **Test Email** | `tapancargo@gmail.com` |
| **Test Password** | `Test@1498` |

## Setup Instructions

### Prerequisites

1. **Python 3.8+** installed
2. **pip** package manager
3. **Node.js 18+** for running the development server
4. **ngrok** installed (for exposing localhost to TestSprite)
5. A properly configured **Supabase project**

### Step 1: Install Python Dependencies

```bash
cd testsprite_tests
pip install requests python-dotenv playwright
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp ../.env.test.example ../.env.test
   ```

2. Edit `../.env.test` and replace placeholder values:
   ```env
   # REQUIRED: Replace with your actual Supabase URL
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   
   # REQUIRED: Test user credentials
   TEST_USER_EMAIL=your-test-user@example.com
   TEST_USER_PASSWORD=your-test-password
   ```

3. **CRITICAL**: Do NOT leave `your-project` in the URL. This causes all API tests to fail!

### Step 3: Start the Development Server

```bash
cd ..
npm run dev
```

### Step 4: Validate Configuration

```bash
cd testsprite_tests
python config.py
```

Expected output:
```
✓ TestSprite configuration is valid
  Supabase URL: https://xxxx.supabase.co
  Base URL: http://localhost:3000
```

### Step 5: Test Authentication

```bash
python auth_helper.py
```

Expected output:
```
✓ Authentication successful
  User ID: <user-uuid>
  Token: <jwt-token>
✓ Logout successful
```

## Test Files

| File | Description |
|------|-------------|
| `config.py` | Configuration and environment validation |
| `auth_helper.py` | Authentication utilities for API tests |
| `api_helper.py` | API request helpers with proper error handling |
| `TC001_*.py` - `TC019_*.py` | Individual test case implementations |
| `standard_prd.json` | Product requirements document |
| `testsprite_frontend_test_plan.json` | Frontend test plan |

## Common Issues and Fixes

### Issue 1: Connection Error to `your-project.supabase.co`

**Cause**: Placeholder URL not replaced with actual Supabase URL.

**Fix**: Update `VITE_SUPABASE_URL` in `.env.test` with your actual project URL.

### Issue 2: 401 Unauthorized Errors

**Cause**: Invalid or expired JWT token.

**Fixes**:
1. Ensure `VITE_SUPABASE_ANON_KEY` is correct
2. Verify test user credentials are valid
3. Check that RLS policies allow the operation

### Issue 3: Invalid JSON Response (Extra data error)

**Cause**: API returning non-JSON or malformed JSON response.

**Fixes**:
1. Ensure the backend is running (`npm run dev`)
2. Check network connectivity
3. Verify the endpoint exists

### Issue 4: Manifest Closure / Status Transition Fails

**Cause**: User lacks permission or manifest is in invalid state.

**Fixes**:
1. Ensure user has MANAGER or ADMIN role
2. Check manifest is in OPEN status before closing
3. Valid transitions: OPEN → CLOSED → DEPARTED → ARRIVED

## Running Individual Tests

```bash
# Run a specific test case
python TC001_Role_based_authentication_success.py

# Run API helper tests
python api_helper.py
```

## Test Categories

### Authentication Tests (TC001-TC002)
- Valid login with role-based access
- Invalid credentials handling

### Dashboard Tests (TC003)
- Real-time KPI display
- Activity filtering

### Shipment Tests (TC004-TC005)
- Shipment creation with AWB generation
- Status lifecycle progression

### Manifest Tests (TC006)
- Manifest creation
- Shipment assignment
- Status workflow (OPEN → CLOSED → DEPARTED → ARRIVED)

### Scanning Tests (TC007-TC008)
- Offline queue and synchronization
- Duplicate barcode detection

### Invoice Tests (TC009-TC010)
- Invoice creation with tax calculations
- PDF generation

### Other Tests (TC011-TC019)
- Exception handling
- Inventory management
- Tracking
- Admin management
- Audit logs
- API error handling
- UI consistency
- Accessibility
- Real-time updates

## Contact

For TestSprite support:
- [Calendly scheduling](https://calendly.com/testsprite)
- [Discord community](https://discord.gg/testsprite)
