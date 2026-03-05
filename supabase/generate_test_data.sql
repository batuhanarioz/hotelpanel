-- Kapsamlı Test Verisi Üretme Scripti (03.03.2026 Merkezli)
-- Hedef Otel ID: 9a99818d-cd23-478f-ae14-90ec4450b2cb

DO $$
DECLARE
    v_hotel_id uuid := '9a99818d-cd23-478f-ae14-90ec4450b2cb';
    v_floor_ids uuid[];
    v_rt_standard uuid;
    v_rt_deluxe uuid;
    v_rt_suite uuid;
    v_room_id uuid;
    v_room_ids uuid[] := '{}';
    v_guest_id uuid;

    v_res_id uuid;
    v_staff_id uuid;
    v_i integer;
    v_date date;
    v_ref_date date := '2026-03-03';
BEGIN
    -- 1. ESKİ TEST VERİLERİNİ TEMİZLE (Sıralı silme)
    -- Sadece bu otel için olan verileri siliyoruz
    DELETE FROM public.folio_items WHERE hotel_id = v_hotel_id;
    DELETE FROM public.housekeeping_tasks WHERE hotel_id = v_hotel_id;
    DELETE FROM public.operational_tasks WHERE hotel_id = v_hotel_id;
    DELETE FROM public.room_blocks WHERE hotel_id = v_hotel_id;
    DELETE FROM public.reservations WHERE hotel_id = v_hotel_id;
    DELETE FROM public.guests WHERE hotel_id = v_hotel_id;
    DELETE FROM public.rooms WHERE hotel_id = v_hotel_id;
    DELETE FROM public.room_types WHERE hotel_id = v_hotel_id;
    DELETE FROM public.floors WHERE hotel_id = v_hotel_id;

    -- 2. KATLAR (4 Adet)
    INSERT INTO public.floors (hotel_id, name, order_index) VALUES (v_hotel_id, 'Giriş Kat', 0) ON CONFLICT DO NOTHING;
    INSERT INTO public.floors (hotel_id, name, order_index) VALUES (v_hotel_id, '1. Kat', 1) ON CONFLICT DO NOTHING;
    INSERT INTO public.floors (hotel_id, name, order_index) VALUES (v_hotel_id, '2. Kat', 2) ON CONFLICT DO NOTHING;
    INSERT INTO public.floors (hotel_id, name, order_index) VALUES (v_hotel_id, '3. Kat', 3) ON CONFLICT DO NOTHING;
    
    SELECT ARRAY_AGG(id ORDER BY order_index) INTO v_floor_ids FROM public.floors WHERE hotel_id = v_hotel_id;

    -- 3. ODA TİPLERİ
    INSERT INTO public.room_types (hotel_id, name, description, base_price, capacity_adults, capacity_children) VALUES
    (v_hotel_id, 'Ekonomik Standart', 'Sade ve kullanışlı', 1200, 2, 0) RETURNING id INTO v_rt_standard;
    INSERT INTO public.room_types (hotel_id, name, description, base_price, capacity_adults, capacity_children) VALUES
    (v_hotel_id, 'Premium Deluxe', 'Geniş manzara ve balkon', 2400, 2, 2) RETURNING id INTO v_rt_deluxe;
    INSERT INTO public.room_types (hotel_id, name, description, base_price, capacity_adults, capacity_children) VALUES
    (v_hotel_id, 'Panoramik Suit', 'En üst kat, jakuzili ultra lüks', 4800, 4, 1) RETURNING id INTO v_rt_suite;

    -- 4. ODALAR (20 Oda)
    -- Standart odalar (Giriş ve 1. Kat)
    FOR v_i IN 0..9 LOOP
        INSERT INTO public.rooms (hotel_id, room_type_id, floor_id, room_number, status) 
        VALUES (v_hotel_id, v_rt_standard, v_floor_ids[1 + (v_i/5)::int], (100+v_i)::text, 'clean') RETURNING id INTO v_room_id;
        v_room_ids := array_append(v_room_ids, v_room_id);
    END LOOP;
    -- Deluxe odalar (2. Kat)
    FOR v_i IN 10..14 LOOP
        INSERT INTO public.rooms (hotel_id, room_type_id, floor_id, room_number, status) 
        VALUES (v_hotel_id, v_rt_deluxe, v_floor_ids[3], (200+v_i)::text, 'occupied') RETURNING id INTO v_room_id;
        v_room_ids := array_append(v_room_ids, v_room_id);
    END LOOP;
    -- Suite odalar (3. Kat)
    FOR v_i IN 15..19 LOOP
        INSERT INTO public.rooms (hotel_id, room_type_id, floor_id, room_number, status) 
        VALUES (v_hotel_id, v_rt_suite, v_floor_ids[4], (300+v_i)::text, 'dirty') RETURNING id INTO v_room_id;
        v_room_ids := array_append(v_room_ids, v_room_id);
    END LOOP;


    -- 5. PERSONEL
    SELECT id INTO v_staff_id FROM public.users WHERE hotel_id = v_hotel_id LIMIT 1;

    -- 6. MİSAFİRLER VE REZERVASYONLAR (Çeşitli Senaryolar)
    
    -- Senaryo A: GEÇMİŞ REZERVASYONLAR (Raporlar için)
    FOR v_i IN 1..20 LOOP
        INSERT INTO public.guests (hotel_id, full_name, phone, email, is_vip, nationality)
        VALUES (v_hotel_id, 'Eski Misafir ' || v_i, '500' || LPAD(v_i::text, 7, '0'), 'past' || v_i || '@test.com', (v_i % 7 = 0), 'TR')
        RETURNING id INTO v_guest_id;
        
        v_date := v_ref_date - (v_i + 5); -- 5 ile 25 gün öncesi arası
        
        INSERT INTO public.reservations (hotel_id, guest_id, room_id, check_in_date, check_out_date, status, channel, board_type, adults_count, estimated_amount, assigned_staff_id)
        VALUES (v_hotel_id, v_guest_id, v_room_ids[1 + (v_i % 20)], v_date + interval '14 hours', v_date + interval '3 days 11 hours', 'checked_out', 'web', 'HB', 2, 4500, v_staff_id)
        RETURNING id INTO v_res_id;
        
        -- Konaklama ve Ekstra Geliri
        INSERT INTO public.folio_items (hotel_id, reservation_id, item_type, description, amount, created_at)
        VALUES (v_hotel_id, v_res_id, 'accommodation', 'Konaklama', 3600, v_date),
               (v_hotel_id, v_res_id, 'extra', 'Mini Bar', 400, v_date + interval '1 day'),
               (v_hotel_id, v_res_id, 'payment', 'Kredi Kartı Ödemesi', -4000, v_date + interval '3 days');
    END LOOP;

    -- Senaryo B: ŞU ANKİ REZERVASYONLAR (Giriş yapmış olanlar)
    FOR v_i IN 1..8 LOOP
        INSERT INTO public.guests (hotel_id, full_name, phone, identity_no, is_vip)
        VALUES (v_hotel_id, 'Aktif Misafir ' || v_i, '532' || LPAD(v_i::text, 7, '0'), '1000' || LPAD(v_i::text, 7, '0'), (v_i % 3 = 0))
        RETURNING id INTO v_guest_id;
        
        -- Bazıları bugün girdi, bazıları birkaç gün önce
        v_date := v_ref_date - (v_i % 4); 
        
        INSERT INTO public.reservations (hotel_id, guest_id, room_id, check_in_date, check_out_date, status, channel, board_type, adults_count, estimated_amount, assigned_staff_id)
        VALUES (v_hotel_id, v_guest_id, v_room_ids[10 + v_i], v_date + interval '14 hours', v_ref_date + interval '4 days 11 hours', 'checked_in', 'whatsapp', 'BB', 2, 9600, v_staff_id)
        RETURNING id INTO v_res_id;
        
        -- Borçlu ve Alacaklı Senaryoları
        INSERT INTO public.folio_items (hotel_id, reservation_id, item_type, description, amount)
        VALUES (v_hotel_id, v_res_id, 'accommodation', 'Konaklama Peşinatı', 2400);
        IF v_i % 2 = 0 THEN
            INSERT INTO public.folio_items (hotel_id, reservation_id, item_type, description, amount)
            VALUES (v_hotel_id, v_res_id, 'payment', 'Nakit Tahsilat', -2400);
        END IF;
    END LOOP;

    -- Senaryo C: GELECEK REZERVASYONLAR (Takvim doluluğu için)
    FOR v_i IN 1..15 LOOP
        INSERT INTO public.guests (hotel_id, full_name, phone, is_blacklist)
        VALUES (v_hotel_id, 'Gelecek Misafir ' || v_i, '544' || LPAD(v_i::text, 7, '0'), (v_i = 13)) -- 13. misafir kara listede
        RETURNING id INTO v_guest_id;
        
        v_date := v_ref_date + (v_i % 10) + 1;
        
        INSERT INTO public.reservations (hotel_id, guest_id, room_id, check_in_date, check_out_date, status, channel, board_type, adults_count, estimated_amount)
        VALUES (v_hotel_id, v_guest_id, v_room_ids[1 + (v_i % 10)], v_date + interval '14 hours', v_date + interval '2 days 11 hours', 'confirmed', 'phone', 'ROOM_ONLY', 1, 3000)
        RETURNING id INTO v_res_id;
    END LOOP;

    -- Senaryo D: İPTAL VE NO-SHOW (KPI için)
    FOR v_i IN 1..5 LOOP
         INSERT INTO public.guests (hotel_id, full_name, phone) VALUES (v_hotel_id, 'İptalci Misafir ' || v_i, '555' || LPAD(v_i::text, 7, '0')) RETURNING id INTO v_guest_id;
         INSERT INTO public.reservations (hotel_id, guest_id, room_id, check_in_date, check_out_date, status, channel, estimated_amount)
         VALUES (v_hotel_id, v_guest_id, v_room_ids[20], v_ref_date - v_i, v_ref_date - v_i + 2, CASE WHEN v_i % 2 = 0 THEN 'cancelled'::public.reservation_status ELSE 'no_show'::public.reservation_status END, 'web', 2000);
    END LOOP;

    -- 7. ODA BLOKLARI (OOO/OOS)
    INSERT INTO public.room_blocks (hotel_id, room_id, check_in_at, check_out_at, reason, block_type)
    VALUES 
    (v_hotel_id, v_room_ids[1], v_ref_date - 1, v_ref_date + 2, 'Klima Arızası', 'OOO'),
    (v_hotel_id, v_room_ids[2], v_ref_date, v_ref_date + 1, 'Boya Tadilatı', 'OOS');

    -- 8. OPERASYONEL GÖREVLER
    INSERT INTO public.operational_tasks (hotel_id, title, description, task_date, is_completed, assigned_to)
    VALUES 
    (v_hotel_id, 'Sabah Brifingi', 'Bugünkü VIP gelişleri hakkında personeli bilgilendir.', v_ref_date, true, v_staff_id),
    (v_hotel_id, 'Ödeme Takibi', 'Eski Misafir 5 in kalanı tahsil edilecek.', v_ref_date, false, v_staff_id),
    (v_hotel_id, 'Çarşaf Değişimi', 'Suit odaların çarşafları kontrol edilecek.', v_ref_date + 1, false, v_staff_id);

    -- 9. HOUSEKEEPING GÖREVLERİ (Karma status)
    FOR v_i IN 1..6 LOOP
        INSERT INTO public.housekeeping_tasks (hotel_id, room_id, task_type, status, priority)
        VALUES (v_hotel_id, v_room_ids[15 + v_i % 5], 'check_out_clean', CASE WHEN v_i % 2 = 0 THEN 'pending' ELSE 'cleaning_in_progress' END, (v_i % 3 = 0));
    END LOOP;

END $$;
