-- Synchronize User Roles and Table Structures
-- This migration ensures the database has all roles and fields required by the updated codebase.

-- 1. Update user_role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'MANAGER') THEN
        ALTER TYPE public.user_role ADD VALUE 'MANAGER';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'PERSONEL') THEN
        ALTER TYPE public.user_role ADD VALUE 'PERSONEL';
    END IF;
END $$;

-- 2. Ensure users table has all required columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS max_refund_amount numeric DEFAULT 1000,
ADD COLUMN IF NOT EXISTS max_discount_percentage numeric DEFAULT 10;

-- 3. Ensure guests table has all required columns
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS id_type text DEFAULT 'TC',
ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_blacklist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS blacklist_reason text,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';

-- 4. Check reservations for missing fields (optional but good practice)
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS source_id uuid;

-- 5. Add comments for clarity
COMMENT ON COLUMN public.users.max_refund_amount IS 'Kullanıcının yapabileceği maksimum iade tutarı';
COMMENT ON COLUMN public.users.max_discount_percentage IS 'Kullanıcının uygulayabileceği maksimum indirim oranı (%)';
COMMENT ON COLUMN public.guests.is_vip IS 'VIP misafir statüsü';
COMMENT ON COLUMN public.guests.marketing_consent IS 'SMS ve E-posta pazarlama onayı durumu';
