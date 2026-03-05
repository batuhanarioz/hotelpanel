-- Migration: Add room_number column to reservations
-- This ensures compatibility with the UI which sends room_number as a reference.

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS room_number text;

COMMENT ON COLUMN public.reservations.room_number IS 'Rezervasyon yapılan oda numarası (referans amaçlı)';
