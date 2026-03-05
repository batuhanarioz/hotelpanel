-- Migration: Enterprise Reservation Lifecycle Engine
-- Description: Adds centralized state transition logic for reservations

-- 1. Ensure Reservations table has the right timestamp columns
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS checked_out_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS no_show_at timestamp with time zone;

-- 2. Create history table
CREATE TABLE IF NOT EXISTS public.reservation_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    hotel_id uuid NOT NULL,
    reservation_id uuid NOT NULL,
    from_status public.reservation_status,
    to_status public.reservation_status NOT NULL,
    changed_by_user_id uuid,
    changed_at timestamp with time zone DEFAULT now(),
    note text,
    source text DEFAULT 'system'
);

-- Note: In Supabase, auth.uid() is the user id within an active session.

-- Allow history table access
ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history in their hotel"
    ON public.reservation_status_history FOR SELECT
    USING (
      hotel_id IN (
        SELECT hotel_id FROM public.users WHERE id = auth.uid()
      )
    );

-- 3. Create the RPC function to change state
CREATE OR REPLACE FUNCTION public.change_reservation_status(
    p_reservation_id uuid,
    p_new_status public.reservation_status,
    p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reservation record;
    v_hotel_id uuid;
    v_current_status public.reservation_status;
    v_user_id uuid;
    v_valid_transition boolean := false;
    v_room_id uuid;
BEGIN
    v_user_id := auth.uid();
    
    -- Get current reservation details
    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    v_hotel_id := v_reservation.hotel_id;
    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    -- Security Check: Is the user part of this hotel?
    IF v_user_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND hotel_id = v_hotel_id) THEN
            RAISE EXCEPTION 'Not authorized to modify this reservation';
        END IF;
    END IF;

    -- State Machine Validation
    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    CASE v_current_status
        WHEN 'inquiry' THEN
            IF p_new_status IN ('confirmed', 'cancelled', 'no_show') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'confirmed' THEN
            IF p_new_status IN ('checked_in', 'cancelled', 'no_show', 'inquiry') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'checked_in' THEN
            IF p_new_status IN ('checked_out', 'confirmed') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'checked_out' THEN
            IF p_new_status IN ('checked_in') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'cancelled' THEN
            IF p_new_status IN ('confirmed', 'inquiry') THEN
                v_valid_transition := true;
            END IF;
        WHEN 'no_show' THEN
            IF p_new_status IN ('confirmed') THEN
                v_valid_transition := true;
            END IF;
        ELSE
            v_valid_transition := false;
    END CASE;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Special State Rules
    IF p_new_status = 'checked_in' AND v_room_id IS NULL THEN
        RAISE EXCEPTION 'Cannot check-in without an assigned room';
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        checked_in_at = CASE WHEN p_new_status = 'checked_in' THEN now() ELSE checked_in_at END,
        checked_out_at = CASE WHEN p_new_status = 'checked_out' THEN now() ELSE checked_out_at END,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END
    WHERE id = p_reservation_id;

    -- Record in History
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source
    ) VALUES (
        v_hotel_id, p_reservation_id, v_current_status, p_new_status, v_user_id, now(), p_note, 'ui'
    );

    -- Side Effects (Housekeeping)
    IF v_room_id IS NOT NULL THEN
        IF p_new_status = 'checked_in' THEN
            -- Check-in means room should probably remain clean if it was clean,
            -- but we can explicitly set it to OCCUPIED if you use that status in rooms.
            UPDATE public.rooms SET status = 'OCCUPIED' WHERE id = v_room_id;
        ELSIF p_new_status = 'checked_out' THEN
            -- Check-out makes the room dirty
            UPDATE public.rooms SET status = 'DIRTY' WHERE id = v_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;
