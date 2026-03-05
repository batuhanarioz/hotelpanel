"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { BoardType } from "@/types/database";

export function BoardTypeManagement() {
    const { hotelId } = useHotel();
    const [boardTypes, setBoardTypes] = useState<BoardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<BoardType | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [breakfast, setBreakfast] = useState("07:00-10:00");
    const [lunch, setLunch] = useState("12:30-14:30");
    const [dinner, setDinner] = useState("19:00-21:30");

    useEffect(() => {
        if (hotelId) fetchBoardTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchBoardTypes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("board_types")
                .select("*")
                .eq("hotel_id", hotelId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setBoardTypes(data || []);
        } catch (err) {
            console.error("Board types fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingType(null);
        setName("");
        setCode("");
        setDescription("");
        setBreakfast("07:00-10:00");
        setLunch("12:30-14:30");
        setDinner("19:00-21:30");
        setModalOpen(true);
    };

    const openEdit = (type: BoardType) => {
        setEditingType(type);
        setName(type.name);
        setCode(type.code || "");
        setDescription(type.description || "");
        setBreakfast(type.meal_times.breakfast || "");
        setLunch(type.meal_times.lunch || "");
        setDinner(type.meal_times.dinner || "");
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            hotel_id: hotelId,
            name,
            code: code.toUpperCase(),
            description,
            meal_times: {
                breakfast,
                lunch,
                dinner
            }
        };

        try {
            if (editingType) {
                const { error } = await supabase
                    .from("board_types")
                    .update(payload)
                    .eq("id", editingType.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("board_types")
                    .insert([payload]);
                if (error) throw error;
            }
            setModalOpen(false);
            fetchBoardTypes();
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu pansiyon tipini silmek istediğinizden emin misiniz?")) return;
        try {
            const { error } = await supabase.from("board_types").delete().eq("id", id);
            if (error) throw error;
            setBoardTypes(boardTypes.filter(b => b.id !== id));
        } catch (err: unknown) {
            alert("Silme hatası: " + (err as Error).message);
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800 italic-none">Pansiyon & Yemek Tipleri</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Konaklama paketlerini ve yemek saatlerini yönetin</p>
                </div>
                <button
                    onClick={openCreate}
                    className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg shadow-teal-100/50 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Yeni Pansiyon Tipi
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boardTypes.map((type) => (
                    <div key={type.id} className="p-6 rounded-3xl border bg-white shadow-sm flex flex-col group relative overflow-hidden italic-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">
                                {type.code || type.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800">{type.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{type.code}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-16">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Kahvaltı:</span>
                                <span className="text-slate-700">{type.meal_times.breakfast || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Öğle Yemeği:</span>
                                <span className="text-slate-700">{type.meal_times.lunch || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Akşam Yemeği:</span>
                                <span className="text-slate-700">{type.meal_times.dinner || "-"}</span>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50/50 border-t flex justify-end gap-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <button onClick={() => openEdit(type)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(type.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-md overflow-hidden italic-none">
                        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-6 py-4">
                            <h3 className="text-white font-black text-lg">Pansiyon Tipini Ayarla</h3>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Pansiyon Adı</label>
                                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Örn: Her Şey Dahil" className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Kısa Kod</label>
                                <input value={code} onChange={(e) => setCode(e.target.value)} type="text" placeholder="Örn: AI, BB, HB" className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" />
                            </div>

                            <div className="pt-2 border-t border-slate-100 mt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Yemek Saatleri</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600">Kahvaltı</label>
                                        <input value={breakfast} onChange={(e) => setBreakfast(e.target.value)} type="text" className="w-32 h-9 px-3 rounded-lg border text-xs font-bold text-slate-700" placeholder="07:00-10:00" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600">Öğle Yemeği</label>
                                        <input value={lunch} onChange={(e) => setLunch(e.target.value)} type="text" className="w-32 h-9 px-3 rounded-lg border text-xs font-bold text-slate-700" placeholder="12:30-14:30" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-600">Akşam Yemeği</label>
                                        <input value={dinner} onChange={(e) => setDinner(e.target.value)} type="text" className="w-32 h-9 px-3 rounded-lg border text-xs font-bold text-slate-700" placeholder="19:00-21:30" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">İptal</button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
