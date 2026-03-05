-- ==================================================
-- HOTEL PMS: REPORTS & ANALYTICS VIEWS
-- ==================================================

-- 1. DAILY REVENUE VIEW
-- Aggregates revenue by date, hotel, and type
CREATE OR REPLACE VIEW public.daily_revenue_view AS
SELECT 
    hotel_id,
    date_trunc('day', created_at)::date as report_date,
    SUM(CASE WHEN item_type = 'accommodation' THEN amount ELSE 0 END) as room_revenue,
    SUM(CASE WHEN item_type != 'accommodation' THEN amount ELSE 0 END) as extra_revenue,
    SUM(amount) as total_revenue
FROM public.folio_items
GROUP BY hotel_id, report_date;

-- 2. OCCUPANCY & PERFORMANCE VIEW
-- Calculates room-based metrics per day
CREATE OR REPLACE VIEW public.occupancy_view AS
WITH daily_stats AS (
    SELECT 
        r.hotel_id,
        d.report_date,
        COUNT(DISTINCT r.id) as total_rooms,
        COUNT(DISTINCT res.id) FILTER (WHERE res.status IN ('confirmed', 'checked_in', 'checked_out')) as occupied_rooms,
        COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'out_of_order') as ooo_rooms
    FROM public.rooms r
    CROSS JOIN (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 year', 
            CURRENT_DATE + INTERVAL '1 year', 
            '1 day'::interval
        )::date as report_date
    ) d
    LEFT JOIN public.reservations res ON r.id = res.room_id 
        AND d.report_date >= res.check_in_date::date 
        AND d.report_date < res.check_out_date::date
    GROUP BY r.hotel_id, d.report_date
)
SELECT 
    hotel_id,
    report_date,
    total_rooms,
    occupied_rooms,
    ooo_rooms,
    (total_rooms - ooo_rooms) as available_rooms,
    CASE 
        WHEN (total_rooms - ooo_rooms) > 0 
        THEN (occupied_rooms::float / (total_rooms - ooo_rooms)::float) * 100 
        ELSE 0 
    END as occupancy_rate
FROM daily_stats;

-- 3. ADR & REVPAR VIEW
-- Combines revenue and occupancy for financial KPIs
CREATE OR REPLACE VIEW public.financial_metrics_view AS
SELECT 
    o.hotel_id,
    o.report_date,
    o.occupied_rooms,
    o.available_rooms,
    COALESCE(r.room_revenue, 0) as room_revenue,
    COALESCE(r.total_revenue, 0) as total_revenue,
    CASE 
        WHEN o.occupied_rooms > 0 THEN COALESCE(r.room_revenue, 0) / o.occupied_rooms 
        ELSE 0 
    END as adr,
    CASE 
        WHEN o.available_rooms > 0 THEN COALESCE(r.room_revenue, 0) / o.available_rooms 
        ELSE 0 
    END as revpar
FROM public.occupancy_view o
LEFT JOIN public.daily_revenue_view r ON o.hotel_id = r.hotel_id AND o.report_date = r.report_date;

-- 4. RESERVATION PERFORMANCE VIEW
CREATE OR REPLACE VIEW public.reservation_performance_view AS
SELECT 
    hotel_id,
    date_trunc('day', created_at)::date as booking_date,
    channel as booking_source,
    COUNT(*) as total_reservations,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancellations,
    COUNT(*) FILTER (WHERE status = 'no_show') as no_shows,
    AVG(extract(day from (check_in_date - created_at))) as avg_lead_time,
    SUM(extract(day from (check_out_date - check_in_date))) as total_nights
FROM public.reservations
GROUP BY hotel_id, booking_date, booking_source;

-- 5. GUEST METRICS VIEW
CREATE OR REPLACE VIEW public.guest_metrics_view AS
SELECT 
    hotel_id,
    COUNT(DISTINCT id) as total_guests,
    -- Simplified new vs returning: guest has more than 1 reservation
    COUNT(DISTINCT id) FILTER (
        WHERE id IN (
            SELECT guest_id FROM public.reservations GROUP BY guest_id HAVING COUNT(*) = 1
        )
    ) as new_guests,
    COUNT(DISTINCT id) FILTER (
        WHERE id IN (
            SELECT guest_id FROM public.reservations GROUP BY guest_id HAVING COUNT(*) > 1
        )
    ) as returning_guests
FROM public.guests
GROUP BY hotel_id;

-- ==================================================
-- INDEX SUGGESTIONS FOR PERFORMANCE
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_dates ON public.reservations (hotel_id, check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_folio_items_hotel_date ON public.folio_items (hotel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations (status);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON public.rooms (hotel_id);

-- ==================================================
-- RLS POLICIES FOR VIEWS (Supabase handles this via the underlying tables)
-- ==================================================
-- Views in PostgreSQL inherit the permissions of the owner. 
-- In Supabase, if tables have RLS, the user will only see rows from those tables 
-- they have access to, even when querying through a view, provided the view 
-- is NOT defined with 'SECURITY DEFINER' (default is 'SECURITY INVOKER' essentially).
