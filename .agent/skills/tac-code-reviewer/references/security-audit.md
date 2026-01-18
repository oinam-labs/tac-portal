# TAC Portal Security Audit Guide

## OWASP Top 10 Checklist for React + Supabase

### 1. Injection (A03:2021)

**SQL Injection Prevention**
```typescript
// ❌ VULNERABLE (if using raw SQL)
const query = `SELECT * FROM invoices WHERE id = '${userInput}'`;

// ✅ SAFE: Supabase client auto-escapes
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('id', userInput);

// ✅ SAFE: Parameterized RPC
const { data } = await supabase.rpc('get_invoice', { invoice_id: userInput });
```

**XSS Prevention**
```typescript
// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SAFE: React auto-escapes
<div>{userContent}</div>

// ✅ SAFE: Sanitize if HTML needed
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

---

### 2. Broken Access Control (A01:2021)

**Row Level Security (RLS)**
```sql
-- MUST enable on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their org's data
CREATE POLICY org_isolation ON invoices
  FOR ALL
  USING (org_id = auth.jwt()->>'org_id');

-- Policy: Role-based access
CREATE POLICY admin_full_access ON invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );
```

**Frontend Route Protection**
```typescript
// ProtectedRoute.tsx
function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

---

### 3. Cryptographic Failures (A02:2021)

**Sensitive Data Handling**
```typescript
// ❌ NEVER log sensitive data
console.log('User password:', password);
console.log('API Key:', apiKey);

// ❌ NEVER store in localStorage
localStorage.setItem('jwt', token);

// ✅ Use httpOnly cookies (Supabase handles this)
// ✅ Environment variables for secrets
const apiKey = import.meta.env.VITE_SUPABASE_KEY;
```

**HTTPS Enforcement**
```typescript
// vite.config.ts for local dev
export default defineConfig({
  server: {
    https: true
  }
});
```

---

### 4. Security Misconfiguration (A05:2021)

**Environment Variables**
```bash
# .env.local (NEVER commit)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# .env.example (commit this)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Headers**
```typescript
// Supabase Edge Function
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
});
```

---

### 5. Vulnerable Components (A06:2021)

**Dependency Audit**
```bash
# Run regularly
npm audit

# Auto-fix what's possible
npm audit fix

# Check for outdated packages
npm outdated
```

**Lock File**
```bash
# Always commit package-lock.json
# Use exact versions in production
npm ci  # Not npm install
```

---

### 6. Authentication Failures (A07:2021)

**Supabase Auth Best Practices**
```typescript
// Password requirements
const signUp = async (email: string, password: string) => {
  // Validate password strength
  if (password.length < 12) {
    throw new Error('Password must be 12+ characters');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain uppercase');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain number');
  }
  
  return supabase.auth.signUp({ email, password });
};

// Session management
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login
}

// Auto-refresh tokens handled by Supabase
```

**Rate Limiting**
```sql
-- Supabase Edge Function rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  request_count INT;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM api_requests
  WHERE user_id = $1
    AND created_at > NOW() - INTERVAL '1 minute';
  
  RETURN request_count < 100;  -- 100 requests/minute
END;
$$ LANGUAGE plpgsql;
```

---

### 7. Input Validation

**Zod Schemas**
```typescript
import { z } from 'zod';

const invoiceSchema = z.object({
  awb: z.string().regex(/^TAC\d{8}$/, 'Invalid AWB format'),
  customerId: z.string().uuid('Invalid customer ID'),
  amount: z.number().positive('Amount must be positive'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone'),
});

// Usage
const result = invoiceSchema.safeParse(userInput);
if (!result.success) {
  console.error(result.error.flatten());
}
```

---

## Security Audit Checklist

### Pre-Deployment
- [ ] RLS enabled on ALL tables
- [ ] No secrets in codebase
- [ ] npm audit shows no critical vulnerabilities
- [ ] HTTPS enforced
- [ ] Error messages don't leak info

### Authentication
- [ ] Password policy enforced
- [ ] Session timeout configured
- [ ] Failed login attempts limited
- [ ] Logout clears all state

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] PII not logged
- [ ] GSTIN/financial data secured
- [ ] File uploads validated

### API Security
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error responses sanitized

---

## Incident Response

### If Breach Detected
1. **Contain**: Disable affected accounts/keys
2. **Rotate**: Generate new API keys
3. **Audit**: Check audit_logs table
4. **Notify**: Alert affected users
5. **Document**: Record timeline and actions
