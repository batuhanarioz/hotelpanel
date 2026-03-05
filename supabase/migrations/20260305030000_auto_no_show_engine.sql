-- 20260305030000_auto_no_show_engine.sql

-- 1. Create hotel_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hotel_settings (
    hotel_id uuid PRIMARY KEY REFERENCES public.hotels(id) ON DELETE CASCADE,
    auto_no_show_mode text DEFAULT 'candidate' CHECK (auto_no_show_mode IN ('off', 'candidate', 'auto')),
    no_show_grace_period_minutes integer DEFAULT 240 CHECK (no_show_grace_period_minutes BETWEEN 120 AND 240),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Add no-show candidate fields to reservations
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS no_show_candidate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_show_candidate_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS no_show_marked_by_user_id uuid REFERENCES auth.users(id);

-- 3. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_no_show_candidate ON public.reservations(hotel_id, no_show_candidate) WHERE no_show_candidate = true;
CREATE INDEX IF NOT EXISTS idx_reservations_status_checkin_date ON public.reservations(hotel_id, status, check_in_date);
CREATE INDEX IF NOT EXISTS idx_hotel_settings_hotel_id ON public.hotel_settings(hotel_id);

-- 4. RPC to detect no-show candidates (System Agent Role)
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
    -- Only service_role can run this detection job
    IF auth.role() != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Detection job can only be triggered by system processes.';
    END IF;

    FOR v_hotel_record IN 
        SELECT hotel_id, no_show_grace_period_minutes 
        FROM public.hotel_settings 
        WHERE auto_no_show_mode = 'candidate'
    LOOP
        -- Find candidates
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
                now(), 'Auto No-Show Candidate Flagged', 'system', 'system', 'auto_no_show_engine'
            );
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'candidates_flagged', v_count);
END;
$$;

-- 5. Seed default settings for existing hotels
INSERT INTO public.hotel_settings (hotel_id)
SELECT id FROM public.hotels
ON CONFLICT (hotel_id) DO NOTHING;
