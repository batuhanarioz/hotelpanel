-- PHASE 1: Data Model, Constraints, Audit and Views
-- Module: Guest CRM Enterprise Upgrade

-- 1. EXTEND GUESTS TABLE
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS identity_type TEXT DEFAULT 'tc' CHECK (identity_type IN ('tc', 'passport', 'other', 'none')),
ADD COLUMN IF NOT EXISTS vip_level TEXT, -- e.g., 'silver', 'gold', 'platinum'
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS merged_into_guest_id UUID REFERENCES public.guests(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS blacklist_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blacklist_changed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. NORMALIZATION & CONSTRAINTS (DUPLICATE PREVENTION)
-- Ensure lowercase emails and normalized phones (handled in app side but enforced here if possible)
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_phone_tenant_active 
ON public.guests (hotel_id, phone) 
WHERE is_active = true AND phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_email_tenant_active 
ON public.guests (hotel_id, LOWER(email)) 
WHERE is_active = true AND email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_identity_tenant_active 
ON public.guests (hotel_id, identity_no) 
WHERE is_active = true AND identity_no IS NOT NULL;

-- 3. AUDIT LOGS FOR GUESTS
CREATE TABLE IF NOT EXISTS public.guest_audit_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    guest_id UUID REFERENCES public.guests(id),
    action TEXT NOT NULL, -- 'created', 'updated', 'merged', 'blacklist_toggle', 'vip_changed', 'document_download'
    old_data JSONB,
    new_data JSONB,
    actor_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 4. EXPORT LOGS
CREATE TABLE IF NOT EXISTS public.export_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    actor_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    entity_type TEXT NOT NULL, -- 'guests', 'folios', 'reservations'
    record_count INTEGER,
    filters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRIGGER FOR GUEST UPDATES & AUDIT
CREATE OR REPLACE FUNCTION public.fn_audit_guest_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_action := 'created';
        INSERT INTO public.guest_audit_logs (hotel_id, guest_id, action, new_data)
        VALUES (NEW.hotel_id, NEW.id, v_action, to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.is_blacklisted IS DISTINCT FROM NEW.is_blacklisted) THEN
            v_action := 'blacklist_toggle';
        ELSIF (OLD.vip_level IS DISTINCT FROM NEW.vip_level OR OLD.is_vip IS DISTINCT FROM NEW.is_vip) THEN
            v_action := 'vip_changed';
        ELSIF (OLD.is_active IS DISTINCT FROM NEW.is_active AND NEW.is_active = false AND NEW.merged_into_guest_id IS NOT NULL) THEN
            v_action := 'merged';
        ELSE
            v_action := 'updated';
        END IF;

        INSERT INTO public.guest_audit_logs (hotel_id, guest_id, action, old_data, new_data)
        VALUES (NEW.hotel_id, NEW.id, v_action, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_guest_changes ON public.guests;
CREATE TRIGGER trg_audit_guest_changes
AFTER INSERT OR UPDATE ON public.guests
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_guest_changes();

-- 6. GUEST MERGE FUNCTION
CREATE OR REPLACE FUNCTION public.fn_merge_guests(
    p_hotel_id UUID,
    p_parent_guest_id UUID,
    p_child_guest_id UUID,
    p_actor_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- 1. Security Check: Are they in the same hotel?
    IF NOT EXISTS (
        SELECT 1 FROM public.guests 
        WHERE id IN (p_parent_guest_id, p_child_guest_id) 
        AND hotel_id = p_hotel_id
    ) THEN
        RAISE EXCEPTION 'Guests do not belong to the specified hotel.';
    END IF;

    -- 2. Transfer Reservations
    UPDATE public.reservations
    SET guest_id = p_parent_guest_id
    WHERE guest_id = p_child_guest_id;

    -- 3. Mark child as inactive and merged
    UPDATE public.guests
    SET is_active = false,
        merged_into_guest_id = p_parent_guest_id,
        updated_at = NOW(),
        updated_by = p_actor_id
    WHERE id = p_child_guest_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 7. FINANCIAL SUMMARY VIEW (RLS PROTECTED)
CREATE OR REPLACE VIEW public.guest_financial_summary AS
WITH guest_stats AS (
    SELECT 
        g.id as guest_id,
        g.hotel_id,
        SUM(CASE WHEN t.item_type NOT IN ('payment', 'discount', 'refund') AND t.status = 'posted' THEN t.base_amount ELSE 0 END) as total_charges,
        SUM(CASE WHEN t.item_type IN ('payment', 'discount') AND t.status = 'posted' THEN t.base_amount ELSE 0 END) as total_payments,
        SUM(CASE WHEN t.item_type = 'refund' AND t.status = 'posted' THEN t.base_amount ELSE 0 END) as total_refunds,
        MAX(CASE WHEN t.item_type = 'payment' THEN t.created_at ELSE NULL END) as last_payment_date
    FROM public.guests g
    LEFT JOIN public.reservations r ON r.guest_id = g.id
    LEFT JOIN public.folio_transactions t ON t.reservation_id = r.id
    GROUP BY g.id, g.hotel_id
)
SELECT 
    guest_id,
    hotel_id,
    total_charges as total_spent,
    total_payments as total_paid,
    (total_charges - total_payments) as open_balance,
    last_payment_date
FROM guest_stats;
