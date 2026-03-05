# 🏨 Hotel PMS Ürün Planlama Belgesi

**Proje Adı:** Diş Kliniği SaaS Panelinden Otel Yönetim Sistemine (PMS) Geçiş
**Belge Türü:** Ürün Planlama & Taslak Mimari (Product Blueprint)
**Tarih:** Mart 2026

## KONTEKST VE HEDEFLER
Bu belge, mevcut bir diş kliniği SaaS panelinin mimari altyapısını ve modüllerini değerlendirerek, küçük ve orta ölçekli oteller için modern bir **Otel Yönetim Sistemine (Property Management System - PMS)** dönüştürülmesi amacıyla hazırlanmıştır. Mevcut proje kodtabanında "Çoklu Kiracı (Multi-tenant) mimarisi", UI bileşenleri, CRM ve ödeme altyapıları mümkün olduğunca tekrar kullanılarak, maliyet-etkin bir ürün değişimi kurgulanmaktadır. 

*(Not: Veritabanı tabloları, spesifik kodlar ve otomasyon detayları bu belge dışında tutularak yalnızca ürün vizyonu ve bileşen eşleşmesi hedeflenmiştir.)*

---

## 1. ÖZELLİK EŞLEŞTİRMESİ (Diş Kliniği → Otel)

Mevcut sistemdeki temel özelliklerin otel yapısındaki terminolojik ve işlevsel karşılıkları:

| Mevcut Modül (Diş Kliniği) | Yeni Modül (Otel PMS) | UX/UI Yeniden Kullanım Stratejisi |
| :--- | :--- | :--- |
| **Randevu Sistemi** (Appointment) | **Rezervasyon Sistemi** | 🔄 **Büyük Revizyon:** Saatlik ve randevu odaklı görünümden, günlük/gecelik ve oda tiplerine göre takvim görünümüne geçiş. |
| **Hasta Kayıtları** (Patient CRM) | **Misafir Profilleri** | ✅ **Yüksek Uyum:** Tablo ve form yapıları küçük alan düzenlemeleri ile tekrar edilebilir. |
| **Doktorlar** | **Personel** (Staff) | ✅ **Yüksek Uyum:** Mevcut ekip atama ve görev listeleme özellikleri geliştirilerek aktarılabilir. |
| **Klinikler** (Multi-tenant) | **Oteller/Tesisler** | ✅ **Mükemmel Uyum:** Çoklu kiracı izolasyonu yapısı (Tenant ID) tamamen aynı kalacaktır. |
| **Tedavi Geçmişi** | **Konaklama Geçmişi** | ✅ **Orta Uyum:** Misafir logları ve geçmiş aktiviteler listesi formatı korunarak revize edilebilir. |
| **Ödeme ve Tahsilat İşlemleri**| **Folyolar & Faturalar (Billing)**| 🔄 **Kısmi Revizyon:** Tedavi başına ödeme yapısı yerine, oda hesabına (folyo) sürekli ekstra kalem (Restoran vb.) eklemeye uygun revizyon. |

---

## 2. TASARLANACAK TEMEL MODÜLLER (CORE MODULES)

### A) Dashboard (Kontrol Paneli)
* **Amaç:** Yönetici ve Resepsiyonist için güne dair operasyonların hızlı "kuşbakışı" özeti.
* **Ana Özellikler:** Beklenen Check-in / Check-out metrikleri, anlık doluluk oranı (Occupancy %), temizlemesi gereken (kirli) odalar istatistiği, günlük gelir tahmini.
* **Kullanıcı Rolleri:** Manager, Reception.
* **UI İhtiyacı:** Mevcut KPI kartları metin/ikon değişikliği ile kullanılacak. 

### B) Reservations (Rezervasyonlar)
* **Amaç:** Geçmiş, aktif ve gelecek tüm rezervasyonların veri listesi olarak yönetimi.
* **Ana Özellikler:** Gelişmiş tablo filtreleme, yeni manuel rezervasyon ekleme akışı, iptal ve "No-Show" işlemleri.
* **Kullanıcı Rolleri:** Manager, Reception.
* **UI İhtiyacı:** Mevcut Data Table ekranlarının misafir ve geliş-gidiş tarihi sütunları ile revize edilmesi.

