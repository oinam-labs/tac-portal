---
name: tac-supabase-guardian
description: Supabase database expert for TAC Portal. Use when designing database schemas, implementing RLS policies, optimizing queries, creating migrations, or troubleshooting PostgreSQL issues.
metadata:
  author: tac-portal
  version: "1.0"
---

# TAC Supabase Guardian

## Expertise
Database architecture, Row Level Security (RLS), PostgreSQL optimization, real-time subscriptions, and Edge Functions for enterprise logistics applications.

---

## Database Design Principles

### 1. Multi-Tenant Architecture

Every table MUST have `org_id` for tenant isolation:

```sql
-- ✅ REQUIRED: org_id on all business tables
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  awb_number TEXT NOT NULL,
  -- ... other columns
  UNIQUE(org_id, awb_number)  -- Unique within org, not globally
);

-- ❌ FORBIDDEN: Missing org_id
CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  awb_number TEXT UNIQUE  -- Wrong: globally unique
);
```

### 2. Audit Columns

All tables MUST have:
```sql
CREATE TABLE example (
  -- ... columns
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ,  -- Soft delete
  version INT DEFAULT 1    -- Optimistic locking
);

-- Auto-update trigger
CREATE TRIGGER update_timestamp
  BEFORE UPDATE ON example
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 3. Indexing Strategy

```sql
-- Primary lookups (always index)
CREATE INDEX idx_shipments_org_awb ON shipments(org_id, awb_number);
CREATE INDEX idx_shipments_status ON shipments(org_id, status);
CREATE INDEX idx_tracking_events_shipment ON tracking_events(shipment_id, event_time DESC);

-- Partial indexes for active records
CREATE INDEX idx_shipments_active ON shipments(org_id, status)
  WHERE deleted_at IS NULL;

-- GIN for JSONB (search inside JSON)
CREATE INDEX idx_shipments_meta ON shipments USING GIN(meta);
```

---

## Row Level Security (RLS)

### Enable RLS on ALL Tables

```sql
-- Step 1: Enable RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Step 2: Create policies
-- Policy 1: Org isolation (most common)
CREATE POLICY org_isolation ON shipments
  FOR ALL
  TO authenticated
  USING (
    org_id = (
      SELECT org_id FROM staff 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Policy 2: Role-based access
CREATE POLICY warehouse_imphal_only ON packages
  FOR SELECT
  TO authenticated
  USING (
    current_hub_id = (SELECT id FROM hubs WHERE code = 'IMPHAL')
    AND EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role = 'WAREHOUSE_IMPHAL'
    )
  );

-- Policy 3: Admin full access
CREATE POLICY admin_access ON shipments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('ADMIN', 'MANAGER')
    )
  );
```

### RLS Testing

```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-uuid-here"}';

SELECT * FROM shipments;  -- Should only return org's data

-- Reset
RESET ROLE;
```

---

## Query Optimization

### 1. Use EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT s.*, c.name as customer_name
FROM shipments s
JOIN customers c ON s.customer_id = c.id
WHERE s.org_id = 'org-uuid'
  AND s.status = 'IN_TRANSIT';
```

**Look for:**
- Seq Scan on large tables → Add index
- Nested Loop on large datasets → Consider Hash Join
- High buffer reads → Tune shared_buffers

### 2. Avoid N+1 Queries

```typescript
// ❌ BAD: N+1 queries
const shipments = await supabase.from('shipments').select('*');
for (const s of shipments) {
  const customer = await supabase.from('customers').select('*').eq('id', s.customer_id);
}

// ✅ GOOD: Single query with join
const { data } = await supabase
  .from('shipments')
  .select(`
    *,
    customer:customers(*)
  `);
```

### 3. Pagination

```typescript
// ✅ Cursor-based (performant for large datasets)
const { data } = await supabase
  .from('shipments')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', lastCreatedAt)  // Cursor
  .limit(50);

// ❌ AVOID: Offset pagination for large tables
.range(1000, 1050)  // Slow: scans 1000 rows to skip
```

