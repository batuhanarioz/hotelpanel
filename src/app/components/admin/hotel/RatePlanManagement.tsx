"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { RatePlan, RoomType, DailyPrice } from "@/types/database";
import { format, addDays, startOfToday } from "date-fns";
import { tr } from "date-fns/locale";

export function RatePlanManagement() {
    const { hotelId } = useHotel();
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [dailyPrices, setDailyPrices] = useState<DailyPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // View state
    const [startDate, setStartDate] = useState(startOfToday());
    const days = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));

    // Form states
    const [name, setName] = useState("");
    const [roomTypeId, setRoomTypeId] = useState("");
    const [currency, setCurrency] = useState("TRY");
    const [basePrice, setBasePrice] = useState(0);

    // Bulk Update states
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkPlanId, setBulkPlanId] = useState("");
    const [bulkStart, setBulkStart] = useState("");
    const [bulkEnd, setBulkEnd] = useState("");
    const [bulkPrice, setBulkPrice] = useState(0);

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (hotelId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId, startDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansRes, typesRes, pricesRes] = await Promise.all([
                supabase.from("rate_plans").select("*").eq("hotel_id", hotelId),
                supabase.from("room_types").select("*").eq("hotel_id", hotelId),
                supabase.from("daily_prices")
                    .select("*")
                    .eq("hotel_id", hotelId)
                    .gte("date", format(startDate, "yyyy-MM-dd"))
                    .lte("date", format(addDays(startDate, 14), "yyyy-MM-dd"))
            ]);

            setRatePlans(plansRes.data || []);
            setRoomTypes(typesRes.data || []);
            setDailyPrices(pricesRes.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("rate_plans")
                .insert([{
                    hotel_id: hotelId,
                    room_type_id: roomTypeId,
                    name,
                    currency,
                    base_price: basePrice
                }])
                .select()
                .single();

            if (error) throw error;
            setRatePlans([...ratePlans, data]);
            setModalOpen(false);
            setName("");
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    const handleBulkUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotelId || !bulkPlanId || !bulkStart || !bulkEnd) {
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        try {
            setUpdating(true);
            const plan = ratePlans.find(p => p.id === bulkPlanId);
            if (!plan) return;

            const start = new Date(bulkStart);
            const end = new Date(bulkEnd);

            if (end < start) {
                alert("Bitiş tarihi başlangıç tarihinden önce olamaz.");
                return;
            }

            const daysToUpdate: Partial<DailyPrice>[] = [];

            let curr = start;
            while (curr <= end) {
                const dateStr = format(curr, "yyyy-MM-dd");
                daysToUpdate.push({
                    hotel_id: hotelId,
                    rate_plan_id: bulkPlanId,
                    room_type_id: plan.room_type_id,
                    date: dateStr,
                    price: bulkPrice
                });
                curr = addDays(curr, 1);
            }

            // Batched upsert
            const { error } = await supabase
                .from("daily_prices")
                .upsert(daysToUpdate, { onConflict: 'rate_plan_id,date' });

            if (error) throw error;

            setBulkOpen(false);
            fetchData();
        } catch (err: unknown) {
            alert("Güncelleme hatası: " + (err as Error).message);
        } finally {
            setUpdating(false);
        }
    };

    const getPrice = (planId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const priceObj = dailyPrices.find(p => p.rate_plan_id === planId && p.date === dateStr);
        if (priceObj) return priceObj.price;
        return ratePlans.find(p => p.id === planId)?.base_price || 0;
    };

    if (loading && ratePlans.length === 0) return <div className="p-4 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6 italic-none">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Fiyat Planları & Takvimi</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Günlük oda fiyatlarını ve stratejilerinizi yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setBulkPlanId("");
                            setBulkStart(format(new Date(), "yyyy-MM-dd"));
                            setBulkEnd(format(addDays(new Date(), 7), "yyyy-MM-dd"));
                            setBulkPrice(0);
                            setBulkOpen(true);
                        }}
                        className="h-11 px-6 rounded-xl border-2 border-indigo-100 text-indigo-600 text-xs font-black hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Toplu Fiyat Güncelle
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="h-11 px-6 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Yeni Fiyat Planı
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4 bg-slate-50 p-2 rounded-2xl w-fit border border-slate-100">
                <button onClick={() => setStartDate(addDays(startDate, -7))} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="px-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                    {format(startDate, "d MMMM", { locale: tr })} - {format(days[13], "d MMMM yyyy", { locale: tr })}
                </div>
                <button onClick={() => setStartDate(addDays(startDate, 7))} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="sticky left-0 z-20 bg-slate-50 px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[240px] border-r border-slate-100">Fiyat Planı / Tarih</th>
                                {days.map(day => (
                                    <th key={day.toISOString()} className={`px-4 py-5 text-center border-r border-slate-100 last:border-r-0 ${[0, 6].includes(day.getDay()) ? 'bg-indigo-50/30' : ''}`}>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{format(day, "EEE", { locale: tr })}</p>
                                        <p className={`text-xs font-black ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'text-indigo-600' : 'text-slate-800'}`}>{format(day, "dd/MM")}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ratePlans.length === 0 ? (
                                <tr><td colSpan={days.length + 1} className="p-20 text-center text-slate-400 font-bold italic">Henüz fiyat planı tanımlanmamış.</td></tr>
                            ) : (
                                ratePlans.map(plan => (
                                    <tr key={plan.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 px-8 py-5 border-r border-slate-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                                            <p className="text-sm font-black text-slate-800 mb-0.5">{plan.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{roomTypes.find(t => t.id === plan.room_type_id)?.name || "Oda Tipi"}</p>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const price = getPrice(plan.id, day);
                                            return (
                                                <td
                                                    key={day.toISOString()}
                                                    onClick={() => {
                                                        setBulkPlanId(plan.id);
                                                        setBulkStart(format(day, "yyyy-MM-dd"));
                                                        setBulkEnd(format(day, "yyyy-MM-dd"));
                                                        setBulkPrice(price);
                                                        setBulkOpen(true);
                                                    }}
                                                    className={`px-2 py-5 text-center border-r border-slate-50 last:border-r-0 cursor-pointer hover:bg-indigo-50 transition-all ${[0, 6].includes(day.getDay()) ? 'bg-slate-50/20' : ''}`}
                                                >
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-[13px] font-black text-slate-800 tracking-tight">{price.toLocaleString()}</span>
                                                        <span className="text-[9px] font-bold text-slate-400">{plan.currency}</span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Update Modal */}
            {bulkOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col scale-in-center">
                        <div className="bg-gradient-to-r from-indigo-700 to-violet-800 px-8 py-6 relative">
                            <h3 className="text-white font-black text-xl italic-none">Toplu Fiyat Güncelle</h3>
                            <button onClick={() => setBulkOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleBulkUpdate} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">İşlem Yapılacak Plan</label>
                                <select required value={bulkPlanId} onChange={(e) => setBulkPlanId(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700">
                                    <option value="">Fiyat Planı Seçin...</option>
                                    {ratePlans.map(p => <option key={p.id} value={p.id}>{p.name} ({roomTypes.find(t => t.id === p.room_type_id)?.name})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Başlangıç Tarihi</label>
                                    <input required type="date" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Bitiş Tarihi</label>
                                    <input required type="date" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Yeni Günlük Fiyat</label>
                                <div className="relative">
                                    <input required value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} type="number" step="0.01" className="w-full h-14 pl-5 pr-12 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-base font-black text-slate-800" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                                        {ratePlans.find(p => p.id === bulkPlanId)?.currency || "TRY"}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold mt-2 pl-1">Seçilen tarih aralığındaki tüm günlerin fiyatı bu değer ile güncellenecektir.</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button type="button" onClick={() => setBulkOpen(false)} className="flex-1 h-14 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest">Vazgeç</button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Fiyatları Uygula
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Plan Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-center">
                        <div className="bg-indigo-700 px-8 py-6">
                            <h3 className="text-white font-black text-lg italic-none">Yeni Fiyat Planı</h3>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Plan Adı</label>
                                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Örn: Standart Rate" className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">İlgili Oda Tipi</label>
                                <select required value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)} className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white outline-none text-sm font-black text-slate-700">
                                    <option value="">Oda Tipi Seçin</option>
                                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Para Birimi</label>
                                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white outline-none text-sm font-black text-slate-700">
                                        <option value="TRY">TRY</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Taban Fiyat</label>
                                    <input required value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full h-12 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white outline-none text-sm font-black text-slate-800" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">İptal</button>
                                <button type="submit" className="px-8 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest">Planı Oluştur</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
