-- 20260305060000_availability_guard_engine.sql

-- 1. Modify room_blocks table to match the requirements
DO $$ 
BEGIN
    -- Rename columns if they exist from previous temporary implementations
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='room_blocks' AND column_name='start_date') THEN
        ALTER TABLE public.room_blocks RENAME COLUMN start_date TO check_in_at;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='room_blocks' AND column_name='end_date') THEN
        ALTER TABLE public.room_blocks RENAME COLUMN end_date TO check_out_at;
    END IF;
END $$;

-- Change types to timestamptz for precision
ALTER TABLE public.room_blocks 
ALTER COLUMN check_in_at TYPE timestamp with time zone,
ALTER COLUMN check_out_at TYPE timestamp with time zone;

-- Add block_type constraint and created_by
ALTER TABLE public.room_blocks 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
DROP CONSTRAINT IF EXISTS room_blocks_block_type_check;

-- Ensure block_type is valid
-- block_type options: maintenance, manual_block, out_of_service
-- We'll keep 'OOO' as a legacy support if needed, but primary types are maintenance, manual_block

-- 2. Update hotel_settings
ALTER TABLE public.hotel_settings 
ADD COLUMN IF NOT EXISTS allow_overbooking boolean DEFAULT false;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reservations_availability_lookup 
ON public.reservations(hotel_id, room_id, check_in_date, check_out_date) 
WHERE status IN ('confirmed', 'checked_in');

CREATE INDEX IF NOT EXISTS idx_room_blocks_availability_lookup 
ON public.room_blocks(hotel_id, room_id, check_in_at, check_out_at);

-- 4. Availability Guard Engine RPC
CREATE OR REPLACE FUNCTION public.check_room_availability(
    p_hotel_id uuid,
    p_room_id uuid,
    p_check_in_at timestamp with time zone,
    p_check_out_at timestamp with time zone,
    p_exclude_reservation_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_allow_overbooking boolean;
    v_conflicts jsonb := '[]'::jsonb;
    v_block_conflicts jsonb := '[]'::jsonb;
    v_has_critical_block boolean := false;
BEGIN
    -- 1. Check hotel settings for overbooking
    SELECT allow_overbooking INTO v_allow_overbooking
    FROM public.hotel_settings
    WHERE hotel_id = p_hotel_id;

    v_allow_overbooking := COALESCE(v_allow_overbooking, false);

    -- 2. Check for reservation overlaps
    -- Overlap Rule: (New.In < Old.Out) AND (New.Out > Old.In)
    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'guest_name', (SELECT full_name FROM public.guests WHERE id = guest_id),
        'status', status,
        'check_in', check_in_date,
        'check_out', check_out_date,
        'type', 'reservation'
    ))
    INTO v_conflicts
    FROM public.reservations
    WHERE hotel_id = p_hotel_id
      AND room_id = p_room_id
      AND status IN ('confirmed', 'checked_in')
      AND check_in_date < p_check_out_at
      AND check_out_date > p_check_in_at
      AND (p_exclude_reservation_id IS NULL OR id != p_exclude_reservation_id);

    -- 3. Check for room block overlaps
    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'block_type', block_type,
        'reason', reason,
        'check_in', check_in_at,
        'check_out', check_out_at,
        'type', 'block'
    ))
    INTO v_block_conflicts
    FROM public.room_blocks
    WHERE hotel_id = p_hotel_id
      AND room_id = p_room_id
      AND check_in_at < p_check_out_at
      AND check_out_at > p_check_in_at;

    -- Check if any block is critical (maintenance or out_of_service)
    SELECT EXISTS (
        SELECT 1 FROM public.room_blocks
        WHERE hotel_id = p_hotel_id
          AND room_id = p_room_id
          AND block_type IN ('maintenance', 'out_of_service', 'OOO')
          AND check_in_at < p_check_out_at
          AND check_out_at > p_check_in_at
    ) INTO v_has_critical_block;

    -- 4. Determine final availability
    -- If overbooking is OFF: any reservation conflict makes it unavailable.
    -- If room is in maintenance/OOO: always unavailable regardless of overbooking policy.
    
    RETURN jsonb_build_object(
        'available', (
            CASE 
                WHEN v_has_critical_block THEN false
                WHEN NOT v_allow_overbooking AND v_conflicts IS NOT NULL THEN false
                ELSE true
            END
        ),
        'allow_overbooking', v_allow_overbooking,
        'conflicts', COALESCE(v_conflicts, '[]'::jsonb) || COALESCE(v_block_conflicts, '[]'::jsonb),
        'has_critical_block', v_has_critical_block
    );
END;
$$;

-- 5. Audit Logging Trigger for room_blocks
CREATE OR REPLACE FUNCTION public.audit_room_blocks_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.activity_logs (hotel_id, user_id, action, module, affected_id, details)
        VALUES (NEW.hotel_id, NEW.created_by, 'CREATE_BLOCK', 'rooms', NEW.id, jsonb_build_object('block_type', NEW.block_type, 'room_id', NEW.room_id, 'reason', NEW.reason));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.activity_logs (hotel_id, user_id, action, module, affected_id, details)
        VALUES (OLD.hotel_id, auth.uid(), 'DELETE_BLOCK', 'rooms', OLD.id, jsonb_build_object('block_type', OLD.block_type, 'room_id', OLD.room_id));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_room_blocks
AFTER INSERT OR DELETE ON public.room_blocks
FOR EACH ROW EXECUTE FUNCTION public.audit_room_blocks_change();
