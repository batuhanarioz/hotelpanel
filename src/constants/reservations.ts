export const BOARD_TYPES = [
    { value: "RO", label: "Sadece Oda (Room Only)" },
    { value: "BB", label: "Oda Kahvaltı (Bed & Breakfast)" },
    { value: "HB", label: "Yarım Pansiyon (Half Board)" },
    { value: "FB", label: "Tam Pansiyon (Full Board)" },
    { value: "AL", label: "Her Şey Dahil (All Inclusive)" },
    { value: "UAL", label: "Ultra Her Şey Dahil (Ultra All Inclusive)" },
];

export const CHANNEL_OPTIONS = [
    { value: "web", label: "Web" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "phone", label: "Telefon" },
    { value: "walk_in", label: "Yüz yüze" },
];

export const CURRENCY_OPTIONS = [
    { value: "TRY", label: "Türk Lirası (₺)", symbol: "₺" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "USD", label: "Dolar ($)", symbol: "$" },
    { value: "GBP", label: "Sterlin (£)", symbol: "£" },
];

export const STATUS_COLORS: Record<string, { card: string; dot: string }> = {
    inquiry: { // Talep
        card: "bg-amber-50 border-amber-100 hover:bg-amber-100/50",
        dot: "bg-amber-500",
    },
    confirmed: { // Onaylı
        card: "bg-blue-50 border-blue-100 hover:bg-blue-100/50",
        dot: "bg-blue-500",
    },
    checked_in: { // Giriş Yaptı
        card: "bg-indigo-50 border-indigo-100 hover:bg-indigo-100/50",
        dot: "bg-indigo-500",
    },
    checked_out: { // Çıkış Yaptı
        card: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50 opacity-80",
        dot: "bg-emerald-500",
    },
    cancelled: { // İptal Edildi
        card: "bg-rose-50 border-rose-100 hover:bg-rose-100/50 opacity-60",
        dot: "bg-rose-500",
    },
    no_show: { // Gelmedi
        card: "bg-slate-100 border-slate-200 hover:bg-slate-200/50 opacity-60",
        dot: "bg-slate-500",
    },
};

export const ACCENT_COLORS: Record<string, string> = {
    inquiry: "bg-amber-400",
    confirmed: "bg-blue-400",
    checked_in: "bg-indigo-400",
    checked_out: "bg-emerald-400",
    cancelled: "bg-rose-400",
    no_show: "bg-slate-400",
};
