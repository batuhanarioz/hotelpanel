-- ============================================================
-- PATCH: Night Audit Engine — Function Fixes
-- Run this in Supabase SQL Editor
-- Fixes: double-posting guard + revenue query
-- ============================================================

-- FIX 1: run_night_audit — guard and revenue now use metadata->>'business_date'
CREATE OR REPLACE FUNCTION public.run_night_audit(
    p_hotel_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business_date     DATE;
    v_next_date         DATE;
    v_rooms_available   INTEGER;
    v_rooms_sold        INTEGER;
    v_occupancy_rate    NUMERIC(5, 2);
    v_revenue_room      NUMERIC(12, 2);
    v_revenue_total     NUMERIC(12, 2);
    v_adr               NUMERIC(12, 2);
    v_revpar            NUMERIC(12, 2);
    v_charges_posted    INTEGER := 0;
    v_res               RECORD;
    v_already_charged   BOOLEAN;
BEGIN
    -- STEP 1: Get or initialize business date
    SELECT business_date
    INTO v_business_date
    FROM public.hotel_business_dates
    WHERE hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        v_business_date := CURRENT_DATE;
        INSERT INTO public.hotel_business_dates (hotel_id, business_date, status)
        VALUES (p_hotel_id, v_business_date, 'open');
    END IF;

    v_next_date := v_business_date + INTERVAL '1 day';

    -- STEP 2: Post daily room charges
    FOR v_res IN
        SELECT
            r.id AS reservation_id,
            r.hotel_id,
            r.guest_id,
            COALESCE(r.nightly_rate, 0) AS daily_rate
        FROM public.reservations r
        WHERE r.hotel_id = p_hotel_id
          AND r.status = 'checked_in'
          AND (r.check_in_date AT TIME ZONE 'UTC')::date <= v_business_date
          AND (r.check_out_date AT TIME ZONE 'UTC')::date > v_business_date
    LOOP
        -- Double-posting guard: use metadata->>'business_date' (not created_at)
        SELECT EXISTS (
            SELECT 1
            FROM public.folio_transactions ft
            WHERE ft.reservation_id = v_res.reservation_id
              AND ft.type = 'room_charge'
              AND ft.description = 'Daily room charge'
              AND (ft.metadata->>'business_date')::date = v_business_date
        ) INTO v_already_charged;

        IF NOT v_already_charged THEN
            INSERT INTO public.folio_transactions (
                hotel_id, reservation_id, guest_id,
                type, amount, description, source, metadata
            ) VALUES (
                v_res.hotel_id, v_res.reservation_id, v_res.guest_id,
                'room_charge', v_res.daily_rate, 'Daily room charge', 'system',
                jsonb_build_object(
                    'business_date', v_business_date,
                    'source', 'night_audit'
                )
            );
            v_charges_posted := v_charges_posted + 1;
        END IF;
    END LOOP;

    -- Log room charges
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'room_charges_posted',
        jsonb_build_object(
            'business_date', v_business_date,
            'charges_posted', v_charges_posted,
            'source', 'system'
        ),
        'NIGHT_AUDIT'
    );

    -- STEP 3: Occupancy
    SELECT COUNT(*) INTO v_rooms_available
    FROM public.rooms
    WHERE hotel_id = p_hotel_id AND status NOT IN ('OOO');

    SELECT COUNT(*) INTO v_rooms_sold
    FROM public.reservations
    WHERE hotel_id = p_hotel_id
      AND status = 'checked_in'
      AND (check_in_date AT TIME ZONE 'UTC')::date <= v_business_date
      AND (check_out_date AT TIME ZONE 'UTC')::date > v_business_date;

    IF v_rooms_available > 0 THEN
        v_occupancy_rate := ROUND((v_rooms_sold::NUMERIC / v_rooms_available::NUMERIC) * 100, 2);
    ELSE
        v_occupancy_rate := 0;
    END IF;

    -- STEP 4: Revenue — filter by metadata->>'business_date' (not created_at::date)
    SELECT
        COALESCE(SUM(CASE WHEN ft.type = 'room_charge' THEN ft.amount ELSE 0 END), 0),
        COALESCE(SUM(ft.amount), 0)
    INTO v_revenue_room, v_revenue_total
    FROM public.folio_transactions ft
    WHERE ft.hotel_id = p_hotel_id
      AND (ft.metadata->>'business_date')::date = v_business_date
      AND ft.type IN ('room_charge', 'service_charge', 'tax');

    IF v_rooms_sold > 0 THEN
        v_adr := ROUND(v_revenue_room / v_rooms_sold, 2);
    ELSE
        v_adr := 0;
    END IF;

    IF v_rooms_available > 0 THEN
        v_revpar := ROUND(v_revenue_room / v_rooms_available, 2);
    ELSE
        v_revpar := 0;
    END IF;

    -- STEP 5: Upsert daily stats
    INSERT INTO public.daily_hotel_stats (
        hotel_id, date,
        rooms_available, rooms_sold, occupancy_rate,
        revenue_room, revenue_total, adr, revpar
    ) VALUES (
        p_hotel_id, v_business_date,
        v_rooms_available, v_rooms_sold, v_occupancy_rate,
        v_revenue_room, v_revenue_total, v_adr, v_revpar
    )
    ON CONFLICT (hotel_id, date) DO UPDATE SET
        rooms_available = EXCLUDED.rooms_available,
        rooms_sold      = EXCLUDED.rooms_sold,
        occupancy_rate  = EXCLUDED.occupancy_rate,
        revenue_room    = EXCLUDED.revenue_room,
        revenue_total   = EXCLUDED.revenue_total,
        adr             = EXCLUDED.adr,
        revpar          = EXCLUDED.revpar;

    -- Log stats
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'daily_stats_generated',
        jsonb_build_object(
            'business_date', v_business_date,
            'rooms_available', v_rooms_available,
            'rooms_sold', v_rooms_sold,
            'occupancy_rate', v_occupancy_rate,
            'revenue_room', v_revenue_room,
            'adr', v_adr,
            'revpar', v_revpar,
            'source', 'system'
        ),
        'NIGHT_AUDIT'
    );

    -- STEP 6: Advance business date
    UPDATE public.hotel_business_dates
    SET business_date = v_next_date, status = 'open'
    WHERE hotel_id = p_hotel_id;

    -- STEP 7: Log audit run
    INSERT INTO public.activity_logs (hotel_id, action, details, module)
    VALUES (
        p_hotel_id, 'night_audit_run',
        jsonb_build_object(
            'business_date_closed', v_business_date,
            'new_business_date', v_next_date,
            'charges_posted', v_charges_posted,
            'rooms_sold', v_rooms_sold,
            'occupancy_rate', v_occupancy_rate,
            'revenue_room', v_revenue_room,
            'adr', v_adr,
            'revpar', v_revpar,
            'source', 'system',
            'run_at', NOW()
        ),
        'NIGHT_AUDIT'
    );

    RETURN jsonb_build_object(
        'success', true,
        'business_date_closed', v_business_date,
        'new_business_date', v_next_date,
        'charges_posted', v_charges_posted,
        'rooms_available', v_rooms_available,
        'rooms_sold', v_rooms_sold,
        'occupancy_rate', v_occupancy_rate,
        'revenue_room', v_revenue_room,
        'revenue_total', v_revenue_total,
        'adr', v_adr,
        'revpar', v_revpar
    );
