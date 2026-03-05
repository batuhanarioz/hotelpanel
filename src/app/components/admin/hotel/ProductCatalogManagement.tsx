"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { ProductCatalog } from "@/types/database";

export function ProductCatalogManagement() {
    const { hotelId } = useHotel();
    const [products, setProducts] = useState<ProductCatalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [currency] = useState("TRY");
    const [taxRate, setTaxRate] = useState(20); // Default 20%
    const [category, setCategory] = useState("F&B");

    useEffect(() => {
        if (hotelId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("products_catalog").select("*").eq("hotel_id", hotelId).order("category", { ascending: true });
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("products_catalog")
                .insert([{
                    hotel_id: hotelId,
                    name,
                    description,
                    price,
                    currency,
                    tax_rate: taxRate,
                    category
                }])
                .select()
                .single();

            if (error) throw error;
            setProducts([...products, data]);
            setModalOpen(false);
            setName("");
            setDescription("");
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
        try {
            const { error } = await supabase.from("products_catalog").delete().eq("id", id);
            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    if (loading && products.length === 0) return <div className="p-4 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6 italic-none">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Ürün & Hizmet Kataloğu</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ekstra harcamalar (minibar, spa, restoran vb.) için ürün listesi</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg hover:bg-teal-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Yeni Ürün Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="p-6 rounded-3xl border bg-white shadow-sm flex flex-col group relative overflow-hidden transition-all hover:border-teal-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">{product.category}</span>
                                <h4 className="text-sm font-black text-slate-800 mt-2">{product.name}</h4>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-teal-600">{product.price.toLocaleString()} {product.currency}</p>
                                <p className="text-[9px] font-bold text-slate-400">+% {product.tax_rate} KDV</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{product.description || "Açıklama yok"}</p>

                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-50/50 border-t flex justify-end gap-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-md overflow-hidden flex flex-col">
                        <div className="bg-emerald-700 px-6 py-4">
                            <h3 className="text-white font-black text-lg">Yeni Ürün/Hizmet Tanımla</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Ürün Adı</label>
                                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Örn: Masaj, Su (0.5L)" className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Kategori</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold">
                                    <option value="F&B">Yiyecek & İçecek</option>
                                    <option value="Minibar">Minibar</option>
                                    <option value="Spa">Spa & Wellness</option>
                                    <option value="Transfer">Transfer & Ulaşım</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Birim Fiyat</label>
                                    <input required value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">KDV %</label>
                                    <input required value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} type="number" className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Açıklama</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-20 p-4 rounded-xl border bg-slate-50 text-sm font-bold resize-none" />
                            </div>
                            <div className="flex justify-end gap-2 pt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">İptal</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-emerald-600 text-white text-sm font-black shadow-lg hover:bg-emerald-700 transition-all">Ürünü Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
