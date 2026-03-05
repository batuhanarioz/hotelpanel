-- Final Security & Sync for User Logins
-- 1. Function to sync last login from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_user_login_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET last_login = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Trigger on auth.users (Supabase managed, but we can add triggers)
DROP TRIGGER IF EXISTS trg_sync_last_login ON auth.users;
CREATE TRIGGER trg_sync_last_login
AFTER UPDATE OF last_sign_in_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_login_sync();

-- 3. Relax user_select_policy to allow "Team Visibility" but prepare for masking
DROP POLICY IF EXISTS "user_select_policy" ON public.users;
CREATE POLICY "user_select_policy" ON public.users 
FOR SELECT TO authenticated 
USING (
    (hotel_id = public.get_auth_user_hotel_id())
    OR
    (public.get_auth_user_role() = 'SUPER_ADMIN')
);

-- 4. Audit/Activity Logs RLS update
-- Allow restricted view for staff, full view for Admins
DROP POLICY IF EXISTS "Users can view their own logs" ON public.activity_logs;
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
FOR SELECT TO authenticated
USING (
    (user_id = auth.uid()) -- Can see own logs
    OR
    (hotel_id = public.get_auth_user_hotel_id() AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN')) -- Admins see hotel logs
);
