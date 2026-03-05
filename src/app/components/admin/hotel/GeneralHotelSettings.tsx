"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";

export function GeneralHotelSettings() {
    const { hotelId } = useHotel();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [checkIn, setCheckIn] = useState("14:00");
    const [checkOut, setCheckOut] = useState("12:00");
    const [currency, setCurrency] = useState("TRY");
    const [noShowMode, setNoShowMode] = useState("candidate");
    const [gracePeriod, setGracePeriod] = useState(240);
    const [allowOverbooking, setAllowOverbooking] = useState(false);

    // Reservation ID Settings
    const [prefix, setPrefix] = useState("");
    const [idFormat, setIdFormat] = useState("PREFIX-RANDOM");
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (hotelId) fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    useEffect(() => {
        generatePreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix, idFormat]);

    const generatePreview = () => {
        const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const year = new Date().getFullYear().toString().substring(2);

        let p = idFormat;
        p = p.replace("PREFIX", prefix || "PREFIX");
        p = p.replace("RANDOM", randStr);
        p = p.replace("YYYY", new Date().getFullYear().toString());
        p = p.replace("YY", year);

        setPreview(p);
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("hotels")
                .select("check_in_time, check_out_time, default_currency, reservation_id_prefix, reservation_id_format, name")
                .eq("id", hotelId)
                .single();

            if (error) throw error;
            if (data) {
                setCheckIn(data.check_in_time?.slice(0, 5) || "14:00");
                setCheckOut(data.check_out_time?.slice(0, 5) || "12:00");
                setCurrency(data.default_currency || "TRY");
                setPrefix(data.reservation_id_prefix || data.name.substring(0, 3).toUpperCase());
                setIdFormat(data.reservation_id_format || "PREFIX-RANDOM");
            }

            // Fetch Auto No-Show Settings
            const { data: sData } = await supabase
                .from("hotel_settings")
                .select("auto_no_show_mode, no_show_grace_period_minutes, allow_overbooking")
                .eq("hotel_id", hotelId)
                .maybeSingle();

            if (sData) {
                setNoShowMode(sData.auto_no_show_mode || "candidate");
                setGracePeriod(sData.no_show_grace_period_minutes || 240);
                setAllowOverbooking(sData.allow_overbooking || false);
            }
        } catch (err: unknown) {
            console.error("Settings fetch error:", err);
            setError("Ayarlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const { error } = await supabase
                .from("hotels")
                .update({
                    check_in_time: checkIn,
                    check_out_time: checkOut,
                    default_currency: currency,
                    reservation_id_prefix: prefix,
                    reservation_id_format: idFormat
                })
                .eq("id", hotelId);

            if (error) throw error;

            // Save Auto No-Show Settings
            const { error: sError } = await supabase
                .from("hotel_settings")
                .upsert({
                    hotel_id: hotelId,
                    auto_no_show_mode: noShowMode,
                    no_show_grace_period_minutes: gracePeriod,
                    allow_overbooking: allowOverbooking,
                    updated_at: new Date().toISOString()
                });

            if (sError) throw sError;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            setError((err as Error).message || "Kaydedilirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-800 italic-none">Genel Otel Ayarları</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Otel genel operasyonel kurallarını belirleyin</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Varsayılan Check-in Saati</label>
                        <input
                            type="time"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Varsayılan Check-out Saati</label>
                        <input
                            type="time"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Varsayılan Para Birimi</label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat"
                    >
                        <option value="TRY">Türk Lirası (TRY)</option>
                        <option value="USD">Amerikan Doları (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">İngiliz Sterlini (GBP)</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="mb-4">
                        <h4 className="text-sm font-black text-slate-800">Otomatik No-Show Yönetimi</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Check-in yapmayan misafirlerin otomatik tespiti</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Çalışma Modu</label>
                            <select
                                value={noShowMode}
                                onChange={(e) => setNoShowMode(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat"
                            >
                                <option value="off">Kapalı</option>
                                <option value="candidate">Aday Modu (Resepsiyon Onaylı)</option>
                                <option value="auto">Tam Otomatik (Önerilmez)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Gecikme Toleransı (Grace Period)</label>
                            <select
                                value={gracePeriod}
                                onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                                className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat"
                                disabled={noShowMode === 'off'}
                            >
                                <option value={120}>2 Saat (120 dk)</option>
                                <option value={180}>3 Saat (180 dk)</option>
                                <option value={240}>4 Saat (240 dk)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="mb-4">
                        <h4 className="text-sm font-black text-slate-800">Rezervasyon Kimlik (Referans) Yapısı</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Rezervasyonlara verilecek otomatik kod şablonu</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 bg-white shadow-sm mb-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ID Formatı</label>
                            <select
                                value={idFormat}
                                onChange={(e) => setIdFormat(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-all text-sm font-black text-slate-700"
                            >
                                <option value="PREFIX-RANDOM">Standart: Önek - Rastgele</option>
                                <option value="PREFIX-YY-RANDOM">Yıllı: Önek - Yıl - Rastgele</option>
                                <option value="PREFIX-YYYY-RANDOM">Tam Yıllı: Önek - YYYY - Rastgele</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Önek (Prefix)</label>
                            <input
                                type="text"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5))}
                                className="w-full h-12 px-4 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-teal-500 outline-none transition-all text-sm font-black text-slate-700 uppercase"
                            />
                        </div>
                        <div className="col-span-full pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Önizleme:</span>
                            <span className="px-5 py-2.5 bg-slate-50 rounded-xl text-lg font-black text-slate-700 tracking-wider shadow-inner">{preview}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="mb-4">
                        <h4 className="text-sm font-black text-slate-800">Operasyonel Güvenlik</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Rezervasyon ve oda yönetimi kuralları</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <div>
                                <h5 className="text-xs font-black text-slate-700 uppercase">Overbooking (Fazla Rezervasyon)</h5>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Dolu odalara rezervasyon yapılmasına izin ver</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAllowOverbooking(!allowOverbooking)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${allowOverbooking ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowOverbooking ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold italic-none">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold italic-none flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Ayarlar başarıyla kaydedildi.
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-8 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white text-sm font-black shadow-lg shadow-teal-100/50 hover:shadow-teal-200/50 hover:translate-y-[-2px] hover:scale-[1.02] active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </button>
                </div>
            </form>
        </div>
    );
}