---

## Migrations

### Migration Best Practices

```sql
-- migrations/001_create_shipments.sql

-- Always use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id),
  awb_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes in same migration
CREATE INDEX IF NOT EXISTS idx_shipments_org ON shipments(org_id);

-- Enable RLS immediately
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
DROP POLICY IF EXISTS org_isolation ON shipments;
CREATE POLICY org_isolation ON shipments
  FOR ALL TO authenticated
  USING (org_id = current_setting('app.current_org_id')::uuid);
```

### Data Migrations

```sql
-- migrations/015_backfill_customer_tier.sql

-- Use batched updates for large tables
DO $$
DECLARE
  batch_size INT := 1000;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE customers
    SET tier = 'STANDARD'
    WHERE tier IS NULL
      AND id IN (
        SELECT id FROM customers 
        WHERE tier IS NULL 
        LIMIT batch_size
      );
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    
    COMMIT;
    PERFORM pg_sleep(0.1);  -- Rate limit
  END LOOP;
END $$;
```

---

## Real-time Subscriptions

### Channel Setup

```typescript
// Subscribe to shipment status changes
const channel = supabase
  .channel('shipment-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'shipments',
      filter: `org_id=eq.${orgId}`
    },
    (payload) => {
      console.log('Shipment updated:', payload.new);
      queryClient.invalidateQueries(['shipments']);
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Broadcast for Presence

```typescript
// Show who's viewing a shipment
const room = supabase.channel(`shipment:${shipmentId}`);

room
  .on('presence', { event: 'sync' }, () => {
    const state = room.presenceState();
    setViewers(Object.values(state).flat());
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await room.track({
        user_id: user.id,
        user_name: user.name,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## Edge Functions

### Invoice PDF Generation

```typescript
// supabase/functions/generate-invoice-pdf/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { invoiceId } = await req.json();
    
    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401 
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Fetch invoice with relations
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        shipment:shipments(*)
      `)
      .eq('id', invoiceId)
      .single();
    
    if (error) throw error;
    
    // Generate PDF (use pdf-lib or similar)
    const pdfBytes = await generatePDF(invoice);
    
    // Upload to storage
    const fileName = `invoices/${invoice.invoice_no}.pdf`;
    await supabase.storage
      .from('documents')
      .upload(fileName, pdfBytes, { 
        contentType: 'application/pdf',
        upsert: true 
      });
    
    // Update invoice record
    await supabase
      .from('invoices')
      .update({ pdf_file_path: fileName })
      .eq('id', invoiceId);
    
    return new Response(JSON.stringify({ success: true, path: fileName }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500 
    });
  }
});
```

---

## Common Issues & Solutions

### Issue: RLS blocks admin operations

```sql
-- Fix: Bypass RLS for service role
ALTER TABLE shipments FORCE ROW LEVEL SECURITY;

-- Service role key bypasses RLS automatically
-- Anon key respects RLS
```

### Issue: Slow queries after data growth

```sql
-- Check for missing indexes
SELECT 
  schemaname, tablename, 
  seq_scan, idx_scan,
  seq_scan - idx_scan AS too_many_seqs
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY too_many_seqs DESC;
```

### Issue: Deadlocks on bulk updates

```sql
-- Lock table explicitly for bulk operations
BEGIN;
LOCK TABLE shipments IN EXCLUSIVE MODE;
-- bulk update
COMMIT;
```

---

## Security Checklist

- [ ] RLS enabled on ALL tables
- [ ] No tables use `TO public` in policies
- [ ] Service role key never exposed to frontend
- [ ] Anon key has minimal permissions
- [ ] Storage buckets have RLS policies
- [ ] Edge Functions validate JWT
- [ ] Sensitive columns excluded from select

---

## When to Use This Skill

- "Design a database schema"
- "Create RLS policies"
- "Optimize slow queries"
- "Set up real-time subscriptions"
- "Write database migrations"
- "Debug Supabase issues"
