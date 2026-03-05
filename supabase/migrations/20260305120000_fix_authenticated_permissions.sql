-- 20260305120000_fix_authenticated_permissions.sql
-- Purpose: Grant necessary permissions to 'authenticated' and 'anon' roles for the public schema.
-- This is required even when RLS is enabled.

BEGIN;

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant all on all tables in public to authenticated role
-- RLS will handle the row-level security, but we need table-level permissions.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 3. Grant select on all tables in public to anon role (for public parts if any)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 4. Grant usage on all sequences in public schema
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Special cases (if any tables are sensitive and shouldn't have DELETE/UPDATE)
-- For now, we allow ALL and let RLS restrict it.

COMMIT;
