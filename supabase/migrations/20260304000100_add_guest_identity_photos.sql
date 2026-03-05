-- Migration: Add Identity Photo Support to Guests
-- 1. Add column to guests table
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS identity_photo_url text;

-- 2. Create guest_documents table for versioning/multiple docs if needed
CREATE TABLE IF NOT EXISTS public.guest_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE,
    document_type text DEFAULT 'ID', -- ID, PASSPORT, etc.
    file_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Enable RLS on guest_documents
ALTER TABLE public.guest_documents ENABLE ROW LEVEL SECURITY;

-- 4. Simple RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.guest_documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.guest_documents
    FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Add comment
COMMENT ON COLUMN public.guests.identity_photo_url IS 'Misafirin kimlik fotoğrafının URL adresi';
