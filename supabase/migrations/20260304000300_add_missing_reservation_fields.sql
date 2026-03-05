-- Migration: Add Missing PMS Columns to Reservations
-- This migration adds fields required for advanced reservation management.

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS infants_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS nightly_rate numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS additional_guests jsonb DEFAULT '[]'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN public.reservations.infants_count IS 'Rezervasyondaki bebek sayısı';
COMMENT ON COLUMN public.reservations.nightly_rate IS 'Gecelik konaklama ücreti';
COMMENT ON COLUMN public.reservations.deposit_amount IS 'Alınan depozito miktarı';
COMMENT ON COLUMN public.reservations.payment_status IS 'Ödeme durumu (paid, unpaid, partial)';
COMMENT ON COLUMN public.reservations.additional_guests IS 'Ek misafirlerin listesi (JSON formatında)';
