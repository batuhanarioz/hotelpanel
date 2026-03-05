-- 20260305130000_fix_reservation_deletion.sql
-- Purpose: Fix issues preventing reservation deletion by adding missing cascading deletes and 
-- adjusting the immutable ledger trigger to allow cleanup of deleted reservations.

BEGIN;

-- 1. Fix folio_transactions foreign key to include CASCADE
ALTER TABLE public.folio_transactions 
DROP CONSTRAINT IF EXISTS folio_transactions_reservation_id_fkey,
ADD CONSTRAINT folio_transactions_reservation_id_fkey 
    FOREIGN KEY (reservation_id) 
    REFERENCES public.reservations(id) 
    ON DELETE CASCADE;

-- 2. Add missing foreign key to reservation_status_history with CASCADE
ALTER TABLE public.reservation_status_history
DROP CONSTRAINT IF EXISTS reservation_status_history_reservation_id_fkey,
ADD CONSTRAINT reservation_status_history_reservation_id_fkey 
    FOREIGN KEY (reservation_id) 
    REFERENCES public.reservations(id) 
    ON DELETE CASCADE;

-- 3. Adjust the immutability trigger to allow deletion of transactions when parent reservation is deleted
-- Actually, PostgreSQL doesn't easily distinguish 'CASCADE delete' from 'direct delete' in a trigger,
-- but we can check if the reservation still exists.
CREATE OR REPLACE FUNCTION public.fn_enforce_ledger_immutability()
RETURNS TRIGGER AS $$
BEGIN
    -- If the reservation still exists, block the manual delete of a single transaction
    IF (TG_OP = 'DELETE') THEN
        IF EXISTS (SELECT 1 FROM public.reservations WHERE id = OLD.reservation_id) THEN
            RAISE EXCEPTION 'Ledger entries are immutable. You cannot manually delete a transaction while the reservation exists. Delete the whole reservation if intended.';
        END IF;
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'Ledger entries are immutable. Use adjustment transactions for corrections.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure other tables also have CASCADE if they reference reservations
-- (Checked: folio_items, folio_transactions_legacy already have it in schema)

COMMIT;
