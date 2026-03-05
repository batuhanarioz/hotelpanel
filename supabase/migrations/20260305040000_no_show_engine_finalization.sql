-- 20260305040000_no_show_engine_finalization.sql

-- 1. Enable pg_cron extension if not enabled (Dashboard usually needs to enable it via UI, but we try here)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the detection job to run every 15 minutes
-- Note: We use the service_role for this job
SELECT cron.schedule(
    'auto-no-show-detection',
    '*/15 * * * *',
    $$ SELECT public.detect_no_show_candidates() $$
);

-- 3. Cleanup Trigger: Automatically clear candidate flag when status changes to something non-pending
CREATE OR REPLACE FUNCTION public.fn_cleanup_no_show_candidate()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes to anything other than 'confirmed' or 'inquiry', 
    -- and it's currently flagged as a candidate, clean it up.
    -- Manual marking of no-show via RPC handled separately, but this is a safety net.
    IF NEW.status IN ('checked_in', 'checked_out', 'cancelled', 'no_show') THEN
        IF OLD.no_show_candidate = true OR NEW.no_show_candidate = true THEN
            NEW.no_show_candidate := false;
            NEW.no_show_candidate_at := NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_cleanup_no_show_candidate ON public.reservations;
CREATE TRIGGER tr_cleanup_no_show_candidate
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.fn_cleanup_no_show_candidate();

-- 4. Improve detect_no_show_candidates to be more robust
CREATE OR REPLACE FUNCTION public.detect_no_show_candidates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count integer := 0;
    v_hotel_record record;
    v_res_record record;
BEGIN
    -- This RPC is designed for system processes (pg_cron)
    -- cron job usually runs as postgres or service_role
    
    FOR v_hotel_record IN 
        SELECT hotel_id, no_show_grace_period_minutes 
        FROM public.hotel_settings 
        WHERE auto_no_show_mode = 'candidate'
    LOOP
        -- Find candidates
        -- Criteria: confirmed, checked_in_at IS NULL, no_show_candidate = false, grace period passed
        FOR v_res_record IN
            UPDATE public.reservations
            SET 
                no_show_candidate = true,
                no_show_candidate_at = now()
            WHERE hotel_id = v_hotel_record.hotel_id
              AND status = 'confirmed'
              AND no_show_candidate = false
              AND check_in_date <= (now() - (v_hotel_record.no_show_grace_period_minutes || ' minutes')::interval)
            RETURNING id, hotel_id, status
        LOOP
            v_count := v_count + 1;
            
            -- Audit Log
            INSERT INTO public.reservation_status_history (
                hotel_id, reservation_id, from_status, to_status, 
                changed_at, note, source, actor_type, actor_label
            ) VALUES (
                v_res_record.hotel_id, v_res_record.id, 'confirmed', 'confirmed', 
                now(), 'Auto No-Show Candidate Flagged (System)', 'system', 'system', 'auto_no_show_engine'
            );
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'candidates_flagged', v_count, 'timestamp', now());
END;
$$;
