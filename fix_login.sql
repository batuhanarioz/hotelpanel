-- 1. RLS policy (Sonsuz Döngü / Infinite Recursion) hatasını çözelim.
-- Supabase, 'users' tablosunda kendisini referans alan bir SELECT olduğunda 500 hatası verir.
DROP POLICY IF EXISTS "Tenant Isolation users" ON public.users;

-- Kullanıcılar kendi bilgilerini görebilir (Grup içi görmek gerekiyorsa ileride fonksiyon eklenebilir)
CREATE POLICY "Tenant Isolation users" ON public.users FOR ALL USING (
    id = auth.uid() OR clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid() LIMIT 1)
);
-- Veya en güvenli, hatasız hali: Sadece kendi profilini veya herkesi (Klinik içiyse) görme:
DROP POLICY IF EXISTS "Tenant Isolation users" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (
    id = auth.uid()
);
CREATE POLICY "Users can edit their own profile" ON public.users FOR UPDATE USING (
    id = auth.uid()
);

-- 2. Auth tablosundaki manuel oluşturulan kullanıcılara ait 400 (Bad Request) hatasını çözmek 
-- için Supabase Auth metadata'sını düzeltelim. Provider bilgisi eksik olduğu için giriş reddediliyordu.
UPDATE auth.users 
SET raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    raw_user_meta_data = '{}',
    is_super_admin = FALSE
WHERE email IN ('batuhan@nextgency.com', 'mersin@gmail.com');
