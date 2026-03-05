-- Migration: Create operational_tasks table for shift tasks
-- Description: Adds a table to store manual tasks for hotel operations.

CREATE TABLE IF NOT EXISTS public.operational_tasks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    due_time TIME,
    task_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.operational_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "operational_tasks_select" ON public.operational_tasks
    FOR SELECT USING (hotel_id = (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "operational_tasks_insert" ON public.operational_tasks
    FOR INSERT WITH CHECK (hotel_id = (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "operational_tasks_update" ON public.operational_tasks
    FOR UPDATE USING (hotel_id = (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "operational_tasks_delete" ON public.operational_tasks
    FOR DELETE USING (hotel_id = (SELECT hotel_id FROM public.users WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operational_tasks_updated_at
    BEFORE UPDATE ON public.operational_tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
