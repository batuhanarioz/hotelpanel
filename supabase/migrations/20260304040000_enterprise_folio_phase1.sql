-- PHASE 1: Audit + Reversal + Authorization
-- Module: Folio & Payments Upgrade

-- 1. Table Migration: Rename folio_items to folio_transactions
-- If you prefer keeping the name folio_items, simply replace folio_transactions with folio_items below.
ALTER TABLE IF EXISTS public.folio_items RENAME TO folio_transactions;

-- 2. Add Enterprise Fields
ALTER TABLE public.folio_transactions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'posted' CHECK (status IN ('posted', 'reversed', 'pending_approval')),
ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reversed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reversal_of UUID REFERENCES public.folio_transactions(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid(),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS reference_no TEXT;

-- 3. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.folio_audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    folio_id UUID, -- usually reservation_id
    transaction_id UUID REFERENCES public.folio_transactions(id),
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'REVERSE'
    old_data JSONB,
    new_data JSONB,
    actor_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Trigger Function
CREATE OR REPLACE FUNCTION public.fn_audit_folio_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, new_data)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'INSERT', to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, old_data, new_data)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_folio_transactions ON public.folio_transactions;
CREATE TRIGGER trg_audit_folio_transactions
AFTER INSERT OR UPDATE ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_folio_transactions();

-- 5. RLS Policies (Tenant + Role Based)
ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation
CREATE POLICY "Tenant Isolation for Folio Transactions"
ON public.folio_transactions
FOR ALL
USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

-- Role Based Policies
-- RECEPTION: Can insert (payment, extra), cannot refund
CREATE POLICY "Reception Insert Access"
ON public.folio_transactions
FOR INSERT
WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'RECEPTION'
    AND item_type IN ('payment', 'extra', 'room_charge')
);

-- FINANCE: Can do refunds
CREATE POLICY "Finance Refund Access"
ON public.folio_transactions
FOR INSERT
WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'FINANCE'
    AND item_type = 'refund'
);

-- MANAGER/ADMIN: Everything
CREATE POLICY "Manager Full Access"
ON public.folio_transactions
FOR ALL
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('MANAGER', 'SUPER_ADMIN', 'ADMIN')
);

-- REVERSAL PROTECTION
-- Only authorized users can update to 'reversed'
CREATE POLICY "Reversal Update Access"
ON public.folio_transactions
FOR UPDATE
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('MANAGER', 'FINANCE', 'SUPER_ADMIN')
)
WITH CHECK (status = 'reversed');
