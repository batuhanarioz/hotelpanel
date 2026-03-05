-- PHASE 2: Multi-Currency & Reference Tracking
-- Module: Folio & Payments Upgrade

-- 1. Create Currency Rates Table
CREATE TABLE IF NOT EXISTS public.currency_rates (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    currency_code TEXT NOT NULL, -- 'USD', 'EUR', etc.
    rate_to_base DECIMAL(12, 4) NOT NULL, -- e.g. 1 USD = 34.50 TRY
    source TEXT DEFAULT 'manual', -- 'manual', 'tcmb', etc.
    rate_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hotel_id, currency_code, rate_date)
);

-- 2. Extend Folio Transactions for Multi-currency and Refund Linkage
ALTER TABLE public.folio_transactions
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'TRY',
ADD COLUMN IF NOT EXISTS exchange_rate_to_base DECIMAL(12, 4) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS base_amount DECIMAL(12, 2), -- Amount in hotel base currency
ADD COLUMN IF NOT EXISTS related_payment_id UUID REFERENCES public.folio_transactions(id); -- For refunds

COMMENT ON COLUMN public.folio_transactions.related_payment_id IS 'Link from refund to the original payment transaction.';

-- 3. Trigger for Base Amount Calculation
CREATE OR REPLACE FUNCTION public.fn_calculate_folio_base_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically calculate base_amount if not provided
    IF NEW.base_amount IS NULL OR NEW.base_amount = 0 THEN
        NEW.base_amount := NEW.amount * COALESCE(NEW.exchange_rate_to_base, 1.0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_folio_base_amount ON public.folio_transactions;
CREATE TRIGGER trg_calculate_folio_base_amount
BEFORE INSERT OR UPDATE ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_folio_base_amount();

-- 4. RLS for Currency Rates
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation for Currency Rates"
ON public.currency_rates
FOR ALL
USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_folio_transactions_reservation_id ON public.folio_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_folio_transactions_status ON public.folio_transactions(status);
CREATE INDEX IF NOT EXISTS idx_currency_rates_lookup ON public.currency_rates(hotel_id, currency_code, rate_date);
