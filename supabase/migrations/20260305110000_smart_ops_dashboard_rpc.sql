-- ============================================================
-- Smart Operations Dashboard RPC — v2 (schema-corrected)
-- Fixes:
--   1. folios table → reservation_folio_balance view
--   2. room status enum is UPPERCASE (CLEAN, DIRTY, etc.)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_smart_ops_dashboard(
    p_hotel_id    UUID,
    p_business_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_metrics           JSONB := '{}';
    v_arrivals          JSONB := '[]';
    v_departures        JSONB := '[]';
    v_in_house          JSONB := '[]';
    v_no_show           JSONB := '[]';
    v_unassigned        JSONB := '[]';
    v_room_status       JSONB := '{}';
BEGIN

    -- ── 1. METRICS from daily_hotel_stats ────────────────────
    SELECT jsonb_build_object(
        'occupancy_rate',   COALESCE(s.occupancy_rate, 0),
        'adr',              COALESCE(s.adr, 0),
        'revpar',           COALESCE(s.revpar, 0),
        'revenue_today',    COALESCE(s.revenue_room, 0),
        'rooms_available',  COALESCE(s.rooms_available, 0),
        'rooms_sold',       COALESCE(s.rooms_sold, 0)
    )
    INTO v_metrics
    FROM public.daily_hotel_stats s
    WHERE s.hotel_id = p_hotel_id
    ORDER BY s.date DESC
    LIMIT 1;

    IF v_metrics IS NULL THEN
        -- Fallback: compute live from rooms/reservations
        DECLARE
            v_rooms_avail INTEGER;
            v_rooms_sold  INTEGER;
        BEGIN
            SELECT COUNT(*) INTO v_rooms_avail
            FROM public.rooms
            WHERE hotel_id = p_hotel_id
              AND status::text NOT IN ('OOO', 'OOS');

            SELECT COUNT(*) INTO v_rooms_sold
            FROM public.reservations
            WHERE hotel_id = p_hotel_id
              AND status = 'checked_in'
              AND (check_in_date AT TIME ZONE 'UTC')::date <= p_business_date
              AND (check_out_date AT TIME ZONE 'UTC')::date > p_business_date;

            v_metrics := jsonb_build_object(
                'occupancy_rate',  CASE WHEN v_rooms_avail > 0 THEN ROUND((v_rooms_sold::NUMERIC / v_rooms_avail) * 100, 1) ELSE 0 END,
                'adr',             0,
                'revpar',          0,
                'revenue_today',   0,
                'rooms_available', v_rooms_avail,
                'rooms_sold',      v_rooms_sold
            );
        END;
    END IF;

    -- ── 2. ARRIVALS (confirmed, check_in_date = business_date) ──
    SELECT COALESCE(jsonb_agg(a ORDER BY a->>'arrival_time'), '[]')
    INTO v_arrivals
    FROM (
        SELECT jsonb_build_object(
            'id',            r.id,
            'reservation_number', r.reservation_number,
            'guest_name',    g.full_name,
            'guest_id',      g.id,
            'room_type',     rt.name,
            'room_type_id',  r.room_type_id,
            'assigned_room', rm.room_number,
            'room_id',       r.room_id,
            'arrival_time',  r.check_in_date,
            'check_in_date', r.check_in_date,
            'check_out_date', r.check_out_date,
            'adults_count',  r.adults_count,
            'board_type',    r.board_type
        ) AS a
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.room_types rt ON rt.id = r.room_type_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'confirmed'
          AND (r.check_in_date AT TIME ZONE 'UTC')::date = p_business_date
    ) sub;

    -- ── 3. DEPARTURES (checked_in, check_out_date = business_date) ──
    SELECT COALESCE(jsonb_agg(d ORDER BY d->>'guest_name'), '[]')
    INTO v_departures
    FROM (
        SELECT jsonb_build_object(
            'id',               r.id,
            'reservation_number', r.reservation_number,
            'guest_name',       g.full_name,
            'guest_id',         g.id,
            'room_number',      rm.room_number,
            'room_id',          r.room_id,
            'check_out_date',   r.check_out_date,
            'balance_due',      COALESCE(fb.balance, 0),
            'folio_id',         r.id  -- use reservation id since there's no separate folios table
        ) AS d
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        LEFT JOIN public.reservation_folio_balance fb ON fb.reservation_id = r.id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
          AND (r.check_out_date AT TIME ZONE 'UTC')::date = p_business_date
    ) sub;

    -- ── 4. IN-HOUSE (checked_in) ─────────────────────────────
    SELECT COALESCE(jsonb_agg(ih ORDER BY ih->>'guest_name'), '[]')
    INTO v_in_house
    FROM (
        SELECT jsonb_build_object(
            'id',               r.id,
            'reservation_number', r.reservation_number,
            'guest_name',       g.full_name,
            'guest_id',         g.id,
            'room_number',      rm.room_number,
            'room_id',          r.room_id,
            'check_in_date',    r.check_in_date,
            'check_out_date',   r.check_out_date,
            'nights_remaining', GREATEST(0, (r.check_out_date AT TIME ZONE 'UTC')::date - p_business_date),
            'balance_due',      COALESCE(fb.balance, 0)
        ) AS ih
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.rooms rm ON rm.id = r.room_id
        LEFT JOIN public.reservation_folio_balance fb ON fb.reservation_id = r.id
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
    ) sub;

    -- ── 5. NO-SHOW CANDIDATES ────────────────────────────────
    SELECT COALESCE(jsonb_agg(ns ORDER BY ns->>'no_show_candidate_at'), '[]')
    INTO v_no_show
    FROM (
        SELECT jsonb_build_object(
            'id',                    r.id,
            'reservation_number',    r.reservation_number,
            'guest_name',            g.full_name,
            'guest_id',              g.id,
            'check_in_date',         r.check_in_date,
            'no_show_candidate_at',  r.no_show_candidate_at,
            'delay_minutes',
                EXTRACT(EPOCH FROM (NOW() - r.no_show_candidate_at)) / 60
        ) AS ns
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        WHERE r.hotel_id = p_hotel_id
          AND r.no_show_candidate = true
          AND r.status = 'confirmed'
    ) sub;

    -- ── 6. UNASSIGNED RESERVATIONS ───────────────────────────
    SELECT COALESCE(jsonb_agg(u ORDER BY u->>'check_in_date'), '[]')
    INTO v_unassigned
    FROM (
        SELECT jsonb_build_object(
            'id',                r.id,
            'reservation_number', r.reservation_number,
            'guest_name',        g.full_name,
            'guest_id',          g.id,
            'room_type',         rt.name,
            'room_type_id',      r.room_type_id,
            'check_in_date',     r.check_in_date,
            'check_out_date',    r.check_out_date,
            'adults_count',      r.adults_count
        ) AS u
        FROM public.reservations r
        JOIN public.guests g ON g.id = r.guest_id
        LEFT JOIN public.room_types rt ON rt.id = r.room_type_id
        WHERE r.hotel_id = p_hotel_id
          AND r.room_id IS NULL
          AND r.status = 'confirmed'
        ORDER BY r.check_in_date
    ) sub;

    -- ── 7. ROOM STATUS DISTRIBUTION (uppercase enum) ─────────
    SELECT jsonb_build_object(
        'clean',          COALESCE(SUM(CASE WHEN status::text IN ('CLEAN', 'INSPECTED') THEN 1 ELSE 0 END), 0),
        'dirty',          COALESCE(SUM(CASE WHEN status::text = 'DIRTY' THEN 1 ELSE 0 END), 0),
        'occupied',       COALESCE(SUM(CASE WHEN status::text = 'OCCUPIED' THEN 1 ELSE 0 END), 0),
        'cleaning',       COALESCE(SUM(CASE WHEN status::text IN ('CLEANING', 'CLEANING_IN_PROGRESS') THEN 1 ELSE 0 END), 0),
        'out_of_service', COALESCE(SUM(CASE WHEN status::text IN ('OOO', 'OOS') THEN 1 ELSE 0 END), 0),
        'total',          COUNT(*)
    )
    INTO v_room_status
    FROM public.rooms
    WHERE hotel_id = p_hotel_id;

    RETURN jsonb_build_object(
        'metrics',      v_metrics,
        'arrivals',     v_arrivals,
        'departures',   v_departures,
        'in_house',     v_in_house,
        'no_show',      v_no_show,
        'unassigned',   v_unassigned,
        'room_status',  v_room_status,
        'business_date', p_business_date
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_smart_ops_dashboard(UUID, DATE) TO authenticated;
