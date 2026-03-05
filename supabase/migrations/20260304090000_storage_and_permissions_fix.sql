-- Permission and Storage Fixes
-- 1. Fix has_permission function to use 'permission' column
CREATE OR REPLACE FUNCTION public.has_permission(requested_permission text, user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
    u_role public.user_role;
    u_hotel_id uuid;
    has_perm boolean;
BEGIN
    -- Get user role and hotel_id
    SELECT role, hotel_id INTO u_role, u_hotel_id FROM public.users WHERE id = user_id;
    
    -- SUPER_ADMIN has everything
    IF u_role = 'SUPER_ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- Check role_permissions table
    SELECT EXISTS (
        SELECT 1 FROM public.role_permissions 
        WHERE role = u_role::text 
        AND permission = requested_permission
        AND (hotel_id IS NULL OR hotel_id = u_hotel_id)
    ) INTO has_perm;

    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update guest_documents table to include storage_path
-- Note: Check if column exists, if not add it. 
-- According to schema check, it had file_url and file_name.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guest_documents' AND column_name='storage_path') THEN
        ALTER TABLE public.guest_documents ADD COLUMN storage_path text;
    END IF;
END $$;

-- 3. Update guests table comment or metadata if needed
COMMENT ON COLUMN public.guest_documents.storage_path IS 'The relative path in Supabase storage bucket';
