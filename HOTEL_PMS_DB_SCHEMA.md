-- ==========================================
-- HOTEL PMS: TAMAMEN SIFIRDAN KURULUM
-- (Hiçbir 'clinic' bağlantısı kalmayacak şekilde tasarlandı)
-- ==========================================

---------------------------------------------------
-- 1. ESKİ TABLOLARI VE TİPLERİ SİLME (DROP)
---------------------------------------------------
-- Çakışmayı önlemek için önce tüm bağımlılıkları CASCADE ile siliyoruz
DROP TABLE IF EXISTS public.housekeeping_tasks CASCADE;
DROP TABLE IF EXISTS public.folio_items CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.room_types CASCADE;
DROP TABLE IF EXISTS public.guests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE; -- Her ihtimale karşı eskisini de siliyoruz

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.reservation_status CASCADE;
DROP TYPE IF EXISTS public.room_status CASCADE;


---------------------------------------------------
-- 2. ENUM TİPLERİ OLUŞTURMA
---------------------------------------------------
CREATE TYPE public.user_role AS ENUM (
    'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'FINANCE', 'PERSONEL'
);
CREATE TYPE public.reservation_status AS ENUM (
    'inquiry', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
);
CREATE TYPE public.room_status AS ENUM (
    'clean', 'dirty', 'cleaning_in_progress', 'out_of_order', 'occupied'
);


---------------------------------------------------
-- 3. TABLOLARI OLUŞTURMA (Her şey "hotel_id" kullanacak)
---------------------------------------------------

-- 3.1 HOTELS (Otellerin genel kaydı - Eski clinics tablosunun yerine geçiyor)
CREATE TABLE public.hotels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    working_hours jsonb,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 3.2 USERS (Personel hesapları)
CREATE TABLE public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE, -- Artık clinic_id yok!
    full_name text NOT NULL,
    phone text,
    role public.user_role DEFAULT 'RECEPTION',
    created_at timestamptz DEFAULT now()
);

-- 3.3 GUESTS (Misafirler)
CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    birth_date date,
    identity_no text, -- tc_identity_no yerine daha global
    passport_number text,
    preferences_note text,
    allergies text,
    created_at timestamptz DEFAULT now()
);

-- 3.4 ROOM_TYPES (Oda Tipleri)
CREATE TABLE public.room_types (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    base_price numeric(10,2) DEFAULT 0.00,
    capacity_adults int DEFAULT 2,
    capacity_children int DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- 3.5 ROOMS (Odalar)
CREATE TABLE public.rooms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    room_type_id uuid REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_number text NOT NULL,
    floor text,
    status public.room_status DEFAULT 'clean',
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 3.6 RESERVATIONS (Rezervasyonlar)
CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    guest_id uuid REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
    room_type_id uuid REFERENCES public.room_types(id) ON DELETE RESTRICT,
    room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
    assigned_staff_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- doctor_id kaldırıldı, staff eklendi
    check_in_date timestamptz NOT NULL,
    check_out_date timestamptz NOT NULL,
    status public.reservation_status DEFAULT 'inquiry',
    channel text DEFAULT 'web',
    board_type text, -- E.g. BB, FB, AI
    adults_count int DEFAULT 1,
    children_count int DEFAULT 0,
    estimated_amount numeric(10,2),
    guest_note text, -- patient_note yerine guest_note
    internal_note text,
    tags text[],
    source_conversation_id text,
    source_message_id text,
    created_at timestamptz DEFAULT now()
);

-- 3.7 FOLIO_ITEMS (Folyo/Ödemeler ve Ekstralar)
CREATE TABLE public.folio_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
    reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE,
    item_type text NOT NULL, -- accommodation, minibar, restaurant, vs.
    description text,
    amount numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 3.8 HOUSEKEEPING_TASKS (Temizlik Görevleri)
CREATE TABLE public.housekeeping_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
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
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- Güvenlik: Kullanıcıların sadece kendi otellerine ait kayıtları (hotel_id) görebilmesi
-- veya SUPER_ADMIN olanların tüm sistemi görebilmesi.

-- USERS TABLOSU İÇİN ÖZEL KURALLAR (Sonsuz Döngüyü Önler)
CREATE POLICY "Users can view their own profile or admin view" ON public.users FOR SELECT USING (
    id = auth.uid() OR role = 'SUPER_ADMIN'
);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (
    id = auth.uid()
);

-- DİĞER TABLOLAR İÇİN STANDART UZOLASYON KURALLARI
CREATE POLICY "Tenant Isolation hotels" ON public.hotels FOR ALL USING (
    id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation guests" ON public.guests FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation room_types" ON public.room_types FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation rooms" ON public.rooms FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation reservations" ON public.reservations FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation folio_items" ON public.folio_items FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Tenant Isolation housekeeping_tasks" ON public.housekeeping_tasks FOR ALL USING (
    hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);