END;
$$;

-- FIX 2: get_night_audit_status — revenue from metadata->>'business_date'
CREATE OR REPLACE FUNCTION public.get_night_audit_status(
    p_hotel_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_business_date     DATE;
    v_last_audit_at     TIMESTAMPTZ;
    v_stats             RECORD;
    v_today_revenue     NUMERIC(12, 2) := 0;
    v_occupancy_rate    NUMERIC(5, 2) := 0;
BEGIN
    SELECT business_date INTO v_business_date
    FROM public.hotel_business_dates
    WHERE hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        v_business_date := CURRENT_DATE;
    END IF;

    SELECT created_at INTO v_last_audit_at
    FROM public.activity_logs
    WHERE hotel_id = p_hotel_id
      AND action = 'night_audit_run'
      AND module = 'NIGHT_AUDIT'
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT revenue_room, occupancy_rate
    INTO v_stats
    FROM public.daily_hotel_stats
    WHERE hotel_id = p_hotel_id
    ORDER BY date DESC
    LIMIT 1;

    IF FOUND THEN
        v_today_revenue  := v_stats.revenue_room;
        v_occupancy_rate := v_stats.occupancy_rate;
    END IF;

    -- Get posted charges for the last closed business date
    SELECT COALESCE(SUM(ft.amount), 0) INTO v_today_revenue
    FROM public.folio_transactions ft
    WHERE ft.hotel_id = p_hotel_id
      AND ft.type = 'room_charge'
      AND ft.description = 'Daily room charge'
      AND (ft.metadata->>'business_date')::date = v_business_date - INTERVAL '1 day';

    RETURN jsonb_build_object(
        'business_date', v_business_date,
        'last_audit_at', v_last_audit_at,
        'revenue_today', v_today_revenue,
        'occupancy_rate', v_occupancy_rate
    );
END;
$$;
