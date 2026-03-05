import { UserRole } from "@/types/database";

export const ROLE_LABELS: Record<string, string> = {
    [UserRole.SUPER_ADMIN]: "Süper Yönetici",
    [UserRole.ADMIN]: "Otel Müdürü",
    [UserRole.MANAGER]: "Bölüm Müdürü",
    [UserRole.RECEPTION]: "Resepsiyon",
    [UserRole.HOUSEKEEPING]: "Housekeeping",
    [UserRole.FINANCE]: "Finans / Muhasebe",
    [UserRole.PERSONEL]: "Personel",
    [UserRole.NIGHT_AUDIT]: "Gece Denetleyicisi",
    [UserRole.DOKTOR]: "Personel (Legacy)",
    [UserRole.SEKRETER]: "Sekreter (Legacy)",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
    [UserRole.ADMIN]: "Tam yetkili otel yönetimi ve tüm sistem ayarları",
    [UserRole.MANAGER]: "Belirli departman yetkileri ve operasyonel raporlama",
    [UserRole.RECEPTION]: "Rezervasyonlar, misafir giriş/çıkış ve oda takibi",
    [UserRole.HOUSEKEEPING]: "Oda temizlik durumları ve kat hizmetleri yönetimi",
    [UserRole.FINANCE]: "Finansal işlemler, folyo yönetimi ve mali raporlar",
    [UserRole.NIGHT_AUDIT]: "Gece sonu işlemleri, raporlama ve resepsiyon desteği",
    [UserRole.PERSONEL]: "Sınırlı yetkili operasyonel personel",
};

export const ROLE_BADGE_COLORS: Record<string, string> = {
    [UserRole.SUPER_ADMIN]: "bg-purple-100 text-purple-700 border-purple-200",
    [UserRole.ADMIN]: "bg-teal-100 text-teal-700 border-teal-200",
    [UserRole.MANAGER]: "bg-indigo-100 text-indigo-700 border-indigo-200",
    [UserRole.RECEPTION]: "bg-amber-100 text-amber-700 border-amber-200",
    [UserRole.HOUSEKEEPING]: "bg-blue-100 text-blue-700 border-blue-200",
    [UserRole.FINANCE]: "bg-emerald-100 text-emerald-700 border-emerald-200",
    [UserRole.PERSONEL]: "bg-zinc-100 text-zinc-700 border-zinc-200",
    [UserRole.NIGHT_AUDIT]: "bg-slate-100 text-slate-700 border-slate-200",
    [UserRole.DOKTOR]: "bg-sky-100 text-sky-700 border-sky-200",
    [UserRole.SEKRETER]: "bg-orange-100 text-orange-700 border-orange-200",
};

