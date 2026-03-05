-- Enterprise PMS Upgrade: Multi-currency Folio, Ledger Model, and Maintenance Enhancements
-- Created: 2026-03-04
-- Module: Folio, Housekeeping, Maintenance

-- 1. Extend Folio Items for Multi-currency and Ledger Accuracy
ALTER TABLE public.folio_items 
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate_to_base DECIMAL(12, 4) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12, 2), -- Amount converted to property base currency
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_reversal BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reversed_item_id UUID REFERENCES public.folio_items(id);

COMMENT ON COLUMN public.folio_items.base_amount IS 'The amount calculated in the hotel''s base currency at the time of transaction.';

-- 2. Enhance Reservations for Multi-currency support
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'TRY';

-- 3. Extend Maintenance Tickets for Staff Assignment and Categories
-- (Note: Category and Priority might already exist from previous phase2 migration, adding safeguard)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='maintenance_tickets' AND column_name='assigned_staff_id') THEN
        ALTER TABLE public.maintenance_tickets ADD COLUMN assigned_staff_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='maintenance_tickets' AND column_name='category') THEN
        ALTER TABLE public.maintenance_tickets ADD COLUMN category TEXT;
    END IF;
END $$;

-- PART 1: Run these command first to expand the enum (PostgreSQL requires a commit before these can be used)
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'QC_PENDING';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'READY';

-- PART 2: Run the rest of the script AFTER running Part 1
-- Check existing enum/constraint for room status and update if needed.
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_status_check 
CHECK (status IN ('CLEAN', 'DIRTY', 'IN_PROGRESS', 'QC_PENDING', 'READY', 'OOO', 'CLEANING', 'INSPECTED', 'OCCUPIED'));

-- 5. Trigger to automatically conversion to base currency if not provided
CREATE OR REPLACE FUNCTION public.fn_folio_item_base_amount_sync()
RETURNS TRIGGER AS $$
DECLARE
    hotel_base_currency TEXT;
BEGIN
    -- This is a simplified version, in a real scenario we might fetch actual rates or from hotel settings
    IF NEW.base_amount IS NULL THEN
        NEW.base_amount := NEW.amount * NEW.exchange_rate_to_base;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_folio_item_base_amount_sync ON public.folio_items;
CREATE TRIGGER trg_folio_item_base_amount_sync
BEFORE INSERT OR UPDATE ON public.folio_items
FOR EACH ROW EXECUTE FUNCTION public.fn_folio_item_base_amount_sync();

-- 6. View for Ledger Summary (Optional enhancement)
CREATE OR REPLACE VIEW public.folio_ledger_summary AS
SELECT 
    reservation_id,
    currency_code,
    SUM(CASE WHEN item_type IN ('charge', 'extra', 'room_charge') THEN amount ELSE 0 END) as total_debit,
    SUM(CASE WHEN item_type IN ('payment') THEN amount ELSE 0 END) as total_credit,
    SUM(CASE WHEN item_type IN ('discount') THEN amount ELSE 0 END) as total_discount,
    SUM(CASE WHEN item_type IN ('refund') THEN amount ELSE 0 END) as total_refund,
    (SUM(CASE WHEN item_type IN ('charge', 'extra', 'room_charge') THEN amount ELSE 0 END) - 
     SUM(CASE WHEN item_type IN ('payment', 'discount') THEN amount ELSE 0 END) + 
     SUM(CASE WHEN item_type IN ('refund') THEN amount ELSE 0 END)) as balance
FROM public.folio_items
GROUP BY reservation_id, currency_code;
