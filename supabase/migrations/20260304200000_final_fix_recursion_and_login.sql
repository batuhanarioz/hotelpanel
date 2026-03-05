-- Definitive Fix for RLS Recursion (Login & Visibility)
-- Problem: current_hotel_id/role functions select from users table, which triggers RLS, which calls the functions again.

-- 1. CLEANUP: Drop problematic policies and functions
DROP POLICY IF EXISTS users_manage_admin_manager ON public.users;
DROP POLICY IF EXISTS users_select_same_hotel ON public.users;
DROP POLICY IF EXISTS user_select_policy ON public.users;
DROP POLICY IF EXISTS user_update_policy ON public.users;
DROP POLICY IF EXISTS user_insert_policy ON public.users;
DROP POLICY IF EXISTS user_delete_policy ON public.users;

-- 2. REBUILD HELPERS: Use SECURITY DEFINER to bypass RLS inside the functions
-- These must be created by a superuser (default in Supabase SQL editor) to bypass RLS.
CREATE OR REPLACE FUNCTION public.get_auth_user_hotel_id() 
RETURNS uuid AS $$
  -- We use a subquery that specifically targets the table without hitting recursion
  -- SECURITY DEFINER ensures this runs with creator's permissions (can bypass RLS)
  SELECT hotel_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ALIASES for compatibility with user's existing schema/storage policies
CREATE OR REPLACE FUNCTION public.current_hotel_id() 
RETURNS uuid AS $$
  SELECT hotel_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin() 
RETURNS boolean AS $$
  SELECT role = 'SUPER_ADMIN'::public.user_role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. ROBUST USERS TABLE POLICIES
-- Policy 1: Always allow users to see and manage their own profile (Breaks recursion chain)
CREATE POLICY "users_self_all" ON public.users 
FOR ALL TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 2: Team Visibility for authorized roles
CREATE POLICY "users_team_select" ON public.users 
FOR SELECT TO authenticated 
USING (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER', 'FINANCE', 'NIGHT_AUDIT'))
    OR 
    (public.is_super_admin())
);

-- Policy 3: Management for Admins
CREATE POLICY "users_admin_manage" ON public.users 
FOR ALL TO authenticated 
USING (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER'))
    OR 
    (public.is_super_admin())
)
WITH CHECK (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER'))
    OR 
    (public.is_super_admin())
);

-- 4. FIX ACTIVITY LOGS (also has issues sometimes)
DROP POLICY IF EXISTS activity_logs_select_policy ON public.activity_logs;
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
FOR SELECT TO authenticated
USING (
    (user_id = auth.uid()) 
    OR 
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER'))
);

-- 5. STORAGE POLICIES (Fix for bucket access)
-- The user had issues with storage too. Ensure they are correct but non-recursive.
-- (Storage objects usually don't hit recursion as much but let's be safe)
