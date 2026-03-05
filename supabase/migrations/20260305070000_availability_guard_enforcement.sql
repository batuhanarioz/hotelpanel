-- 20260305070000_availability_guard_enforcement.sql

-- 1. Trigger function to enforce availability rules on reservations
CREATE OR REPLACE FUNCTION public.fn_enforce_reservation_availability()
RETURNS trigger AS $$
DECLARE
    v_allow_overbooking boolean;
    v_conflict_count integer;
    v_critical_block_count integer;
BEGIN
    -- Only check if the reservation is confirmed or checked_in
    IF NEW.status NOT IN ('confirmed', 'checked_in') THEN
        RETURN NEW;
    END IF;

    -- 1. Get overbooking policy
    SELECT allow_overbooking INTO v_allow_overbooking
    FROM public.hotel_settings
    WHERE hotel_id = NEW.hotel_id;

    v_allow_overbooking := COALESCE(v_allow_overbooking, false);

    -- 2. Check for Critical Blocks (Maintenance / Out of Service)
    -- These ALWAYS block reservations regardless of overbooking policy
    SELECT COUNT(*) INTO v_critical_block_count
    FROM public.room_blocks
    WHERE hotel_id = NEW.hotel_id
      AND room_id = NEW.room_id
      AND block_type IN ('maintenance', 'out_of_service', 'OOO')
      AND check_in_at < NEW.check_out_date
      AND check_out_at > NEW.check_in_date;

    IF v_critical_block_count > 0 THEN
        RAISE EXCEPTION 'Oda şu anda bakımda veya kullanım dışı. Bu tarihlerde rezervasyon yapılamaz. (AVAILABILITY_CRITICAL_BLOCK)';
    END IF;

    -- 3. Check for Overlapping Reservations if overbooking is NOT allowed
    IF NOT v_allow_overbooking THEN
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.reservations
        WHERE hotel_id = NEW.hotel_id
          AND room_id = NEW.room_id
          AND status IN ('confirmed', 'checked_in')
          AND id != NEW.id -- Exclude self
          AND check_in_date < NEW.check_out_date
          AND check_out_date > NEW.check_in_date;

        IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'Bu tarihlerde oda dolu ve fazla rezervasyon (overbooking) kapalı. (AVAILABILITY_OVERLAP_CONFLICT)';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Apply Trigger to reservations table
DROP TRIGGER IF EXISTS tr_enforce_reservation_availability ON public.reservations;
CREATE TRIGGER tr_enforce_reservation_availability
BEFORE INSERT OR UPDATE OF room_id, check_in_date, check_out_date, status
ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.fn_enforce_reservation_availability();

-- 3. Trigger for room_blocks (Optional but recommended: Prevent creating maintenance if room occupied)
-- Actually, let's just enforce it for reservations as requested. Overbooking is usually a reservation-side issue.
-- But we can add a comment about it.
COMMENT ON TRIGGER tr_enforce_reservation_availability ON public.reservations IS 'Enforces room availability and overbooking policy at the database level.';
