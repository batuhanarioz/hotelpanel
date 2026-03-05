# 🏨 Hotel PMS Otomasyon ve İş Akışı Stratejisi

**Proje Adı:** NextGency Hotel PMS (Eski Tıbbi Panel Dönüşümü)
**Belge Türü:** Otomasyon & İş Akışı Mimari Planı
**Tarih:** Mart 2026

Bu belge, diş kliniği (randevu/ödeme) mantığından, otelcilik (check-in/çek-out, konaklama) mantığına geçerken sistemin arka planında (n8n, Supabase Edge Functions, WhatsApp API) çalışacak olan otomasyon senaryolarını tanımlar.

---

## 1. 📲 WhatsApp Misafir İletişim Otomasyonları

Eski sistemdeki "Randevu Hatırlatma" ve "Tedavi Sonrası Geri Bildirim" yapıları, otelin "Misafir Yolculuğu (Guest Journey)" aşamalarına göre baştan kurgulanacaktır.

### 1.1. Pre-Arrival (Giriş Öncesi) Otomasyonları
*   **Tetikleyici:** Rezervasyonun `check_in_date` tarihine 24 saat kalması.
*   **Aksiyon:** Misafire WhatsApp üzerinden "Hoş Geldiniz & Ön Bilgilendirme" mesajı gönderimi.
*   **İçerik:**
    *   Tesisin konumu (Google Haritalar linki).
    *   Check-in saati hatırlatması.
    *   (Opsiyonel) Dijital Check-in veya Upsell fırsatları (Havalimanı transferi, Odaya meyve sepeti).

### 1.2. In-House (Konaklama Esnası) Otomasyonları
*   **Tetikleyici:** Rezervasyon durumunun `checked_in` (Giriş Yapıldı) olarak güncellenmesi.
*   **Aksiyon:** Misafire anında bir Karşılama mesajı gönderimi.
*   **İçerik:**
    *   Wi-Fi şifresi ve tesis içi iletişim numaraları.
    *   Kahvaltı / Restoran saatleri.
    *   "Bir ihtiyacınız olursa bu numaradan (Yapay Zeka Asistanımızdan) 7/24 bize ulaşabilirsiniz." bilgisi.

### 1.3. Post-Departure (Çıkış Sonrası) Otomasyonları
*   **Tetikleyici:** Rezervasyon durumunun `checked_out` olarak güncellenmesinin üzerinden 2 saat geçmesi.
*   **Aksiyon:** Memnuniyet ve Değerlendirme mesajı.
*   **İçerik:**
    *   "Bizi tercih ettiğiniz için teşekkür ederiz."
    *   Google Maps / TripAdvisor değerlendirme linki.
    *   (Eğer sistemde puanı düşük verilirse) Otomatik olarak otel müdürüne "Müşteri Memnuniyetsizliği" iç uyarısı gönderilmesi.

---

## 2. 🧹 Operasyonel (İç) Otomasyonlar

Otel yönetiminde en kritik konulardan biri departmanlar (ör. Resepsiyon ve Kat Hizmetleri) arası iletişimin kopmamasıdır.

### 2.1. Housekeeping (Kat Hizmetleri) Tetikleyicisi
*   **Tetikleyici:** Resepsiyonun bir odayı `checked_out` yapması.
*   **Aksiyon (Veritabanı):**
    *   İlgili odanın durumu (`rooms.status`) anında `dirty` (Kirli) olarak güncellenir.
    *   `housekeeping_tasks` tablosuna `checkout_cleaning` tipinde yeni bir görev otomatik olarak (`trigger` ile) eklenir.
*   **Aksiyon (Bildirim):** (Opsiyonel) Nöbetçi temizlik personelinin telefonuna uygulama içi bildirim veya Telegram/WhatsApp mesajı düşer.

### 2.2. Folyo & Bakiye Uyarıları
*   **Tetikleyici:** Misafirin folyo hesabının (ekstra harcamalarının) otelin belirlediği limitin (ör. 5.000 TL) üzerine çıkması.
*   **Aksiyon:** Resepsiyon veya finans ekranına "Riskli Alacak" uyarısı veya doğrudan finans yetkilisinin mailine bildirim.

---

## 3. 🤖 Yapay Zeka (AI) Asistan Entegrasyonu

Eski sistemdeki "Klinik Sesli Asistan", "Otel Sesli/Yazılı Resepsiyonisti"ne evrilecektir.

### 3.1. WhatsApp AI Resepsiyonist Dönüşümü
*   **Görev:** Gelen WhatsApp veya web site mesajlarını anında yanıtlamak.
*   **Bilgi Tabanı (Knowledge Base):**
    *   Müsaitlik durumu sorgulama (Check_in - Check_out tarihlerine göre `rooms` tablosunu okuma).
    *   Fiyat bilgisi verme (`room_types.base_price` ve sezonluk oranlar).
    *   Sıkça Sorulan Sorular (Havuz saati, evcil hayvan kabulü, otopark var mı vs.).

### 3.2. AI Voice Assistant (Sesli Asistan)
*   Rezervasyon talebiyle arayan müşterileri karşılayıp, standart oda fiyatlarını iletme ve rezervasyon kayıt formunu doldurma (isim, telefon, tarih) işlemlerini otonom hale getirme.

---

## 4. 📊 Yönetim ve Raporlama Otomasyonları

### 4.1. Gün Sonu (EOD / Night Audit) Raporu
*   **Tetikleyici:** Her gece saat 23:59.
*   **Aksiyon:** Otel müdürüne / Admin'e e-posta ve WhatsApp üzerinden özet gönderimi.
*   **İçerik:**
    *   Toplam check-in, check-out sayıları.
    *   Anlık oda doluluk oranı (Occupancy Rate).
    *   Ertesi gün beklenen (expected arrival) misafir sayısı.
    *   Günlük ciro (Folyo tahsilatları toplamı).

---

## Sonraki Adım ve Teknik Altyapı
Bu stratejiler mevcut **Supabase Edge Functions** ve yapılandırılacak **n8n / Make.com** webhook'ları ile sisteme kademeli olarak entegre edilecektir. Bir sonraki fazda bu kurguları kod üzerinde (Webhook API endpointleri) ve N8N tarafında canlandıracağız.