### C) Calendar / Booking Board (Takvim/Oda Tablosu)
* **Amaç:** Tesisin odalarının uygunluk durumunu vizüel bir blok panoda sunmak.
* **Ana Özellikler:** Sürükle-bırak (Drag & Drop) ile rezervasyon günü kaydırma, günleri kısaltma/uzatma, doluluk veya bakımda olma (Out of Order) takibi.
* **Kullanıcı Rolleri:** Manager, Reception.
* **UI İhtiyacı:** Yeni nesil Gantt Chart tarzı, X ekseninde tarihlerin, Y ekseninde numaralandırılmış odaların yer aldığı özel bileşen inşası.

### D) Guests (Misafirler - CRM)
* **Amaç:** Tesis misafirlerinin veri tabanı.
* **Ana Özellikler:** İletişim bilgileri, kimlik bilgisi (opsiyonel T.C. VKN vb.), özel tercihler (Örn: Alerji), geçmiş tüm konaklamaların raporu.
* **Kullanıcı Rolleri:** Manager, Reception.

### E) Rooms & Room Types (Odalar ve Oda Tipleri)
* **Amaç:** Fiziksel otel envanteri yönetimi.
* **Ana Özellikler:** Oda Tipi tanımlama (Örn: Deluxe, Suit) ve standart kapasite ayarı. 101, 102 gibi spesifik fiziki "Oda" tanımlanarak bu tip eşleştirme.
* **Kullanıcı Rolleri:** Manager.

### F) Housekeeping (Kat Hizmetleri)
* **Amaç:** Odaların fiziksel temizlik süreçlerinin dijital ekranlı takibi.
* **Ana Özellikler:** Her oda için manuel veya uyarılı "Temiz/Kirli/Arızalı" durumu atama, personel görev takip çizelgesi.
* **Kullanıcı Rolleri:** Housekeeping, Manager, Reception.
* **UI İhtiyacı:** Renk kodlu, blok listeleme tarzı tamamen yeni bir operasyon görünümü.

### G) Billing & Payments (Faturalandırma ve Folyolar)
* **Amaç:** Misafirin oteldeki tüm finansal hareketlerini tutmak.
* **Ana Özellikler:** Konaklama masrafının folyoya yansıması, Ekstra hizmet veya restoran ekleme, avans tahsilatı, nihai kapama (Check-out tahsilatı) işlemleri.
* **Kullanıcı Rolleri:** Finance, Manager, Reception.

### H) Reports & Analytics (Raporlar ve Analizler)
* **Amaç:** Maliyetlerin ve otel satış performansının takibi.
* **Ana Özellikler:** ADR (Ortalama Fiyat), RevPAR geliri, gün-sonu özetleri, Emniyet KBS formatı raporu için ham veri (opsiyonel).
* **Kullanıcı Rolleri:** Finance, Manager.

### I) Staff Management (Personel Yönetimi)
* **Amaç:** Otelde sisteme erişen tüm personellerin yönetimi.
* **Ana Özellikler:** Kullanıcı daveti, Rol/Yetki paketi belirleme, hesap duraklatma.
* **Kullanıcı Rolleri:** Admin, Manager.

### J) Settings (Ayarlar)
* **Amaç:** Otelin ana yapılandırma çatısı.
* **Ana Özellikler:** Kurum profili, para birimi seçimi, KDV ve diğer turizm vergi oranları, iletişim bilgisi ve faturada çıkacak bilgiler.
* **Kullanıcı Rolleri:** Admin, Manager.

---

## 3. REZERVASYON İŞ AKIŞI TASARIMI (WORKFLOW)

Bir rezervasyonun oluşturulmasından itibaren tesisten ayrılmasına kadar gerçekleşen yaşam döngüsü:

