# Create Test User - Quick Guide

## ✅ Step 1: Staff Record Created (DONE)

The staff record has been successfully created in the database:
- **Email:** tapancargo@gmail.com
- **Role:** ADMIN
- **Hub:** Imphal Hub (IXA)
- **Status:** Active
- **Staff ID:** 7ff4d1ea-3b78-4e50-8c05-f5570a356c1e

## 🔐 Step 2: Create Authentication User (DO THIS NOW)

### Option A: Using Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/xkkhxhgkyavxcfgeojww

2. **Navigate to Authentication:**
   - Click on **Authentication** in the left sidebar
   - Click on **Users** tab

3. **Add New User:**
   - Click **Add User** button
   - Fill in the form:
     - **Email:** `tapancargo@gmail.com`
     - **Password:** `Test@1498`
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
  'tapancargo@gmail.com',
  crypt('Test@1498', gen_salt('bf')),
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
  SELECT id FROM auth.users WHERE email = 'tapancargo@gmail.com'
)
WHERE email = 'tapancargo@gmail.com';
```

## ✅ Step 3: Test Files Updated (DONE)

All test files have been updated with the new credentials:
- Email: `tapancargo@gmail.com`
- Password: `Test@1498`

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
-- Check auth user
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'tapancargo@gmail.com';

-- Check staff record
SELECT id, email, full_name, role, is_active, auth_user_id
FROM staff
WHERE email = 'tapancargo@gmail.com';
```

Both queries should return results, and the `auth_user_id` in the staff table should match the `id` from auth.users.

## 🚨 Troubleshooting

### "User already exists"
- The user might already be in auth.users
- Check: `SELECT * FROM auth.users WHERE email = 'tapancargo@gmail.com'`
- If exists, just update the password in Supabase Dashboard

### "Tests still fail with timeout"
- Verify email is confirmed (email_confirmed_at should have a timestamp)
- Check password is correct: `Test@1498`
- Try logging in manually at http://localhost:3000/#/login

### "Cannot access certain pages"
- Verify role is 'ADMIN' in staff table
- ADMIN role has access to all features

## 📝 Next Steps

1. Create auth user using Supabase Dashboard (2 minutes)
2. Run tests: `npm test`
3. Review test report
4. All tests should pass! 🎉
