-- Enterprise Housekeeping Upgrade Phase 2: Analytics & Refinements

-- 1. Update housekeeping_tasks table with performance tracking fields
ALTER TABLE public.housekeeping_tasks
ADD COLUMN IF NOT EXISTS cleaning_started_at timestamptz,
ADD COLUMN IF NOT EXISTS cleaning_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS cleaning_duration_minutes integer;

-- 2. Update maintenance_tickets table with categories
ALTER TABLE public.maintenance_tickets
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General';
-- Valid categories: 'Electrical', 'Water', 'Furniture', 'Air Conditioning', 'General'

-- 3. Update rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS last_cleaned_at timestamptz;

-- 4. Update Priority Enum-like logic (Mapping in app logic, but updating default if necessary)
-- We use integer priority_level: 0: Normal, 1: High, 2: VIP, 3: ASAP (Late Checkout/Checkin Today)

-- 5. Trigger to update last_cleaned_at on task completion
CREATE OR REPLACE FUNCTION public.fn_on_housekeeping_task_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'CLEAN' AND NEW.status = 'CLEAN' THEN
        UPDATE public.rooms 
        SET 
            last_cleaned_at = now(),
            status = 'CLEAN'
        WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_housekeeping_task_complete ON public.housekeeping_tasks;
CREATE TRIGGER trg_on_housekeeping_task_complete
AFTER UPDATE ON public.housekeeping_tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.fn_on_housekeeping_task_complete();
