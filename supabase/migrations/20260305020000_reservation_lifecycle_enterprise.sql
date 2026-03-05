-- 20260305020000_reservation_lifecycle_enterprise.sql

-- 1. Add updated_at column to reservations if it doesn't exist
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 1b. Enhanced Audit History Columns
ALTER TABLE public.reservation_status_history
ADD COLUMN IF NOT EXISTS source text DEFAULT 'ui',
ADD COLUMN IF NOT EXISTS actor_type text DEFAULT 'user', -- 'user' or 'system'
ADD COLUMN IF NOT EXISTS actor_label text; -- e.g. 'auto-no-show-job', 'dashboard-drawer'

-- 2. Create trigger to auto-update updated_at for reservations
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reservations_updated_at ON public.reservations;
CREATE TRIGGER tr_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
WHEN (NEW IS DISTINCT FROM OLD)
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 3. USER RPC: change_reservation_status (Role-Based Access Control)
CREATE OR REPLACE FUNCTION public.change_reservation_status(
    p_reservation_id uuid,
    p_new_status public.reservation_status,
    p_hotel_id uuid,
    p_note text DEFAULT NULL,
    p_expected_updated_at timestamp with time zone DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reservation record;
    v_current_status public.reservation_status;
    v_user_id uuid;
    v_valid_transition boolean := false;
    v_room_id uuid;
    v_required_permission text;
    v_source text := 'ui';
BEGIN
    v_user_id := auth.uid();
    
    -- STICK SECURITY: Must be an authenticated user to use this RPC
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'This action requires an authenticated user session.';
    END IF;

    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id AND hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    -- Optimistic Concurrency Check
    IF p_expected_updated_at IS NOT NULL AND v_reservation.updated_at IS NOT NULL THEN
        IF v_reservation.updated_at != p_expected_updated_at THEN
            RAISE EXCEPTION 'Bu rezervasyon başka bir kullanıcı tarafından güncellendi. Lütfen sayfayı yenileyip tekrar deneyin.';
        END IF;
    END IF;

    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    -- Infer Special Actions & Check Valid Transitions
    IF p_new_status = 'confirmed' AND v_current_status IN ('cancelled', 'no_show') THEN
        v_source := 'reinstate';
        v_valid_transition := true;
        v_required_permission := 'RESERVATION_STATUS_REINSTATE';
    ELSIF p_new_status = 'checked_in' AND v_current_status = 'checked_out' THEN
        v_source := 'undo_checkout';
        v_valid_transition := true;
        v_required_permission := 'RESERVATION_STATUS_UNDO_CHECKOUT';
    ELSE
        -- Normal Flow Validation
        CASE v_current_status
            WHEN 'inquiry' THEN
                IF p_new_status IN ('confirmed', 'cancelled', 'no_show') THEN v_valid_transition := true; END IF;
            WHEN 'confirmed' THEN
                IF p_new_status IN ('checked_in', 'cancelled', 'no_show') THEN v_valid_transition := true; END IF;
            WHEN 'checked_in' THEN
                IF p_new_status = 'checked_out' THEN v_valid_transition := true; END IF;
            ELSE
                v_valid_transition := false;
        END CASE;

        -- Mapping permission based on target state
        IF p_new_status = 'checked_in' THEN v_required_permission := 'RESERVATION_STATUS_CHECKIN';
        ELSIF p_new_status = 'checked_out' THEN v_required_permission := 'RESERVATION_STATUS_CHECKOUT';
        ELSIF p_new_status = 'cancelled' THEN v_required_permission := 'RESERVATION_STATUS_CANCEL';
        ELSIF p_new_status = 'no_show' THEN v_required_permission := 'RESERVATION_STATUS_NO_SHOW';
        ELSE v_required_permission := 'RESERVATION_STATUS_UPDATE';
        END IF;
    END IF;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'Invalid status transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Special State Rules
    IF v_source IN ('reinstate', 'undo_checkout') AND p_note IS NULL THEN
         RAISE EXCEPTION 'A reason (note) is required for % actions.', v_source;
    END IF;

    -- Special No-Show Candidate Rule: If marking as no-show, check specific permission
    IF p_new_status = 'no_show' AND v_reservation.no_show_candidate = true THEN
        v_required_permission := 'RESERVATION_NO_SHOW_MARK';
    END IF;

    IF p_new_status = 'checked_in' AND v_room_id IS NULL THEN
        RAISE EXCEPTION 'Cannot check-in without an assigned room';
    END IF;

    -- RBAC Check
    IF NOT public.has_permission(v_required_permission, v_user_id) THEN
        RAISE EXCEPTION 'You do not have permission to perform this action (%)', v_required_permission;
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        checked_in_at = CASE WHEN p_new_status = 'checked_in' THEN now() ELSE checked_in_at END,
        checked_out_at = CASE WHEN p_new_status = 'checked_out' THEN now() ELSE checked_out_at END,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END,
        no_show_candidate = false, -- Reset candidate flag on any manual status change
        no_show_candidate_at = NULL,
        no_show_marked_by_user_id = CASE WHEN p_new_status = 'no_show' THEN v_user_id ELSE no_show_marked_by_user_id END,
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Record in History
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source, actor_type, actor_label
    ) VALUES (
        p_hotel_id, p_reservation_id, v_current_status, p_new_status, v_user_id, now(), p_note, v_source, 'user', 'ui'
    );

    -- Side Effects (Housekeeping / Room Status)
    IF v_room_id IS NOT NULL THEN
        IF p_new_status = 'checked_in' THEN
            UPDATE public.rooms SET status = 'OCCUPIED' WHERE id = v_room_id;
        ELSIF p_new_status = 'checked_out' THEN
            UPDATE public.rooms SET status = 'DIRTY' WHERE id = v_room_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;

