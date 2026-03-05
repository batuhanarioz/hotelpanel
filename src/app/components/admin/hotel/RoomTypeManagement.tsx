"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { RoomType } from "@/types/database";

export function RoomTypeManagement() {
    const { hotelId } = useHotel();
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<RoomType | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState(0);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [amenities, setAmenities] = useState<string[]>([]);
    const [newAmenity, setNewAmenity] = useState("");

    useEffect(() => {
        if (hotelId) fetchRoomTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("room_types")
                .select("*")
                .eq("hotel_id", hotelId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setRoomTypes(data || []);
        } catch (err) {
            console.error("Room types fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingType(null);
        setName("");
        setDescription("");
        setBasePrice(0);
        setAdults(2);
        setChildren(0);
        setAmenities([]);
        setModalOpen(true);
    };

    const openEdit = (type: RoomType) => {
        setEditingType(type);
        setName(type.name);
        setDescription(type.description || "");
        setBasePrice(type.base_price);
        setAdults(type.capacity_adults);
        setChildren(type.capacity_children);
        setAmenities(type.amenities || []);
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            hotel_id: hotelId,
            name,
            description,
            base_price: basePrice,
            capacity_adults: adults,
            capacity_children: children,
            amenities
        };

        try {
            if (editingType) {
                const { error } = await supabase
                    .from("room_types")
                    .update(payload)
                    .eq("id", editingType.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("room_types")
                    .insert([payload]);
                if (error) throw error;
            }
            setModalOpen(false);
            fetchRoomTypes();
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert("Hata: " + err.message);
            } else {
                alert("Beklenmeyen bir hata oluştu.");
            }
        }
    };

    const addAmenity = () => {
        if (!newAmenity.trim()) return;
        if (!amenities.includes(newAmenity.trim())) {
            setAmenities([...amenities, newAmenity.trim()]);
        }
        setNewAmenity("");
    };

    const removeAmenity = (item: string) => {
        setAmenities(amenities.filter(a => a !== item));
    };

    if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800 italic-none">Oda Tipleri</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Oda kategorilerini ve standartlarını belirleyin</p>
                </div>
                <button
                    onClick={openCreate}
                    className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg shadow-teal-100/50 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Yeni Oda Tipi
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roomTypes.map((type) => (
                    <div key={type.id} className="p-6 rounded-3xl border bg-white shadow-sm hover:border-teal-200 transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-base font-black text-slate-800 tracking-tight">{type.name}</h4>
                                <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">{type.description || "Açıklama belirtilmemiş"}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black text-teal-600">{type.base_price.toLocaleString()} TL</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Taban Fiyat</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 italic-none">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                <span className="text-xs font-bold text-slate-600">{type.capacity_adults} Yetişkin</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 italic-none">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                <span className="text-xs font-bold text-slate-600">{type.capacity_children} Çocuk</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-20">
                            {type.amenities?.map((tool, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">{tool}</span>
                            ))}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50/50 border-t flex justify-end gap-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <button onClick={() => openEdit(type)} className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Düzenle</button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-teal-800 to-teal-600 px-8 py-6">
                            <h3 className="text-white font-black text-lg italic-none">{editingType ? "Oda Tipini Düzenle" : "Yeni Oda Tipi"}</h3>
                            <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mt-0.5">Lütfen oda detaylarını eksiksiz giriniz</p>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-auto p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Oda Tipi Adı</label>
                                    <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Örn: Deluxe King Suite" className="w-full h-11 px-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Taban Fiyat (TL)</label>
                                    <input required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full h-11 px-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Açıklama</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 p-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none" placeholder="Oda hakkında kısa bilgi..." />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Max Yetişkin</label>
                                    <input value={adults} onChange={(e) => setAdults(Number(e.target.value))} type="number" min="1" className="w-full h-11 px-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Max Çocuk</label>
                                    <input value={children} onChange={(e) => setChildren(Number(e.target.value))} type="number" min="0" className="w-full h-11 px-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-600 uppercase tracking-tight">Oda Özellikleri (Amenities)</label>
                                <div className="flex gap-2 mb-3">
                                    <input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} type="text" placeholder="Örn: WiFi, Jakuzi, Mini Bar" className="flex-1 h-11 px-4 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700" />
                                    <button type="button" onClick={addAmenity} className="h-11 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition-all">Ekle</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 text-xs font-bold animate-in fade-in zoom-in duration-200">
                                            {item}
                                            <button type="button" onClick={() => removeAmenity(item)} className="hover:text-rose-600 transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="p-8 bg-slate-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={() => setModalOpen(false)} className="h-12 px-6 rounded-xl text-sm font-black text-slate-500 hover:text-slate-700 transition-all">Vazgeç</button>
                            <button type="submit" onClick={handleSave} className="h-12 px-10 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white text-sm font-black shadow-lg shadow-teal-100/50 hover:shadow-teal-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                {editingType ? "Değişiklikleri Kaydet" : "Oda Tipini Oluştur"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
