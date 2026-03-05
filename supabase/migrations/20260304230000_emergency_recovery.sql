-- EMERGENCY SCHEMA, RLS & PERMISSION RECOVERY
-- Purpose: Fix "permission denied for table guests" (Code 42501) and restore data visibility.

BEGIN;

-- 1. Ensure Schema Usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Repair core functions (using SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_auth_user_hotel_id() 
RETURNS uuid AS $$
  SELECT hotel_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_user_role() 
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Provide convenient aliases
CREATE OR REPLACE FUNCTION public.current_hotel_id() RETURNS uuid AS $$ SELECT public.get_auth_user_hotel_id(); $$ LANGUAGE sql STABLE SECURITY DEFINER;
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS public.user_role AS $$ SELECT public.get_auth_user_role(); $$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Explicit Grants (This fixes the 42501 error)
GRANT SELECT ON public.hotels TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.rooms TO authenticated;
GRANT SELECT ON public.room_types TO authenticated;
GRANT SELECT ON public.reservations TO authenticated;
GRANT SELECT ON public.guests TO authenticated;
GRANT SELECT ON public.folio_transactions TO authenticated;
GRANT SELECT ON public.housekeeping_tasks TO authenticated;
GRANT SELECT ON public.maintenance_tickets TO authenticated;

-- 4. Rebuild Enterprise Guest View (If CASCADE dropped it)
DROP VIEW IF EXISTS public.vw_guests_enterprise;
CREATE OR REPLACE VIEW public.vw_guests_enterprise WITH (security_invoker='true') AS
 SELECT g.*,
        CASE
            WHEN (public.current_user_role() = ANY (ARRAY['MANAGER'::public.user_role, 'ADMIN'::public.user_role])) THEN g.identity_no
            ELSE NULLIF(regexp_replace(g.identity_no, '.(?=.{4})'::text, '*'::text, 'g'::text), g.identity_no)
        END AS masked_identity_no
   FROM public.guests g
   WHERE g.is_active = true;

GRANT SELECT ON public.vw_guests_enterprise TO authenticated;

-- 5. Restore RLS Baseline Policies
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_policy_reservations" ON public.reservations;
CREATE POLICY "select_policy_reservations" ON public.reservations FOR SELECT TO authenticated USING (hotel_id = public.get_auth_user_hotel_id());

DROP POLICY IF EXISTS "select_policy_folio_tx" ON public.folio_transactions;
CREATE POLICY "select_policy_folio_tx" ON public.folio_transactions FOR SELECT TO authenticated USING (hotel_id = public.get_auth_user_hotel_id());

DROP POLICY IF EXISTS "select_policy_guests" ON public.guests;
CREATE POLICY "select_policy_guests" ON public.guests FOR SELECT TO authenticated USING (hotel_id = public.get_auth_user_hotel_id());

DROP POLICY IF EXISTS "select_policy_rooms" ON public.rooms;
CREATE POLICY "select_policy_rooms" ON public.rooms FOR SELECT TO authenticated USING (hotel_id = public.get_auth_user_hotel_id());

COMMIT;
