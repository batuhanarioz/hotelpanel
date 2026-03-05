-- Final fix for User Table RLS and Recursion
-- This migration uses SECURITY DEFINER functions to break recursion.

-- 1. Helper functions to get current user info without RLS overhead
CREATE OR REPLACE FUNCTION public.get_auth_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_user_hotel_id() 
RETURNS uuid AS $$
  SELECT hotel_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Allow team visibility within hotel" ON public.users;
DROP POLICY IF EXISTS "Admins can manage hotel users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update self" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile or admin view" ON public.users;

-- 3. Create clean, non-recursive policies
-- SELECT: Users see themselves, or ADMIN/MANAGER/FINANCE see everyone in their hotel
CREATE POLICY "user_select_policy" ON public.users 
FOR SELECT TO authenticated 
USING (
    (id = auth.uid()) 
    OR 
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'MANAGER', 'SUPER_ADMIN', 'FINANCE'))
    OR
    (public.get_auth_user_role() = 'SUPER_ADMIN')
);

-- UPDATE: Users can update themselves, or ADMINs can update their hotel staff
CREATE POLICY "user_update_policy" ON public.users 
FOR UPDATE TO authenticated 
USING (
    (id = auth.uid()) 
    OR 
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
)
WITH CHECK (
    (id = auth.uid() AND role = public.get_auth_user_role()) -- Users can't change their own role
    OR 
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
);

-- INSERT: Only ADMINs can insert users into their hotel
CREATE POLICY "user_insert_policy" ON public.users 
FOR INSERT TO authenticated 
WITH CHECK (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
    OR
    (public.get_auth_user_role() = 'SUPER_ADMIN')
);

-- DELETE: Only ADMINs can delete users from their hotel
CREATE POLICY "user_delete_policy" ON public.users 
FOR DELETE TO authenticated 
USING (
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
);
