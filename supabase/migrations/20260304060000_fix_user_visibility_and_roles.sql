-- Synchronize User Roles and RLS fixes
-- 1. Update user_role enum to include NIGHT_AUDIT
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'NIGHT_AUDIT') THEN
        ALTER TYPE public.user_role ADD VALUE 'NIGHT_AUDIT';
    END IF;
END $$;

-- 2. Update RLS policies for users table
-- Drop old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile or admin view" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow team visibility within hotel" ON public.users;
DROP POLICY IF EXISTS "Admins can manage hotel users" ON public.users;

-- Create more appropriate Enterprise policies
CREATE POLICY "Allow team visibility within hotel" ON public.users 
FOR SELECT TO authenticated 
USING (
    (id = auth.uid()) 
    OR 
    (hotel_id IN (SELECT u.hotel_id FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'MANAGER', 'SUPER_ADMIN', 'FINANCE')))
);

CREATE POLICY "Admins can manage hotel users" ON public.users 
FOR ALL TO authenticated 
USING (
    (hotel_id IN (SELECT u.hotel_id FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN')))
)
WITH CHECK (
    (hotel_id IN (SELECT u.hotel_id FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('ADMIN', 'SUPER_ADMIN')))
);

-- Ensure individual update is still possible for password etc if needed (handled by API mostly)
CREATE POLICY "Users can update self" ON public.users 
FOR UPDATE TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