1. **Inquiry (Sorgu / Beklemede):** Opsiyonlu tutulmuş, henüz kesinleşmemiş kayıt durumu. 
2. **Booking (Onaylandı):** Ön onay alınmış, misafir bekleniyor. İşlem: Gerekirse Ön ödeme (Kapora) kaydı.
3. **Check-in (Giriş Yapıldı):** Misafirin otele ulaşıp giriş yapma anı. İşlem: Konaklama kayıt formu imzalama (veya dijital onay) / Kapı kartı tahsisi. Durum otomatik olarak "Konaklıyor" olarak değişir.
4. **In-House (Konaklıyor):** Aktif otel içindeki durum. Sistem, bu statüdeyken misafir folyosuna ücret/ekstra kalem yansıtılmasına olanak tanır.
5. **Check-out (Çıkış İşlemi):** Çıkış anında devreye girer. İşlem: Folyo üzerindeki tüm bakiye "0" olacak şekilde tahsilat alınır ve çıkış kapatılır.
6. **Post-stay (Ayrıldı):** Artık geçmiş kaydı (Geçmiş konaklama). *Bildirim (Konsept): Ayrılış sonrası online yorum talebi.*

---

## 4. ODA YÖNETİM MODELİ (ROOM MODEL)

Sistemdeki odalar iki katmanlı ağaca oturtulacak:
* **Hiyerarşi 1: Room Types (Oda Türleri):** Otelin fiyat stratejilerinde kullanılan üst paket (Örn: "Premium Aile Odası", "Standart Çift Kişilik"). Kapasiteler (X Yetişkin, Y Çocuk) ve baz özellikler burada tanımlanır.
* **Hiyerarşi 2: Odalar (Gerçek Odalar):** Belirli kapı numarasına veya isme ship somut varlıklar (Örn: 204 nolu oda, 301 nolu oda). "Premium Aile Odası" tipine bağlı çalışırlar.
* **Anlık Statü Bayrakları (Room Flags):** 
  * `Clean` (Temiz - Müşait)
  * `Dirty` (Kirli) - *Not: Check-out işlemi yapıldığında ilgili oda otomatize "Dirty" statüsüne geçer.*
  * `Out of Service` (Servis Dışı/Arıza - Satışa Kapalı)
  * `Occupied` (Konaklama devam ediyor - Satışa Kapalı)

---

## 5. KAT HİZMETLERİ İŞ AKIŞI (HOUSEKEEPING WORKFLOW)

Kat görevlileri günlük olarak sadece Housekeeping panelinden kendi operasyonlarını yürütür.
* **Veri Kaynağı:** Odaların durumu otomasyon + manuel şekilde "Temizlenecek Odalar" (Kirli) panosuna anlık yansır. Pano "Kalanlar (Stay-over)" ve "Ayrılanlar (Departure)" olarak ayrıştırılır.
* **İş Akışı:** Görevli odaya girdiğinde durumu `Cleaning in Progress` yapar, işlem bittiginde durumu `Clean` işaretleyip bir sonraki göreve geçer.
* **Öncelik (Priority):** Resepsiyonistler, Check-in vakti gelen misafirlerin bekletilmemesi için Housekeeping panosunda kirli bir odayı "Acil" (Priority) olarak parlak renklerle öne çıkarabilir.

---

## 6. KULLANICI ROLLERİ VE YETKİLERİ (ROLES & PERMISSIONS)

Farklı birimlerin birbiriyle çakışmadığı güvenli bir izolasyon hedeflenmiştir:
* **Admin (Uygulama Sahibi):** Sistemin kök kurucusu ve süper yöneticisi. Tüm rapor, faturalar ve sistem altyapı ayarlarına erişim. Abonelik planlama yönetimi.
* **Manager (Otel Müdürü):** Otel bazlı tam yetki. Misafir verisi silme, detaylı finans raporları, çalışan listesi görme ve fiyat yapılandırma yetkileri.
* **Reception (Ön Büro):** Takvim, Check-in/Check-out süreçleri yönetimi, folyo tahsilatı, rezervasyon oluşturma ve misafir ekleme/düzenleme kısıtlı yetkileri. Raporlara ve ayarlara giremez.
* **Housekeeping (Kat Temizlik Görevlisi):** Sadece Housekeeping pano sekmesine yetkisi vardır. Rezervasyon detayları ile tahsilat ve misafir kişisel bilgilerini asla görüntüleyemez. Sadece oda ve temizlik listesini görür.
* **Finance (Finans/Muhasebe):** Rezervasyon/oda ayarlarına kısıtlı erişimi olup; tüm fatura, iade ve nakit yönetimi sekmesini yönetir. 

---

## 7. YAN MENÜ TASARIMI (SIDEBAR NAVIGATION)

