"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { BookingSource } from "@/types/database";

export function BookingSourceManagement() {
    const { hotelId } = useHotel();
    const [sources, setSources] = useState<BookingSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSourceName, setNewSourceName] = useState("");

    useEffect(() => {
        if (hotelId) fetchSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchSources = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("booking_sources").select("*").eq("hotel_id", hotelId).order("name", { ascending: true });
            if (error) throw error;
            setSources(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSourceName.trim()) return;
        try {
            const { data, error } = await supabase
                .from("booking_sources")
                .insert([{ hotel_id: hotelId, name: newSourceName }])
                .select()
                .single();

            if (error) throw error;
            setSources([...sources, data]);
            setNewSourceName("");
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from("booking_sources").delete().eq("id", id);
            if (error) throw error;
            setSources(sources.filter(s => s.id !== id));
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    if (loading && sources.length === 0) return <div className="p-4 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6 italic-none max-w-xl">
            <div>
                <h3 className="text-lg font-black text-slate-800">Rezervasyon Kaynakları</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Rezervasyonların hangi kanaldan geldiğini tanımlayın</p>
            </div>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    placeholder="Örn: Booking.com, Telefon, WhatsApp"
                    className="flex-1 h-11 px-4 rounded-xl border bg-white text-sm font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                />
                <button type="submit" className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg hover:bg-teal-700 transition-all">
                    Ekle
                </button>
            </form>

            <div className="grid grid-cols-1 gap-2">
                {sources.map(source => (
                    <div key={source.id} className="p-4 rounded-2xl border bg-white flex items-center justify-between group hover:border-teal-200 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </div>
                            <span className="text-sm font-bold text-slate-700">{source.name}</span>
                        </div>
                        <button onClick={() => handleDelete(source.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
