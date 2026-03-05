-- DİKKAT: Bu kod RLS (sonsuz döngü - 500 hatası) problemini kökünden çözecektir.
-- Lütfen bu komutu kopyalayıp Supabase SQL Editor ekranından çalıştırın.

-- 1. users tablosundaki sorunlu kuralı silip yeniden oluşturuyoruz:
DROP POLICY IF EXISTS "Tenant Isolation users" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (
    id = auth.uid() OR role = 'SUPER_ADMIN'
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (
    id = auth.uid()
);

-- 2. Auth (Şifre) sisteminde 400 Bad Request hatasını engelleyecek profil güncellemesi
UPDATE auth.users 
SET raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    raw_user_meta_data = '{}'
WHERE email IN ('batuhan@nextgency.com', 'mersin@gmail.com');
