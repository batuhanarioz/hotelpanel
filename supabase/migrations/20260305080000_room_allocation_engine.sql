-- 20260305080000_room_allocation_engine.sql
-- Module: Room Allocation Engine (Enterprise)

-- 1. Schema Enhancements for Scoring
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.rooms.priority_score IS 'Allocation engine scoring: higher means preferred for auto-assignment.';
COMMENT ON COLUMN public.rooms.features IS 'List of room features (e.g., sea_view, balcony) for matching.';

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_allocation_scoring ON public.rooms(hotel_id, room_type_id, status, priority_score);

-- 3. Room Allocation RPCs

-- A) find_available_rooms
-- Returns rooms available for a specific type and interval
CREATE OR REPLACE FUNCTION public.find_available_rooms(
    p_hotel_id uuid,
    p_room_type_id uuid,
    p_check_in_at timestamp with time zone,
    p_check_out_at timestamp with time zone,
    p_exclude_reservation_id uuid DEFAULT NULL
)
RETURNS TABLE (
    room_id uuid,
    room_number text,
    floor text,
    status public.room_status,
    priority_score integer,
    is_soft_conflict boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH candidate_rooms AS (
        SELECT 
            r.id,
            r.room_number,
            r.floor,
            r.status,
            r.priority_score,
            public.check_room_availability(
                p_hotel_id,
                r.id,
                p_check_in_at,
                p_check_out_at,
                p_exclude_reservation_id
            ) as availability_info
        FROM public.rooms r
        WHERE r.hotel_id = p_hotel_id
          AND r.room_type_id = p_room_type_id
    )
    SELECT 
        c.id as room_id,
        c.room_number,
        c.floor,
        c.status,
        c.priority_score,
        (c.availability_info->>'allow_overbooking')::boolean AND (c.availability_info->'conflicts' != '[]'::jsonb) as is_soft_conflict
    FROM candidate_rooms c
    WHERE (c.availability_info->>'available')::boolean = true;
END;
$$;

-- B) auto_assign_room
-- Assigns the best room for a reservation based on strategy
CREATE OR REPLACE FUNCTION public.auto_assign_room(
    p_reservation_id uuid,
    p_strategy text DEFAULT 'best_score',
    p_allow_dirty boolean DEFAULT false,
    p_reason text DEFAULT 'Auto-assigned by engine'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res record;
    v_best_room record;
    v_assigned_room_id uuid;
BEGIN
    -- 1. Fetch reservation
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Reservation not found');
    END IF;

    -- 2. Find candidates
    WITH candidates AS (
        SELECT 
            f.room_id,
            f.room_number,
            f.status,
            f.priority_score,
            (
                f.priority_score + 
                (CASE WHEN f.status IN ('CLEAN', 'READY', 'INSPECTED') THEN 50 ELSE 0 END) -
                (CASE WHEN f.is_soft_conflict THEN 100 ELSE 0 END)
            ) as total_score
        FROM public.find_available_rooms(
            v_res.hotel_id,
            v_res.room_type_id,
            v_res.check_in_date,
            v_res.check_out_date,
            p_reservation_id
        ) f
        WHERE (p_allow_dirty OR f.status NOT IN ('DIRTY', 'CLEANING'))
    )
    SELECT * INTO v_best_room
    FROM candidates
    ORDER BY total_score DESC, room_number ASC
    LIMIT 1;

    IF v_best_room.room_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'No suitable room available');
    END IF;

    -- 3. Perform Assignment
    UPDATE public.reservations 
    SET room_id = v_best_room.room_id
    WHERE id = p_reservation_id;

    -- 4. Log Activity
    INSERT INTO public.activity_logs (
        hotel_id, 
        action, 
        module, 
        affected_id, 
        details
    ) VALUES (
        v_res.hotel_id,
        'room_assigned',
        'reservations',
        p_reservation_id,
        jsonb_build_object(
            'room_id', v_best_room.room_id,
            'room_number', v_best_room.room_number,
            'reason', p_reason,
            'strategy', p_strategy,
            'score', v_best_room.total_score
        )
    );

    RETURN jsonb_build_object(
        'success', true, 
        'room_id', v_best_room.room_id, 
        'room_number', v_best_room.room_number,
        'score', v_best_room.total_score
    );
END;
$$;

-- C) bulk_auto_assign
-- Batch processes unassigned confirmed reservations
CREATE OR REPLACE FUNCTION public.bulk_auto_assign(
    p_hotel_id uuid,
    p_date_from timestamp with time zone,
    p_date_to timestamp with time zone,
    p_room_type_id uuid DEFAULT NULL,
    p_strategy text DEFAULT 'best_score',
    p_reason text DEFAULT 'Bulk auto-assign'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res_id uuid;
    v_success_count integer := 0;
    v_fail_count integer := 0;
    v_result jsonb;
BEGIN
    FOR v_res_id IN 
        SELECT id 
        FROM public.reservations 
        WHERE hotel_id = p_hotel_id
          AND room_id IS NULL
          AND status = 'confirmed'
          AND check_in_date >= p_date_from
          AND check_in_date <= p_date_to
          AND (p_room_type_id IS NULL OR room_type_id = p_room_type_id)
        ORDER BY check_in_date ASC
    LOOP
        v_result := public.auto_assign_room(v_res_id, p_strategy, false, p_reason);
        IF (v_result->>'success')::boolean THEN
            v_success_count := v_success_count + 1;
        ELSE
            v_fail_count := v_fail_count + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'assigned_count', v_success_count,
        'failed_count', v_fail_count
    );
END;
$$;

-- D) suggest_upgrade_room_types
-- Suggests alternative room types if current one is full
CREATE OR REPLACE FUNCTION public.suggest_upgrade_room_types(
    p_reservation_id uuid
)
RETURNS TABLE (
    room_type_id uuid,
    name text,
    base_price numeric,
    price_difference numeric,
    available_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_res record;
    v_current_price numeric;
BEGIN
    SELECT * INTO v_res FROM public.reservations WHERE id = p_reservation_id;
    
    -- Get current room type price
    SELECT base_price INTO v_current_price FROM public.room_types WHERE id = v_res.room_type_id;

    RETURN QUERY
    SELECT 
        rt.id as room_type_id,
        rt.name,
        rt.base_price,
        (rt.base_price - v_current_price) as price_difference,
        (
            SELECT count(*) 
            FROM public.find_available_rooms(
                v_res.hotel_id,
                rt.id,
                v_res.check_in_date,
                v_res.check_out_date,
                p_reservation_id
            )
        ) as available_count
    FROM public.room_types rt
    WHERE rt.hotel_id = v_res.hotel_id
      AND rt.id != v_res.room_type_id
      AND rt.base_price >= v_current_price
    ORDER BY rt.base_price ASC;
END;
$$;
