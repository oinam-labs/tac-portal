# Create Test User - Quick Guide

> ⚠️ **Security Note:** Store test credentials in `.env.test` (gitignored). Never commit credentials to version control.

## ✅ Step 1: Staff Record Created (DONE)

The staff record has been successfully created in the database:
- **Email:** `$TEST_USER_EMAIL` (from .env.test)
- **Role:** ADMIN
- **Hub:** Imphal Hub (IXA)
- **Status:** Active
- **Staff ID:** `<staff-uuid>`

## 🔐 Step 2: Create Authentication User (DO THIS NOW)

### Option A: Using Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/<your-project-id>

2. **Navigate to Authentication:**
   - Click on **Authentication** in the left sidebar
   - Click on **Users** tab

3. **Add New User:**
   - Click **Add User** button
   - Fill in the form:
     - **Email:** Your test email (save to .env.test as TEST_USER_EMAIL)
     - **Password:** Your test password (save to .env.test as TEST_USER_PASSWORD)
     - **Auto Confirm User:** ✅ Check this box (important!)
   - Click **Create User**

4. **Verify:**
   - You should see the new user in the users list
   - Status should be "Confirmed"

### Option B: Using SQL (Alternative)

If you have service role access, run this SQL in Supabase SQL Editor:

```sql
-- This requires service_role privileges
-- Use Supabase Dashboard method if this doesn't work
-- Replace <your-test-email> and <your-test-password> with actual values

-- Create auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '<your-test-email>',
  crypt('<your-test-password>', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Link auth user to staff record
UPDATE staff 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = '<your-test-email>'
)
WHERE email = '<your-test-email>';
```

## ✅ Step 3: Test Files Updated (DONE)

All test files read credentials from environment variables:
- `TEST_USER_EMAIL` from .env.test
- `TEST_USER_PASSWORD` from .env.test

## 🧪 Step 4: Run Tests

After creating the auth user, run the tests:

```bash
# Run all tests
npm test

# Or run in UI mode to see what's happening
npm run test:ui

# Or run in headed mode (see browser)
npm run test:headed
```

## ✅ Expected Results

Once the auth user is created, you should see:
- ✅ 1 setup test (authentication) - PASS
- ✅ 4 shipment workflow tests - PASS
- ✅ 3 manifest workflow tests - PASS
- ✅ 3 scanning workflow tests - PASS
- **Total: 31 tests across 11 test suites**

## 🔍 Verification

To verify the user was created correctly:

```sql
-- Check auth user (replace with your test email)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = '<your-test-email>';

-- Check staff record
SELECT id, email, full_name, role, is_active, auth_user_id
FROM staff
WHERE email = '<your-test-email>';
```

Both queries should return results, and the `auth_user_id` in the staff table should match the `id` from auth.users.

## 🚨 Troubleshooting

### "User already exists"
- The user might already be in auth.users
- Check: `SELECT * FROM auth.users WHERE email = '<your-test-email>'`
- If exists, just update the password in Supabase Dashboard

### "Tests still fail with timeout"
- Verify email is confirmed (email_confirmed_at should have a timestamp)
- Check password matches `TEST_USER_PASSWORD` in your .env.test
- Try logging in manually at http://localhost:3000/#/login

### "Cannot access certain pages"
- Verify role is 'ADMIN' in staff table
- ADMIN role has access to all features

## 📝 Next Steps

1. Create auth user using Supabase Dashboard (2 minutes)
2. Run tests: `npm test`
3. Review test report
4. All tests should pass! 🎉