-- 4. SYSTEM RPC: system_change_reservation_status (Service Role Only)
CREATE OR REPLACE FUNCTION public.system_change_reservation_status(
    p_reservation_id uuid,
    p_new_status public.reservation_status,
    p_hotel_id uuid,
    p_actor_label text, -- e.g. 'auto-no-show-job'
    p_note text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reservation record;
    v_current_status public.reservation_status;
    v_valid_transition boolean := false;
    v_room_id uuid;
BEGIN
    -- SECURITY: Only service_role (system jobs) can call this
    IF auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: System RPC can only be called by background processes.';
    END IF;

    SELECT * INTO v_reservation
    FROM public.reservations
    WHERE id = p_reservation_id AND hotel_id = p_hotel_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reservation not found';
    END IF;

    v_current_status := v_reservation.status;
    v_room_id := v_reservation.room_id;

    IF v_current_status = p_new_status THEN
        RETURN jsonb_build_object('success', true, 'message', 'Status is already ' || p_new_status);
    END IF;

    -- RESTRICTED SYSTEM TRANSITIONS
    CASE v_current_status
        WHEN 'inquiry' THEN
            IF p_new_status IN ('cancelled') THEN v_valid_transition := true; END IF;
        WHEN 'confirmed' THEN
            -- System can auto-no-show or auto-cancel (if expired)
            IF p_new_status IN ('no_show', 'cancelled') THEN v_valid_transition := true; END IF;
        ELSE
            v_valid_transition := false;
    END CASE;

    IF NOT v_valid_transition THEN
        RAISE EXCEPTION 'System is not allowed to transition from % to %', v_current_status, p_new_status;
    END IF;

    -- Execute Transition
    UPDATE public.reservations
    SET 
        status = p_new_status,
        cancelled_at = CASE WHEN p_new_status = 'cancelled' THEN now() ELSE cancelled_at END,
        no_show_at = CASE WHEN p_new_status = 'no_show' THEN now() ELSE no_show_at END,
        updated_at = now()
    WHERE id = p_reservation_id;

    -- Record in History (actor_type = 'system')
    INSERT INTO public.reservation_status_history (
        hotel_id, reservation_id, from_status, to_status, changed_by_user_id, changed_at, note, source, actor_type, actor_label
    ) VALUES (
        p_hotel_id, p_reservation_id, v_current_status, p_new_status, NULL, now(), p_note, 'system', 'system', p_actor_label
    );

    -- Side Effects (e.g. if system cancels, liberates room, though rooms are usually occupied after check-in)
    -- System usually won't check-out or check-in, so side effects are minimal.

    RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;
