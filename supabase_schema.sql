-- SUPABASE DATABASE SETUP SCHEMA FOR MICRO-CRM
-- Copy and paste this script directly into the SQL Editor in your Supabase dashboard (https://supabase.com)
-- This creates the tables and configures cascade deletions and Row-Level Security (RLS) rules.

-- 1. Create crm_solopreneurs table
CREATE TABLE IF NOT EXISTS crm_solopreneurs (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  whatsapp_template TEXT NOT NULL,
  sms_template TEXT NOT NULL
);

-- 2. Create crm_clients table
CREATE TABLE IF NOT EXISTS crm_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NULL,
  notes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TEXT NOT NULL
);

-- 3. Create crm_invoices table
CREATE TABLE IF NOT EXISTS crm_invoices (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  due_date TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 4. Create crm_followups (Tasks) table
CREATE TABLE IF NOT EXISTS crm_followups (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Enable Row-Level Security (RLS)
ALTER TABLE crm_solopreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_followups ENABLE ROW LEVEL SECURITY;

-- 6. Create permissive RLS policies for testing & prototyping
-- (In production, replace these with specific auth policies like auth.uid() = user_id if you enable auth)
CREATE POLICY "Enable read & write access for all users" ON crm_solopreneurs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read & write access for all users" ON crm_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read & write access for all users" ON crm_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read & write access for all users" ON crm_followups FOR ALL USING (true) WITH CHECK (true);

-- 7. Insert default solopreneur record to initialize
INSERT INTO crm_solopreneurs (id, business_name, whatsapp_template, sms_template)
VALUES (
  'default-solo',
  'Apex Craft & Repairs',
  'Hi {{client_name}}, hope you''re doing well! Just a friendly reminder that a payment of ${{amount}} is due on {{due_date}} for our services. You can pay via Venmo/Zelle. Thank you! - Apex',
  'Hello {{client_name}}, this is Apex. Following up on our schedule for ${{amount}} due on {{due_date}}. Let me know if that works for you!'
)
ON CONFLICT (id) DO NOTHING;
