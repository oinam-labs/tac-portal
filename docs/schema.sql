-- TAC Cargo Database Schema
-- Based on ENTERPRISE_PLATFORM_PRD.md
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (SaaS tenants)
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hubs (Fixed: IMPHAL, NEW_DELHI)
CREATE TABLE IF NOT EXISTS hubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL CHECK (code IN ('IMPHAL', 'NEW_DELHI')),
  name TEXT NOT NULL,
  address JSONB NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN DEFAULT true
);

-- Insert default hubs
INSERT INTO hubs (code, name, address) VALUES 
  ('IMPHAL', 'Imphal Hub', '{"line1": "Airport Road", "city": "Imphal", "state": "Manipur", "zip": "795001"}'::jsonb),
  ('NEW_DELHI', 'New Delhi Hub', '{"line1": "IGI Airport Cargo", "city": "New Delhi", "state": "Delhi", "zip": "110037"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Staff (Users with roles)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'ADMIN', 'MANAGER', 'WAREHOUSE_IMPHAL', 
    'WAREHOUSE_DELHI', 'OPS', 'INVOICE', 'SUPPORT'
  )),
  hub_id UUID REFERENCES hubs(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  customer_code TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  gstin TEXT,
  type TEXT CHECK (type IN ('individual', 'business')) DEFAULT 'business',
  address JSONB NOT NULL,
  billing_address JSONB,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, customer_code)
);

-- Shipments (Core logistics entity)
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  awb_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  origin_hub_id UUID REFERENCES hubs(id) NOT NULL,
  destination_hub_id UUID REFERENCES hubs(id) NOT NULL,
  mode TEXT CHECK (mode IN ('AIR', 'TRUCK')) NOT NULL,
  service_level TEXT CHECK (service_level IN ('STANDARD', 'EXPRESS')) NOT NULL,
  status TEXT CHECK (status IN (
    'CREATED', 'RECEIVED', 'LOADED_FOR_LINEHAUL', 
    'IN_TRANSIT', 'RECEIVED_AT_DEST', 'OUT_FOR_DELIVERY',
    'DELIVERED', 'EXCEPTION', 'CANCELLED'
  )) NOT NULL DEFAULT 'CREATED',
  package_count INT NOT NULL DEFAULT 1,
  total_weight DECIMAL(8,2) NOT NULL,
  declared_value DECIMAL(12,2),
  invoice_id UUID,
  manifest_id UUID,
  consignee_name TEXT NOT NULL,
  consignee_phone TEXT NOT NULL,
  consignee_address JSONB NOT NULL,
  special_instructions TEXT,
  totals JSONB DEFAULT '{}'::jsonb,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, awb_number)
);

-- Packages (Scannable units)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  package_no INT NOT NULL,
  package_id TEXT UNIQUE NOT NULL,
  weight DECIMAL(8,2) NOT NULL,
  dimensions JSONB,
  status TEXT NOT NULL DEFAULT 'CREATED',
  current_hub_id UUID REFERENCES hubs(id),
  bin_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, package_id)
);

-- Manifests (Dispatch batches)
CREATE TABLE IF NOT EXISTS manifests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  manifest_no TEXT NOT NULL,
  type TEXT CHECK (type IN ('AIR', 'TRUCK')) NOT NULL,
  from_hub_id UUID REFERENCES hubs(id) NOT NULL,
  to_hub_id UUID REFERENCES hubs(id) NOT NULL,
  status TEXT CHECK (status IN (
    'OPEN', 'CLOSED', 'DEPARTED', 'ARRIVED'
  )) NOT NULL DEFAULT 'OPEN',
  vehicle_meta JSONB,
  total_shipments INT DEFAULT 0,
  total_packages INT DEFAULT 0,
  total_weight DECIMAL(10,2) DEFAULT 0,
  created_by_staff_id UUID REFERENCES staff(id) NOT NULL,
  closed_at TIMESTAMPTZ,
  departed_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, manifest_no)
);

-- Manifest Items (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS manifest_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  manifest_id UUID REFERENCES manifests(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  scanned_by_staff_id UUID REFERENCES staff(id) NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manifest_id, shipment_id)
);

-- Tracking Events (Immutable audit trail)
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  awb_number TEXT NOT NULL,
  event_code TEXT NOT NULL,
  event_time TIMESTAMPTZ DEFAULT now(),
  hub_id UUID REFERENCES hubs(id),
  actor_staff_id UUID REFERENCES staff(id),
  source TEXT CHECK (source IN ('SCAN', 'MANUAL', 'SYSTEM', 'API')) NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for tracking events
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment ON tracking_events(shipment_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_awb ON tracking_events(awb_number, event_time DESC);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  invoice_no TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id),
  status TEXT CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')) NOT NULL DEFAULT 'DRAFT',
  issue_date DATE,
  due_date DATE,
  line_items JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax JSONB,
  total DECIMAL(12,2) NOT NULL,
  payment_terms TEXT,
  notes TEXT,
  pdf_file_path TEXT,
  label_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(org_id, invoice_no)
);

-- Exceptions (Problem tracking)
CREATE TABLE IF NOT EXISTS exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  type TEXT CHECK (type IN (
    'DAMAGED', 'LOST', 'DELAYED', 'MISMATCH', 
    'PAYMENT_HOLD', 'MISROUTE', 'ADDRESS_ISSUE'
  )) NOT NULL,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
  status TEXT CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) NOT NULL DEFAULT 'OPEN',
  description TEXT NOT NULL,
  resolution TEXT,
  assigned_to_staff_id UUID REFERENCES staff(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs (Compliance trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES orgs(id) NOT NULL,
  actor_staff_id UUID REFERENCES staff(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before JSONB,
  after JSONB,
  request_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_staff_id, created_at DESC);

-- Function: Auto-generate AWB number
CREATE OR REPLACE FUNCTION generate_awb_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_sequence INT;
  v_awb TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(awb_number FROM 8) AS INT)), 0) + 1
  INTO v_sequence
  FROM shipments
  WHERE org_id = p_org_id;
  
  v_awb := 'TAC' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(v_sequence::TEXT, 6, '0');
  
  RETURN v_awb;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can only access their org's data
CREATE POLICY staff_org_isolation ON shipments
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON customers
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON packages
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON manifests
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON invoices
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON exceptions
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

CREATE POLICY staff_org_isolation ON tracking_events
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM staff WHERE auth_user_id = auth.uid()));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE tracking_events;
ALTER PUBLICATION supabase_realtime ADD TABLE manifests;
ALTER PUBLICATION supabase_realtime ADD TABLE exceptions;
