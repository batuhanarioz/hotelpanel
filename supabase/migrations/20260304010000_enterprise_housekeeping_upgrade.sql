-- Enterprise Housekeeping Upgrade Migration (Logic & Schema)

-- 1. Update existing records to new uppercase formats
UPDATE public.rooms SET status = 'DIRTY' WHERE status = 'dirty';
UPDATE public.rooms SET status = 'CLEAN' WHERE status = 'clean';
UPDATE public.rooms SET status = 'CLEANING' WHERE status = 'cleaning_in_progress';
UPDATE public.rooms SET status = 'OOO' WHERE status = 'out_of_order';
UPDATE public.rooms SET status = 'OCCUPIED' WHERE status = 'occupied';

-- 2. Modify room_types table
ALTER TABLE public.room_types
ADD COLUMN IF NOT EXISTS estimated_cleaning_time integer DEFAULT 30; -- minutes

-- 3. Modify housekeeping_tasks table
ALTER TABLE public.housekeeping_tasks
ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 0, 
ADD COLUMN IF NOT EXISTS estimated_time integer DEFAULT 30, 
ADD COLUMN IF NOT EXISTS checkout_task boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS started_at timestamptz,
ADD COLUMN IF NOT EXISTS inspection_passed_at timestamptz,
ADD COLUMN IF NOT EXISTS inspected_by uuid REFERENCES public.users(id);

-- 4. Create maintenance_tickets table 
-- Not: clinic_id yerine hotel_id kullanıldı
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    reported_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    description text NOT NULL,
    status text DEFAULT 'OPEN', 
    priority text DEFAULT 'MEDIUM', 
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for maintenance_tickets
DO $$
BEGIN
    ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DROP POLICY IF EXISTS "Tenant Isolation maintenance_tickets" ON public.maintenance_tickets;
CREATE POLICY "Tenant Isolation maintenance_tickets" ON public.maintenance_tickets FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid())
);

-- 5. Automated Task Creation (Trigger)
CREATE OR REPLACE FUNCTION public.fn_on_reservation_checkout()
RETURNS TRIGGER AS $$
BEGIN
    -- When a reservation is checked out
    IF OLD.status != 'checked_out' AND NEW.status = 'checked_out' THEN
        -- 1. Automaticaly set room status to DIRTY
        UPDATE public.rooms SET status = 'DIRTY' WHERE id = NEW.room_id;
        
        -- 2. Create a housekeeping_task
        INSERT INTO public.housekeeping_tasks (
            hotel_id,
            room_id,
            task_type,
            status,
            priority_level,
            estimated_time,
            checkout_task
        )
        SELECT 
            NEW.hotel_id,
            NEW.room_id,
            'Full Cleaning (Checkout)',
            'DIRTY',
            CASE 
                -- Logic: Rooms with check-in today get priority
                WHEN EXISTS (
                    SELECT 1 FROM public.reservations r 
                    WHERE r.room_id = NEW.room_id 
                    AND r.check_in_date::date = CURRENT_DATE
                    AND r.status = 'confirmed'
                ) THEN 2 
                ELSE 1 
            END,
            rt.estimated_cleaning_time,
            true
        FROM public.room_types rt
        WHERE rt.id = NEW.room_type_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_reservation_checkout ON public.reservations;
CREATE TRIGGER trg_on_reservation_checkout
AFTER UPDATE ON public.reservations
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_on_reservation_checkout();

-- 6. Priority Logic helper function
CREATE OR REPLACE FUNCTION public.get_room_cleaning_priority(p_room_id uuid)
RETURNS integer AS $$
DECLARE
    v_priority integer := 4; 
BEGIN
    -- 1) Rooms with check-in today
    IF EXISTS (SELECT 1 FROM public.reservations WHERE room_id = p_room_id AND check_in_date::date = CURRENT_DATE AND status = 'confirmed') THEN
        RETURN 1;
    END IF;
    
    -- 2) VIP guest rooms
    IF EXISTS (
        SELECT 1 FROM public.reservations r
        JOIN public.guests g ON r.guest_id = g.id
        WHERE r.room_id = p_room_id AND g.is_vip = true AND r.status = 'checked_in'
    ) THEN
        RETURN 2;
    END IF;
    
    -- 3) Rooms with checkout today
    IF EXISTS (SELECT 1 FROM public.reservations WHERE room_id = p_room_id AND check_out_date::date = CURRENT_DATE AND status = 'checked_in') THEN
        RETURN 3;
    END IF;
    
    RETURN v_priority;
END;
$$ LANGUAGE plpgsql;
