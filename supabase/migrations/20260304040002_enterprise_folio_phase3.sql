-- PHASE 3: Journal Entry & General Ledger Core
-- Module: Folio & Payments Upgrade

-- 1. Chart of Accounts
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    code TEXT NOT NULL, -- e.g. '100.01', '600.01'
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    is_system BOOLEAN DEFAULT false, -- True for protected system accounts
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hotel_id, code)
);

-- 2. Journal Entries (Header)
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    source_type TEXT DEFAULT 'folio', -- 'folio', 'manual', 'payroll'
    source_id UUID, -- Reference to folio_transaction_id or other origin
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Journal Lines (Double Entry Body)
CREATE TABLE IF NOT EXISTS public.journal_lines (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.chart_of_accounts(id),
    debit DECIMAL(12, 2) DEFAULT 0,
    credit DECIMAL(12, 2) DEFAULT 0,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (debit >= 0 AND credit >= 0 AND (debit = 0 OR credit = 0))
);

-- 4. Automatically insert default accounts for new hotels (Simplified)
CREATE OR REPLACE FUNCTION public.fn_initialize_hotel_accounts()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.chart_of_accounts (hotel_id, code, name, type, is_system) VALUES
    (NEW.id, '100', 'Kasa (Cash)', 'asset', true),
    (NEW.id, '102', 'Banka (Banks)', 'asset', true),
    (NEW.id, '120', 'Alıcılar (Guest Ledger / AR)', 'asset', true),
    (NEW.id, '600', 'Oda Gelirleri (Room Revenue)', 'revenue', true),
    (NEW.id, '602', 'Ekstra Gelirler (Extra Revenue)', 'revenue', true),
    (NEW.id, '610', 'İndirimler (Discounts)', 'expense', true); -- Or contra-revenue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Auto-Journal Trigger for Folio Transactions
CREATE OR REPLACE FUNCTION public.fn_sync_folio_to_journal()
RETURNS TRIGGER AS $$
DECLARE
    target_journal_id UUID;
    v_acc_ar UUID;
    v_acc_rev UUID;
    v_acc_cash UUID;
    v_acc_disc UUID;
BEGIN
    -- Get System Accounts
    SELECT id INTO v_acc_ar FROM public.chart_of_accounts WHERE hotel_id = NEW.hotel_id AND code = '120';
    SELECT id INTO v_acc_rev FROM public.chart_of_accounts WHERE hotel_id = NEW.hotel_id AND code = '600';
    SELECT id INTO v_acc_cash FROM public.chart_of_accounts WHERE hotel_id = NEW.hotel_id AND code = '100';
    SELECT id INTO v_acc_disc FROM public.chart_of_accounts WHERE hotel_id = NEW.hotel_id AND code = '610';

    -- Only sync 'posted' or 'reversed' items. Ignore 'pending_approval'.
    IF NEW.status = 'posted' OR NEW.status = 'reversed' THEN
        -- Create Journal Header
        INSERT INTO public.journal_entries (hotel_id, transaction_date, description, source_type, source_id, created_by)
        VALUES (NEW.hotel_id, NEW.transaction_date, NEW.description, 'folio', NEW.id, NEW.created_by)
        RETURNING id INTO target_journal_id;

        -- Double Entry Logic based on item_type
        CASE NEW.item_type
            WHEN 'room_charge', 'charge', 'extra', 'accommodation' THEN
                -- Debit AR (Guest owes more), Credit Revenue
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_rev, 0, ABS(NEW.base_amount));
            
            WHEN 'payment' THEN
                -- Debit Cash (Hotel gets money), Credit AR (Guest owes less)
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_cash, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, 0, ABS(NEW.base_amount));

            WHEN 'discount' THEN
                -- Debit Discount (Expense/Contra-Rev), Credit AR (Guest owes less)
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_disc, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, 0, ABS(NEW.base_amount));

            WHEN 'refund' THEN
                -- Debit AR (Guest balance goes up), Credit Cash (Hotel gives money)
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_cash, 0, ABS(NEW.base_amount));
                
            WHEN 'tax', 'cancellation_fee' THEN
                -- Debit AR, Credit Revenue (Similar to room charges)
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_ar, ABS(NEW.base_amount), 0);
                INSERT INTO public.journal_lines (journal_entry_id, account_id, debit, credit) VALUES (target_journal_id, v_acc_rev, 0, ABS(NEW.base_amount));
                
            ELSE
                -- Skip journal lines for unknown types
                NULL;
        END CASE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_folio_to_journal ON public.folio_transactions;
CREATE TRIGGER trg_sync_folio_to_journal
AFTER INSERT OR UPDATE ON public.folio_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_folio_to_journal();

-- 6. RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Isolation Chart of Accounts" ON public.chart_of_accounts FOR ALL USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Tenant Isolation Journal Entries" ON public.journal_entries FOR ALL USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Tenant Isolation Journal Lines" ON public.journal_lines FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.journal_entries je
        WHERE je.id = journal_entry_id
        AND je.hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid())
    )
);
