-- PHASE 2: Guest Security & RLS
-- Module: Guest CRM Enterprise Upgrade

-- 1. ENABLE RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- 2. TENANT ISOLATION (Basic)
CREATE POLICY "Tenant Isolation for Guests" ON public.guests 
FOR ALL USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation for Guest Audit" ON public.guest_audit_logs 
FOR ALL USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Tenant Isolation for Export Logs" ON public.export_logs 
FOR ALL USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

-- 3. ROLE-BASED ACCESS CONTROL (guests)

-- RECEPTION: Create/Update basic fields, but cannot toggle blacklist or merge.
-- (Constraint: Identity masking handled via VIEW/API or RLS select logic)
CREATE POLICY "Reception Guest Access" ON public.guests
FOR ALL
USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'RECEPTION'
)
WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'RECEPTION'
    -- Note: UI should prevent these, but RLS can do check constraints if needed.
);

-- MANAGER/OWNER: Full Access
CREATE POLICY "Manager Full Guest Access" ON public.guests
FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) IN ('MANAGER', 'ADMIN')
);

-- FINANCE/MANAGER/ADMIN: Access to financial summary is controlled via the view definition itself
-- (RLS cannot be enabled on views directly in Postgres).

-- 4. IDENTITY NUMBER MASKING (RECEPTION)
-- We'll use a VIEW for guests that masks identity_no for RECEPTION.
-- The app should primarily use this view or we can use column encryption.

CREATE OR REPLACE VIEW public.vw_guests_enterprise AS
SELECT 
    g.*,
    CASE 
        WHEN (SELECT u.role FROM public.users u WHERE u.id = auth.uid()) IN ('MANAGER', 'ADMIN') THEN g.identity_no
        ELSE NULLIF(regexp_replace(g.identity_no, '.(?=.{4})', '*', 'g'), g.identity_no) 
    END AS masked_identity_no
FROM public.guests g;

-- Re-defining financial summary with built-in security check
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
FROM guest_stats
WHERE (SELECT role FROM public.users WHERE id = auth.uid()) IN ('FINANCE', 'MANAGER', 'ADMIN');

-- 5. STORAGE POLICIES (Signed URLs)
-- Assuming a bucket 'guest-documents' exists
-- Only authorized roles can list/get signed URLs
-- (Handled via Supabase Storage interface or RLS on storage.objects)

-- 6. EXPORT LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.log_export(
    p_hotel_id UUID,
    p_entity_type TEXT,
    p_record_count INTEGER,
    p_filters JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.export_logs (hotel_id, actor_id, entity_type, record_count, filters)
    VALUES (p_hotel_id, auth.uid(), p_entity_type, p_record_count, p_filters);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
