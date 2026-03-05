-- COMPREHENSIVE RLS RE-RECURSION FIX (Corrected & Hardened)
-- Objective: Fix infinite recursion in RLS by removing subqueries and using SECURITY DEFINER helpers.

-- 1. DROP ALL POTENTIAL DUPLICATE/PROBLEM POLICIES
DROP POLICY IF EXISTS "Tenant Isolation hotels" ON public.hotels;
DROP POLICY IF EXISTS "hotels_select_policy" ON public.hotels;
DROP POLICY IF EXISTS "users_manage_admin_manager" ON public.users;
DROP POLICY IF EXISTS "users_select_same_hotel" ON public.users;
DROP POLICY IF EXISTS "user_select_policy" ON public.users;
DROP POLICY IF EXISTS "user_update_policy" ON public.users;
DROP POLICY IF EXISTS "user_insert_policy" ON public.users;
DROP POLICY IF EXISTS "user_delete_policy" ON public.users;
DROP POLICY IF EXISTS "users_self_all" ON public.users;
DROP POLICY IF EXISTS "users_team_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_manage" ON public.users;

-- 2. REBUILD AUTH HELPERS (SECURITY DEFINER is mandatory to avoid RLS loops)
CREATE OR REPLACE FUNCTION public.get_auth_user_hotel_id() 
RETURNS uuid AS $$
  -- This runs as postgres (bypassing RLS) but returns result for auth.uid()
  SELECT hotel_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin() 
RETURNS boolean AS $$
  SELECT role = 'SUPER_ADMIN'::public.user_role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Provide Aliases for existing user-added policies
CREATE OR REPLACE FUNCTION public.current_hotel_id() RETURNS uuid AS $$ SELECT public.get_auth_user_hotel_id(); $$ LANGUAGE sql STABLE;
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS public.user_role AS $$ SELECT public.get_auth_user_role(); $$ LANGUAGE sql STABLE;

-- 3. HOTELS TABLE POLICY (Crucial for login redirection to work)
-- Allows any authenticated user to see their own hotel's record.
CREATE POLICY "hotels_authenticated_access" ON public.hotels 
FOR SELECT TO authenticated 
USING (
    id = public.get_auth_user_hotel_id() 
    OR 
    public.is_super_admin()
);

-- 4. USERS TABLE POLICIES (Simplified & Non-Recursive)
-- Rule A: EVERYONE can see (and update) their OWN record (Absolute baseline)
CREATE POLICY "users_access_self" ON public.users 
FOR ALL TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Rule B: Team Visibility for specific roles (Admin, Manager, Finance, Audit, etc.)
-- This requires get_auth_user_hotel_id() to be STABLE & SECURITY DEFINER to avoid loops.
CREATE POLICY "users_access_team" ON public.users 
FOR SELECT TO authenticated 
USING (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER', 'FINANCE', 'NIGHT_AUDIT'))
    OR 
    (public.is_super_admin())
);

-- Rule C: Full Management for Admins/Managers
CREATE POLICY "users_access_manager" ON public.users 
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

-- 5. APPLY TRIGGER FIX FOR SIGN-IN SYNC
-- Ensure the update trigger runs correctly without being blocked by RLS
CREATE OR REPLACE FUNCTION public.handle_user_login_sync() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- This update will be allowed by "users_access_self" policy if id=NEW.id
  -- BUT since we are SECURITY DEFINER, it bypasses RLS anyway.
  UPDATE public.users 
  SET last_login = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Ensure trigger is active (if not already)
DROP TRIGGER IF EXISTS trg_sync_last_login ON auth.users;
CREATE TRIGGER trg_sync_last_login AFTER UPDATE OF last_sign_in_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_login_sync();
