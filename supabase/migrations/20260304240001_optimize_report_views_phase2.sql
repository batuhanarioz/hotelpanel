-- Reports View Optimization Phase 2
-- Purpose: Support room type occupancy and OOO (Out of Order) impact analytics.

BEGIN;

-- 1. Room Type Occupancy View
CREATE OR REPLACE VIEW public.room_type_occupancy_view WITH (security_invoker='true') AS
 WITH daily_rt_stats AS (
    SELECT 
        rt.hotel_id,
        rt.id as room_type_id,
        rt.name as room_type_name,
        d.report_date,
        count(r.id) as total_rooms,
        count(res.id) FILTER (WHERE res.status IN ('confirmed', 'checked_in', 'checked_out')) as occupied_rooms
    FROM public.room_types rt
    JOIN public.rooms r ON rt.id = r.room_type_id
    CROSS JOIN (
        SELECT (generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days', INTERVAL '1 day'))::date as report_date
    ) d
    LEFT JOIN public.reservations res ON r.id = res.room_id 
        AND d.report_date >= res.check_in_date::date 
        AND d.report_date < res.check_out_date::date
    GROUP BY rt.hotel_id, rt.id, rt.name, d.report_date
 )
 SELECT 
    hotel_id,
    room_type_name,
    report_date,
    total_rooms,
    occupied_rooms,
    CASE 
        WHEN total_rooms > 0 THEN (occupied_rooms::float / total_rooms::float) * 100 
        ELSE 0 
    END as occupancy_rate
 FROM daily_rt_stats;

-- 2. OOO (Out of Order) Impact View
CREATE OR REPLACE VIEW public.ooo_impact_view WITH (security_invoker='true') AS
 SELECT 
    hotel_id,
    room_id,
    (SELECT room_number FROM public.rooms WHERE id = room_id) as room_number,
    count(*) as ooo_days,
    date_trunc('month', report_date)::date as report_month
 FROM public.occupancy_view
 WHERE ooo_rooms > 0
 GROUP BY hotel_id, room_id, report_month;

-- 3. Grants
GRANT SELECT ON public.room_type_occupancy_view TO authenticated;
GRANT SELECT ON public.ooo_impact_view TO authenticated;

COMMIT;
