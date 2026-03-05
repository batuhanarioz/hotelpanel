-- Reports View Optimization & Fixes
-- Purpose: Align views with enterprise folio_transactions and fix calculation logic.

BEGIN;

-- 1. Daily Revenue View (Fixed room_charge vs accommodation and reversal check)
CREATE OR REPLACE VIEW public.daily_revenue_view WITH (security_invoker='true') AS
 SELECT hotel_id,
    (date_trunc('day'::text, created_at))::date AS report_date,
    sum(
        CASE
            WHEN (item_type = ANY (ARRAY['accommodation'::text, 'room_charge'::text])) THEN amount
            ELSE (0)::numeric
        END) AS room_revenue,
    sum(
        CASE
            WHEN (item_type NOT IN ('accommodation', 'room_charge', 'payment', 'refund', 'discount')) THEN amount
            ELSE (0)::numeric
        END) AS extra_revenue,
    sum(
        CASE 
            WHEN (item_type NOT IN ('payment', 'refund', 'discount')) THEN amount
            ELSE (0)::numeric
        END) AS total_revenue,
    sum(
        CASE
            WHEN (item_type = 'payment'::text) THEN amount
            ELSE (0)::numeric
        END) AS total_collected
   FROM public.folio_transactions
   WHERE is_reversal = false AND status = 'posted'
   GROUP BY hotel_id, ((date_trunc('day'::text, created_at))::date);

-- 2. New View: Revenue by Room Type
CREATE OR REPLACE VIEW public.room_type_revenue_view WITH (security_invoker='true') AS
 SELECT r.hotel_id,
    rt.name as room_type_name,
    sum(ft.amount) as revenue,
    (date_trunc('day'::text, ft.created_at))::date as report_date
   FROM public.folio_transactions ft
   JOIN public.reservations res ON ft.reservation_id = res.id
   JOIN public.room_types rt ON res.room_type_id = rt.id
   JOIN public.rooms r ON res.room_id = r.id
   WHERE ft.is_reversal = false AND ft.status = 'posted'
     AND ft.item_type IN ('accommodation', 'room_charge')
   GROUP BY r.hotel_id, rt.name, (date_trunc('day'::text, ft.created_at))::date;

-- 3. New View: Revenue by Source
CREATE OR REPLACE VIEW public.source_revenue_view WITH (security_invoker='true') AS
 SELECT res.hotel_id,
    COALESCE(res.channel, 'Direct') as source_name,
    sum(ft.amount) as revenue,
    (date_trunc('day'::text, ft.created_at))::date as report_date
   FROM public.folio_transactions ft
   JOIN public.reservations res ON ft.reservation_id = res.id
   WHERE ft.is_reversal = false AND ft.status = 'posted'
     AND ft.item_type NOT IN ('payment', 'refund', 'discount')
   GROUP BY res.hotel_id, res.channel, (date_trunc('day'::text, ft.created_at))::date;

-- 4. Re-grant permissions
GRANT SELECT ON public.daily_revenue_view TO authenticated;
GRANT SELECT ON public.room_type_revenue_view TO authenticated;
GRANT SELECT ON public.source_revenue_view TO authenticated;

COMMIT;
