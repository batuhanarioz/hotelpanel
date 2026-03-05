-- 20260304040004_enterprise_folio_final_enforcement.sql
-- Module: Enterprise Folio & Payments Upgrade (Final Enforcement)

-- 1. STRICT REFUND VALIDATIONS
-- Clean up existing data: Try to link orphaned refunds to any payment in the same folio
UPDATE public.folio_transactions t
SET related_payment_id = (
    SELECT id FROM public.folio_transactions p 
    WHERE p.reservation_id = t.reservation_id 
    AND p.item_type = 'payment' 
    ORDER BY p.created_at ASC
    LIMIT 1
)
WHERE t.item_type = 'refund' AND t.related_payment_id IS NULL;

-- Ensure refund type always has a related_payment_id
ALTER TABLE public.folio_transactions
DROP CONSTRAINT IF EXISTS check_refund_requirements;

ALTER TABLE public.folio_transactions
ADD CONSTRAINT check_refund_requirements
CHECK (
    (item_type = 'refund' AND related_payment_id IS NOT NULL) OR
    (item_type != 'refund')
) NOT VALID;

-- Trigger to prevent over-refunding
CREATE OR REPLACE FUNCTION public.fn_validate_refund_amount()
RETURNS TRIGGER AS $$
DECLARE
    v_total_refunded DECIMAL(12, 2);
    v_payment_amount DECIMAL(12, 2);
BEGIN
    IF NEW.item_type = 'refund' AND NEW.status != 'reversed' THEN
        -- Get original payment amount
        SELECT amount INTO v_payment_amount
        FROM public.folio_transactions
        WHERE id = NEW.related_payment_id;

        -- Calculate existing refunds for this payment
        SELECT COALESCE(SUM(amount), 0) INTO v_total_refunded
        FROM public.folio_transactions
        WHERE related_payment_id = NEW.related_payment_id
        AND item_type = 'refund'
        AND status != 'reversed'
        AND id != NEW.id;

        IF (v_total_refunded + NEW.amount) > v_payment_amount THEN
            RAISE EXCEPTION 'Total refund amount (%) exceeds the original payment amount (%)', 
                (v_total_refunded + NEW.amount), v_payment_amount;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_refund_amount ON public.folio_transactions;
CREATE TRIGGER trg_validate_refund_amount
BEFORE INSERT OR UPDATE ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_refund_amount();


-- 2. ENHANCED AUDIT LOGGING
-- Update existing trigger to capture actor more reliably
CREATE OR REPLACE FUNCTION public.fn_audit_folio_transactions()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, new_data, actor_id)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.folio_audit_logs (hotel_id, folio_id, transaction_id, action, old_data, new_data, actor_id)
        VALUES (NEW.hotel_id, NEW.reservation_id, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 3. FINAL RLS ENFORCEMENT
-- Drop old policies to clean up
DROP POLICY IF EXISTS "Reception Insert Access" ON public.folio_transactions;
DROP POLICY IF EXISTS "Finance Refund Access" ON public.folio_transactions;
DROP POLICY IF EXISTS "Manager Full Access" ON public.folio_transactions;
DROP POLICY IF EXISTS "Reversal Update Access" ON public.folio_transactions;

-- RECEPTION Policy: Create only payments/charges
CREATE POLICY "RLS_Folio_Reception_Insert" ON public.folio_transactions
FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'RECEPTION'
    AND item_type IN ('payment', 'extra', 'room_charge', 'accommodation')
);

-- FINANCE/ACTUAL_ADMIN Policy: Create refunds/discounts/reversals
CREATE POLICY "RLS_Folio_Finance_Full" ON public.folio_transactions
FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MANAGER')
);

-- Deny DELETE for everyone
DROP POLICY IF EXISTS "Deny Delete Folio" ON public.folio_transactions;
CREATE POLICY "Deny Delete Folio" ON public.folio_transactions
FOR DELETE USING (false);


-- 4. PENDING APPROVALS VIEW (KPI Support)
CREATE OR REPLACE VIEW public.view_pending_folio_approvals AS
SELECT 
    hotel_id,
    COUNT(*) as pending_count,
    SUM(base_amount) as total_pending_value
FROM public.folio_transactions
WHERE status = 'pending_approval'
GROUP BY hotel_id;


-- 5. INDEXES for Audit and Linkages
CREATE INDEX IF NOT EXISTS idx_folio_tr_related_payment ON public.folio_transactions(related_payment_id);
CREATE INDEX IF NOT EXISTS idx_folio_audit_tr_id ON public.folio_audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_folio_audit_hotel_created ON public.folio_audit_logs(hotel_id, created_at DESC);
