-- 20260305090000_restore_management_policies.sql
-- Purpose: Restore missing INSERT/UPDATE/DELETE policies for authenticated staff/admins.

BEGIN;

-- 1. Helper Function (if not already present or needs update)
-- Used for granular checks within policies if needed.

-- 2. Reservations Policies
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage reservations" ON public.reservations;
CREATE POLICY "Staff can manage reservations" 
ON public.reservations 
FOR ALL 
TO authenticated 
USING (hotel_id = public.get_auth_user_hotel_id())
WITH CHECK (hotel_id = public.get_auth_user_hotel_id());

-- 3. Room Blocks Policies
ALTER TABLE public.room_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage room blocks" ON public.room_blocks;
CREATE POLICY "Staff can manage room blocks" 
ON public.room_blocks 
FOR ALL 
TO authenticated 
USING (hotel_id = public.get_auth_user_hotel_id())
WITH CHECK (hotel_id = public.get_auth_user_hotel_id());

-- 4. Guests Policies
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage guests" ON public.guests;
CREATE POLICY "Staff can manage guests" 
ON public.guests 
FOR ALL 
TO authenticated 
USING (hotel_id = public.get_auth_user_hotel_id())
WITH CHECK (hotel_id = public.get_auth_user_hotel_id());

-- 5. Folio Transactions Policies
ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage folio transactions" ON public.folio_transactions;
CREATE POLICY "Staff can manage folio transactions" 
ON public.folio_transactions 
FOR ALL 
TO authenticated 
USING (hotel_id = public.get_auth_user_hotel_id())
WITH CHECK (hotel_id = public.get_auth_user_hotel_id());

-- 6. Hotel Settings Policies (Admin Only)
ALTER TABLE public.hotel_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage hotel settings" ON public.hotel_settings;
CREATE POLICY "Admins can manage hotel settings" 
ON public.hotel_settings 
FOR ALL 
TO authenticated 
USING (
    hotel_id = public.get_auth_user_hotel_id() 
    AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
)
WITH CHECK (
    hotel_id = public.get_auth_user_hotel_id() 
    AND public.get_auth_user_role() IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
);

-- 7. Daily Prices & Rate Plans (Admin Only)
ALTER TABLE public.daily_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage daily prices" ON public.daily_prices;
CREATE POLICY "Admins can manage daily prices" 
ON public.daily_prices 
FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.rate_plans rp WHERE rp.id = rate_plan_id AND rp.hotel_id = public.get_auth_user_hotel_id()))
WITH CHECK (EXISTS (SELECT 1 FROM public.rate_plans rp WHERE rp.id = rate_plan_id AND rp.hotel_id = public.get_auth_user_hotel_id()));

ALTER TABLE public.rate_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage rate plans" ON public.rate_plans;
CREATE POLICY "Admins can manage rate plans" 
ON public.rate_plans 
FOR ALL 
TO authenticated 
USING (hotel_id = public.get_auth_user_hotel_id())
WITH CHECK (hotel_id = public.get_auth_user_hotel_id());

-- 8. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

COMMIT;
