"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";

export function ReservationIdSettings() {
    const { hotelId, isAdmin } = useHotel();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [prefix, setPrefix] = useState("");
    const [format, setFormat] = useState("PREFIX-RANDOM");
    const [preview, setPreview] = useState("");

    useEffect(() => {
        if (hotelId) fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    useEffect(() => {
        generatePreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix, format]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("hotels")
                .select("reservation_id_prefix, reservation_id_format, name")
                .eq("id", hotelId)
                .single();

            if (error) throw error;
            if (data) {
                setPrefix(data.reservation_id_prefix || data.name.substring(0, 3).toUpperCase());
                setFormat(data.reservation_id_format || "PREFIX-RANDOM");
            }
        } catch (err: unknown) {
            console.error("Settings fetch error:", err);
            setError("Ayarlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const generatePreview = () => {
        const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const year = new Date().getFullYear().toString().substring(2);

        let p = format;
        p = p.replace("PREFIX", prefix || "PREFIX");
        p = p.replace("RANDOM", randStr);
        p = p.replace("YYYY", new Date().getFullYear().toString());
        p = p.replace("YY", year);

        setPreview(p);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const { error } = await supabase
                .from("hotels")
                .update({
                    reservation_id_prefix: prefix,
                    reservation_id_format: format
                })
                .eq("id", hotelId);

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            setError((err as Error).message || "Kaydedilirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-bold mb-2">Bu alanı görüntüleme yetkiniz yok.</p>
                <p className="text-sm text-slate-400">Sadece otel yöneticileri rezervasyon ID ayarlarını değiştirebilir.</p>
            </div>
        );
    }

    if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-800 italic-none">Rezervasyon Kimlik (ID) Ayarları</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 max-w-2xl leading-relaxed">
                    Sistemde oluşturulan her yeni rezervasyon için benzersiz bir referans numarası atanır.
                    Bu numaranın nasıl oluşturulacağını buradan özelleştirebilirsiniz.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Otel ID Öneki (Prefix)</label>
                        <input
                            type="text"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5))}
                            placeholder="Örn: DEMO"
                            className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all text-sm font-bold text-slate-700 uppercase"
                        />
                        <p className="text-[10px] text-slate-400 font-bold pl-1">Maksimum 5 karakter (Sadece harf ve rakam)</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-tight">ID Şablon Formatı</label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border bg-white focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat"
                        >
                            <option value="PREFIX-RANDOM">Standart: Önek - Rastgele (Örn: DEMO-A1B2C3)</option>
                            <option value="PREFIX-YY-RANDOM">Yıllı: Önek - Yıl - Rastgele (Örn: DEMO-26-A1B2C3)</option>
                            <option value="PREFIX-YYYY-RANDOM">Tam Yıllı: Önek - YYYY - Rastgele (Örn: DEMO-2026-A1B2)</option>
                        </select>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Canlı Önizleme</h4>
                        <p className="text-xs text-slate-500 font-semibold mb-0">Misafirlerin göreceği ID yapısı:</p>
                    </div>
                    <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-lg font-black text-indigo-700 tracking-wider">
                        {preview}
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold italic-none">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold italic-none flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Rezervasyon ID şablonu başarıyla güncellendi.
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-12 px-8 rounded-xl bg-slate-800 text-white text-sm font-black shadow-lg shadow-slate-200 hover:shadow-slate-300 hover:translate-y-[-2px] hover:scale-[1.01] active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                    </button>
                    <p className="text-[10px] text-slate-400 font-bold mt-4">
                        Not: Buradaki değişiklikler <span className="text-slate-600">gelecekteki</span> rezervasyonları etkiler. Mevcut rezervasyonların ID'leri değişmez.
                    </p>
                </div>
            </form>
        </div>
    );
}
