-- 20260305090000_folio_ledger_engine.sql
-- Purpose: Implementation of Enterprise Folio Ledger Engine (Immutable Ledger)

-- 1. ARCHIVE OLD FOLIO TRANSACTIONS
ALTER TABLE IF EXISTS public.folio_transactions RENAME TO folio_transactions_legacy;

-- 2. CREATE NEW FOLIO TRANSACTIONS TABLE (IMMUTABLE)
CREATE TABLE public.folio_transactions (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id),
    guest_id UUID REFERENCES public.guests(id),
    
    type TEXT NOT NULL CHECK (type IN ('room_charge', 'service_charge', 'payment', 'refund', 'adjustment', 'tax')),
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    
    description TEXT,
    source TEXT NOT NULL CHECK (source IN ('system', 'ui', 'integration')),
    
    created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional fields for better tracking (optional but recommended for enterprise)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. ENFORCE IMMUTABILITY (PREVENT UPDATE/DELETE)
CREATE OR REPLACE FUNCTION public.fn_enforce_ledger_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Ledger entries are immutable. Use adjustment transactions for corrections.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_folio_immutability
BEFORE UPDATE OR DELETE ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_enforce_ledger_immutability();

-- 4. CREATE FOLIO BALANCE VIEW
CREATE OR REPLACE VIEW public.reservation_folio_balance AS
WITH balances AS (
    SELECT 
        reservation_id,
        SUM(
            CASE 
                WHEN type IN ('room_charge', 'service_charge', 'tax') THEN amount
                WHEN type = 'adjustment' AND amount > 0 THEN amount
                ELSE 0 
            END
        ) as total_charges,
        SUM(
            CASE 
                WHEN type = 'payment' THEN amount
                WHEN type = 'refund' THEN -amount -- Refunds reduce total payments (effectively increasing balance)
                WHEN type = 'adjustment' AND amount < 0 THEN -amount -- Negative adjustment acts like a credit/payment
                ELSE 0 
            END
        ) as total_payments
    FROM public.folio_transactions
    GROUP BY reservation_id
)
SELECT 
    reservation_id,
    total_charges,
    total_payments,
    (total_charges - total_payments) as balance
FROM balances;

-- 5. RPC FUNCTIONS
-- add_payment
CREATE OR REPLACE FUNCTION public.add_payment(
    p_reservation_id UUID,
    p_amount NUMERIC,
    p_method TEXT,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_hotel_id UUID;
    v_guest_id UUID;
    v_tx_id UUID;
BEGIN
    SELECT hotel_id, guest_id INTO v_hotel_id, v_guest_id
    FROM public.reservations
    WHERE id = p_reservation_id;

    INSERT INTO public.folio_transactions (
        hotel_id, reservation_id, guest_id, type, amount, description, source, metadata
    )
    VALUES (
        v_hotel_id, p_reservation_id, v_guest_id, 'payment', p_amount, 
        COALESCE(p_description, 'Payment via ' || p_method), 'ui',
        jsonb_build_object('payment_method', p_method)
    )
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- add_refund
CREATE OR REPLACE FUNCTION public.add_refund(
    p_reservation_id UUID,
    p_amount NUMERIC,
    p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
    v_hotel_id UUID;
    v_guest_id UUID;
    v_tx_id UUID;
BEGIN
    SELECT hotel_id, guest_id INTO v_hotel_id, v_guest_id
    FROM public.reservations
    WHERE id = p_reservation_id;

    INSERT INTO public.folio_transactions (
        hotel_id, reservation_id, guest_id, type, amount, description, source
    )
    VALUES (
        v_hotel_id, p_reservation_id, v_guest_id, 'refund', p_amount, p_reason, 'ui'
    )
    RETURNING id INTO v_tx_id;

    RETURN v_tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. AUTOMATIC ROOM CHARGE
-- Trigger to post room charge when reservation is checked in
CREATE OR REPLACE FUNCTION public.fn_post_initial_room_charge()
RETURNS TRIGGER AS $$
DECLARE
    v_total_price NUMERIC;
BEGIN
    -- Only trigger when status changes to 'checked_in'
    IF NEW.status = 'checked_in' AND (OLD.status IS NULL OR OLD.status != 'checked_in') THEN
        -- Sum up existing room charges to avoid duplicate posting if already posted
        IF NOT EXISTS (
            SELECT 1 FROM public.folio_transactions 
            WHERE reservation_id = NEW.id AND type = 'room_charge'
        ) THEN
            INSERT INTO public.folio_transactions (
                hotel_id, reservation_id, guest_id, type, amount, description, source
            )
            VALUES (
                NEW.hotel_id, NEW.id, NEW.guest_id, 'room_charge', NEW.total_price, 'Initial room charge posting at check-in', 'system'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_initial_room_charge ON public.reservations;
CREATE TRIGGER trg_initial_room_charge
AFTER UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.fn_post_initial_room_charge();

-- 7. ACTIVITY LOGS INTEGRATION
CREATE OR REPLACE FUNCTION public.fn_log_folio_transaction()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.activity_logs (
        hotel_id, user_id, action, details, module, affected_id
    )
    VALUES (
        NEW.hotel_id,
        auth.uid(),
        CASE 
            WHEN NEW.type = 'room_charge' THEN 'folio_charge_added'
            WHEN NEW.type = 'payment' THEN 'folio_payment_added'
            WHEN NEW.type = 'refund' THEN 'folio_refund_added'
            ELSE 'folio_transaction_added'
        END,
        to_jsonb(NEW),
        'FOLIO',
        NEW.reservation_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_folio_transaction
AFTER INSERT ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_log_folio_transaction();

-- 8. INDEXES
CREATE INDEX idx_folio_reservation_id ON public.folio_transactions(reservation_id);
CREATE INDEX idx_folio_hotel_id ON public.folio_transactions(hotel_id);
CREATE INDEX idx_folio_type ON public.folio_transactions(type);

-- 9. RLS POLICIES
ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Folio transactions isolation"
ON public.folio_transactions
FOR ALL
USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

-- 10. CLEANUP (Optional - handle existing legacy data if needed)
-- This logic could be added here to migrate legacy transactions if desired.
-- For now, we keep the legacy table for manual reference.
