-- Migration: Add Reservation Number System
-- This migration implements a custom, searchable reservation number system.

-- 1. Extend hotels table to store reservation ID settings
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS reservation_id_prefix text,
ADD COLUMN IF NOT EXISTS reservation_id_format text DEFAULT 'PREFIX-RANDOM';

COMMENT ON COLUMN public.hotels.reservation_id_prefix IS 'Rezervasyon numarası öneki (Örn: MES)';
COMMENT ON COLUMN public.hotels.reservation_id_format IS 'Rezervasyon numarası formatı (Örn: PREFIX-RANDOM, PREFIX-YYYY-RANDOM)';

-- 2. Extend reservations table to store the custom number
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reservation_number text;

CREATE INDEX IF NOT EXISTS idx_reservations_reservation_number ON public.reservations (reservation_number);
COMMENT ON COLUMN public.reservations.reservation_number IS 'Sistem tarafından üretilen kısa, okunabilir rezervasyon ID';

-- 3. Create a function to generate random alphanumeric strings
CREATE OR REPLACE FUNCTION public.fn_generate_random_string(length int)
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the reservation number generation logic
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

  -- Ensure uniqueness
  WHILE v_exists LOOP
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
  END LOOP;

  NEW.reservation_number := v_final_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS tr_generate_reservation_number ON public.reservations;
CREATE TRIGGER tr_generate_reservation_number
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.fn_generate_reservation_number();

-- 6. Backfill existing reservations
DO $$
DECLARE
  rec RECORD;
  v_format text;
  v_prefix text;
  v_res text;
BEGIN
  FOR rec IN SELECT res.id, h.reservation_id_format, h.reservation_id_prefix, h.name 
           FROM public.reservations res
           JOIN public.hotels h ON res.hotel_id = h.id
           WHERE res.reservation_number IS NULL LOOP
           
    v_prefix := COALESCE(rec.reservation_id_prefix, UPPER(SUBSTR(rec.name, 1, 3)), 'RES');
    v_format := COALESCE(rec.reservation_id_format, 'PREFIX-RANDOM');
    
    v_res := REPLACE(v_format, 'PREFIX', v_prefix);
    v_res := REPLACE(v_res, 'YYYY', TO_CHAR(CURRENT_DATE, 'YYYY'));
    v_res := REPLACE(v_res, 'YY', TO_CHAR(CURRENT_DATE, 'YY'));
    v_res := REPLACE(v_res, 'RANDOM', public.fn_generate_random_string(6));

    UPDATE public.reservations 
    SET reservation_number = v_res
    WHERE id = rec.id;
  END LOOP;
END;
$$;