Mevcut panel tasarımı korunarak yenilenecek Sidebar Hiyerarşisi:

* 📊 **Dashboard** *(Günlük Özet)*
* 📅 **Front Desk** *(Ön Büro)*
  * Takvim Görünümü (Booking Board)
  * Rezervasyon Listesi
  * Kat Hizmetleri (Housekeeping)
* 👥 **Misafirler** *(Guests/CRM)*
* 💳 **Finans**
  * Folyo ve Hesaplar
  * Faturalar / Gelirler
* 🏨 **Otel Yönetimi** *(Manager)*
  * Odalar & Oda Tipleri
  * Fiyatlandırma
* 📈 **Raporlar**
* 👥 **Personel Yönetimi**
* ⚙️ **Ayarlar**

---

## 8. KULLANICI ARAYÜZÜ (UI) YENİDEN KULLANIM STRATEJİSİ

Mevcut projedeki birçok değerli komponent geliştirilebilir durumdadır:
* **Yüksek Oranda Korunacak:** 
  * Misafirleri, personelleri ve ayarları listelediğimiz **Tablolar (DataTables)**.
  * Form modal komponentleri, Dropdownlar.
  * Dashboard'daki kutucuk widgetları (sayısal metrikler ve ikonlar uyarlanacak).
* **Mekansal Değişim Gerekli:** 
  * "Hastanın tedavi geçmişi ve hesabı" sayfası, "Misafirin Oda Folyosu" adlı masraf hesap arayüzüne (Gelir/Gider faturası ekranına) pratik biçimde çevrilmelidir.
* **Tamamen Sıfır Tasarlanması Gereken:**
  * **Takvim:** Diş kliniği saat/işlem mantığında işlediği için mevcut yapı kullanılamaz. Tamamen yeni bir Booking Grid (Yatay Gantt Tipi) takvim üretilmesi PMS projesinin en elzem aşamasıdır.

---

## 9. MVP KAPSAMI (PHASE 1 - İlk Sürüm Dağıtımı)

Uygulamanın çalışır ve müşteriye (Otellere) demosu yapılabilir minimum aşaması şu temel işlevleri barındırmalıdır:
1. Multi-tenant yapısı içinde sorunsuz "Otomize Otel Hesabı" açma ve kurma (Kurum adı, Yetkili kaydı).
2. Oda Tipleri ile fiziki numaralı Odaların sisteme eklenebilmesi.
3. Tablo Görünümü ile rezervasyon ekleme paneli (Takvim bileşeni eğer yetişmezse ilk etapta tablo/list formatında bir Check-in sistemi devreye alınabilir).
4. Manuel ödeme girilebilen, misafirin hesabına işlenen konaklama Folyo sayfası.
5. Reception rolünün açılıp sorunsuz sisteme girmesi.
6. El ile güncellenebilen Housekeeping takip sayfası.
*(Not: İlk MVP vizyonunda entegrasyonlar, karmaşık online misafir portalı veya otomatize fiyatlandırma (Dynamic Pricing) gibi komplike özellikler ertelenmiştir.)*

---

## 10. GELECEK BAŞARI VE BÜYÜME ALANLARI (PHASE 2+)

1. **Channel Manager (Kanal Yöneticisi):** Booking.com, Airbnb, Expedia sistemleriyle XML bağlantısı kurularak takvimin dünyanın en popüler platformlarıyla çift yönlü anlık senkronize olması. (Pazar payını %500 artıracak özelliktir)
2. **Web Online Check-in:** Müşterinin otele gelmeden cep telefonundan belge ulaştırması ve hızlı giriş evraklarını tamamlaması.
3. **Akıllı Otomasyon ve WhatsApp:** Mevcut yapının değerlendirilerek misafire otele girişinden önce ve çıktıktan sonra otomatik yorum linki/kampanya göndermesi.
4. **Dinamik Fiyatlandırma Motoru:** Otelin doluluğu %80'i geçtiğinde son 3 odanın fiyatını sistemsel olarak otomatik %30 artıran algoritmik botlar.
5. **Multi-Property Yönetimi (Zincirler İçin):** Aynı sistem hesabında birden ziyade hotelin tek ekrandan (şube mantığı gibi) pratikçe idare edilmesi.

---
**END OF DOCUMENT**
