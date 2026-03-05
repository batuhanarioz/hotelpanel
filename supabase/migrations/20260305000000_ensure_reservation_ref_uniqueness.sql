-- Add unique constraint for hotel_id and reservation_number
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS uq_reservations_hotel_res_number;

ALTER TABLE public.reservations 
ADD CONSTRAINT uq_reservations_hotel_res_number UNIQUE (hotel_id, reservation_number);

-- Update the trigger function to limit retries and prevent infinite loops
CREATE OR REPLACE FUNCTION public.fn_generate_reservation_number()
RETURNS TRIGGER AS $$
DECLARE
  v_prefix text;
  v_format text;
  v_hotel_name text;
  v_year2 text;
  v_year4 text;
  v_random text;
  v_final_id text;
  v_exists boolean := true;
  v_attempts int := 0;
BEGIN
  -- If reservation_number is already set, don't overwrite
  IF NEW.reservation_number IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get hotel prefix and format
  SELECT 
    COALESCE(reservation_id_prefix, UPPER(SUBSTR(name, 1, 3))), 
    COALESCE(reservation_id_format, 'PREFIX-RANDOM'),
    name
  INTO v_prefix, v_format, v_hotel_name
  FROM public.hotels
  WHERE id = NEW.hotel_id;

  -- Defaults
  v_prefix := COALESCE(v_prefix, 'RES');
  v_year2 := TO_CHAR(CURRENT_DATE, 'YY');
  v_year4 := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Ensure uniqueness with max 5 attempts
  WHILE v_exists AND v_attempts < 5 LOOP
    v_random := public.fn_generate_random_string(6);
    
    -- Replace placeholders
    v_final_id := REPLACE(v_format, 'PREFIX', v_prefix);
    v_final_id := REPLACE(v_final_id, 'YYYY', v_year4);
    v_final_id := REPLACE(v_final_id, 'YY', v_year2);
    v_final_id := REPLACE(v_final_id, 'RANDOM', v_random);
    
    SELECT EXISTS (
        SELECT 1 FROM public.reservations 
        WHERE reservation_number = v_final_id 
        AND hotel_id = NEW.hotel_id
    ) INTO v_exists;
    
    v_attempts := v_attempts + 1;
  END LOOP;
  
  -- Fallback if still exists after 5 attempts (extremely rare)
  IF v_exists THEN
    v_final_id := v_final_id || '-' || public.fn_generate_random_string(3);
  END IF;

  NEW.reservation_number := v_final_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
