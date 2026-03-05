-- ==========================================
-- HOTEL PMS COMPLETE RESET SCRIPT
-- ==========================================
-- DİKKAT: Bu kod önceki TÜM verileri ve tabloları siler.
-- Sadece "batuhan@nextgency.com" ve "mersin@gmail.com" auth hesaplarını silip yeniden yaratır.
-- ŞİFRE: 123456 olarak ayarlanmıştır.

---------------------------------------------------
-- 1. ESKİ TABLOLARI VE TİPLERİ SİLME
---------------------------------------------------
DROP TABLE IF EXISTS public.housekeeping_tasks CASCADE;
DROP TABLE IF EXISTS public.folio_items CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.room_types CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.reservation_status CASCADE;
DROP TYPE IF EXISTS public.room_status CASCADE;

---------------------------------------------------
-- 2. ENUM TİPLERİ OLUŞTURMA
---------------------------------------------------
CREATE TYPE public.user_role AS ENUM (
    'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'FINANCE', 'DOKTOR', 'PERSONEL'
);
CREATE TYPE public.reservation_status AS ENUM (
    'inquiry', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
);
CREATE TYPE public.room_status AS ENUM (
    'clean', 'dirty', 'cleaning_in_progress', 'out_of_order', 'occupied'
);

---------------------------------------------------
-- 3. TABLOLARI OLUŞTURMA
---------------------------------------------------
CREATE TABLE public.clinics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    working_hours jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'RECEPTION',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    birth_date date,
    tc_identity_no text,
    passport_number text,
    preferences_note text,
    allergies text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.room_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0.00,
    capacity_adults int DEFAULT 2,
    capacity_children int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    room_type_id uuid REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_number text NOT NULL,
    floor text,
    status public.room_status DEFAULT 'clean',
    notes text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
    room_type_id uuid REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    check_in_date timestamptz NOT NULL,
    check_out_date timestamptz NOT NULL,
    status public.reservation_status DEFAULT 'inquiry',
    channel text DEFAULT 'web',
    board_type text,
    adults_count int DEFAULT 1,
    children_count int DEFAULT 0,
    estimated_amount numeric(10,2),
    patient_note text,
    internal_note text,
    tags text[],
    source_conversation_id text,
    source_message_id text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.folio_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
    item_type text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.housekeeping_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    task_type text NOT NULL,
    status text DEFAULT 'pending',
    priority boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

---------------------------------------------------
-- 4. RLS (ROW LEVEL SECURITY) POLİTİKALARI
---------------------------------------------------
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- 500 hatasını engelleyen users RLS kuralı (kendisini görebilir veya SUPER_ADMIN herkesi görebilir)
CREATE POLICY "Users can view their own profile or admin view" ON public.users FOR SELECT USING (
    id = auth.uid() OR role = 'SUPER_ADMIN'
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (
    id = auth.uid()
);

-- Diğer tablolar için Tenant Isolation:
CREATE POLICY "Tenant Isolation clinics" ON public.clinics FOR ALL USING (
    id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);
CREATE POLICY "Tenant Isolation guests" ON public.guests FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation room_types" ON public.room_types FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation rooms" ON public.rooms FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation reservations" ON public.reservations FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation folio_items" ON public.folio_items FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation housekeeping_tasks" ON public.housekeeping_tasks FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);

---------------------------------------------------
-- 5. AUTH VERİLERİNİ TEMİZLEME VE YENİDEN YARATMA
---------------------------------------------------
-- Eski Auth kullanıcılarını güvenle temizliyoruz
DELETE FROM auth.users WHERE email IN ('batuhan@nextgency.com', 'mersin@gmail.com');

-- pgcrypto modülü aktif değilse aktif ediyoruz (şifre crypt için)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- "Mersin Otel" Tenant/Clinic oluşturuluyor
INSERT INTO public.clinics (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Mersin Otel', 'mersin-otel')
ON CONFLICT (id) DO NOTHING;

-- Batuhan SUPER ADMIN Auth Hesabı (Şifre: 123456)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change, 
  raw_app_meta_data, raw_user_meta_data, is_super_admin
)
VALUES (
    '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 
    'authenticated', 'authenticated', 'batuhan@nextgency.com', 
    crypt('123456', gen_salt('bf')), now(), now(), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}','{}', FALSE
);

-- Mersin Otel ADMIN Auth Hesabı (Şifre: 123456)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
)
VALUES (
    '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 
    'authenticated', 'authenticated', 'mersin@gmail.com', 
    crypt('123456', gen_salt('bf')), now(), now(), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}','{}', FALSE
);

-- Public Users bağlantı profilleri
INSERT INTO public.users (id, clinic_id, full_name, phone, role)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Batuhan (Super Admin)', '5550000001', 'SUPER_ADMIN');

INSERT INTO public.users (id, clinic_id, full_name, phone, role)
VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Mersin Otel Yöneticisi', '5550000002', 'ADMIN');
