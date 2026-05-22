-- SUPABASE DATABASE SETUP SCHEMA FOR MICRO-CRM
-- Copy and paste this script directly into the SQL Editor in your Supabase dashboard (https://supabase.com)
-- This creates the tables and configures cascade deletions and Row-Level Security (RLS) rules
-- representing a private multi-user environment.

-- Ensure authentication extensions are configured
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create crm_solopreneurs table
CREATE TABLE IF NOT EXISTS crm_solopreneurs (
  id TEXT PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  business_name TEXT NOT NULL,
  whatsapp_template TEXT NOT NULL,
  sms_template TEXT NOT NULL
);

-- 2. Create crm_clients table
CREATE TABLE IF NOT EXISTS crm_clients (
  id TEXT PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
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
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_id TEXT NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  due_date TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 4. Create crm_followups (Tasks) table
CREATE TABLE IF NOT EXISTS crm_followups (
  id TEXT PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_id TEXT NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 5. Enable Row-Level Security (RLS) on all tables
ALTER TABLE crm_solopreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_followups ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies to isolate user records
-- Ensure user_id column matches the auth user ID of the session
DROP POLICY IF EXISTS "Users can manage their own solopreneur profile" ON crm_solopreneurs;
CREATE POLICY "Users can manage their own solopreneur profile" ON crm_solopreneurs 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own clients" ON crm_clients;
CREATE POLICY "Users can manage their own clients" ON crm_clients 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own invoices" ON crm_invoices;
CREATE POLICY "Users can manage their own invoices" ON crm_invoices 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own followups" ON crm_followups;
CREATE POLICY "Users can manage their own followups" ON crm_followups 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
