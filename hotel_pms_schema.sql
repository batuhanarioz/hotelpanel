-- Hotel PMS Supabase Schema (COMPLETE SETUP FROM ZERO)
-- Bu script, tamamen boş bir Supabase projesinde "clinics" (oteller) ve "users" dahil 
-- tüm altyapıyı en baştan sıfırdan oluşturur.

---------------------------------------------------
-- 0. CLEANUP (Eğer tablolar varsa önce sileriz)
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
-- 1. ENUMS
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
-- 2. TABLES
---------------------------------------------------

-- 2.1 clinics (Otellerin genel kaydı)
CREATE TABLE public.clinics (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    working_hours jsonb,
    created_at timestamptz DEFAULT now()
);

-- 2.2 users (Personel hesapları)
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'RECEPTION',
    created_at timestamptz DEFAULT now()
);

-- 2.3 guests (Misafirler)
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

-- 2.4 room_types (Oda Tipleri)
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

-- 2.5 rooms (Odalar)
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

-- 2.6 reservations (Rezervasyonlar)
CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
    room_type_id uuid REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL, -- Check-in'de atanır
    doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- Opsiyonel atanan personel
    check_in_date timestamptz NOT NULL,
    check_out_date timestamptz NOT NULL,
    status public.reservation_status DEFAULT 'inquiry',
    channel text DEFAULT 'web',
    board_type text, -- E.g. BB, FB, AI
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

-- 2.7 folio_items (Folyo/Ödemeler)
CREATE TABLE public.folio_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
    reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
    item_type text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 2.8 housekeeping_tasks (Temizlik Görevleri)
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
-- 3. ROW LEVEL SECURITY (RLS)
---------------------------------------------------
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Güvenlik: Kullanıcıların sadece kendi otellerine ait (clinic_id) kayıtları görebilmesi içindir:
CREATE POLICY "Tenant Isolation clinics" ON public.clinics FOR ALL USING (
    id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Tenant Isolation users" ON public.users FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid())
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
