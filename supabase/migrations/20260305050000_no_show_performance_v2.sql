-- 1. Create essential indexes for Reservation Lifecycle & No-Show Engine
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id_status ON public.reservations(hotel_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id_check_in_date ON public.reservations(hotel_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_id_no_show_candidate ON public.reservations(hotel_id, no_show_candidate);

-- Composite index optimized for the detection UPDATE query
CREATE INDEX IF NOT EXISTS idx_reservations_no_show_detect_composite 
ON public.reservations(hotel_id, status, no_show_candidate, check_in_date);

-- 2. Verify helper to return EXPLAIN output (useful for verification)
CREATE OR REPLACE FUNCTION public.explain_no_show_detection_query()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_explain_output text;
BEGIN
    -- We'll explain a typical query used in detect_no_show_candidates
    EXECUTE 'EXPLAIN SELECT id FROM public.reservations 
             WHERE hotel_id = ''9a99818d-cd23-478f-ae14-90ec4450b2cb'' 
               AND status = ''confirmed'' 
               AND no_show_candidate = false 
               AND check_in_date <= (now() - (240 || '' minutes'')::interval)'
    INTO v_explain_output;
    
    RETURN v_explain_output;
END;
$$;
