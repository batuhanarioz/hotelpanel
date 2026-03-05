"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GuestRow, GuestReservation, GuestFolio } from "@/hooks/useGuests";
import { useHotel } from "@/app/context/HotelContext";

interface GuestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    guest: GuestRow | null;
    reservations: GuestReservation[];
    folios: GuestFolio[];
    auditLogs?: any[];
    financialSummary?: any;
    onDelete?: (id: string) => Promise<boolean>;
    onUpdate: (id: string, updates: Partial<GuestRow>) => Promise<boolean>;
    isLoading?: boolean;
}

type TabType = 'overview' | 'history' | 'documents' | 'notes' | 'preferences';

export function GuestDetailModal({
    isOpen,
    onClose,
    guest,
    reservations,
    folios,
    auditLogs = [],
    financialSummary,
    onUpdate
}: GuestDetailModalProps) {
    const hotelCtx = useHotel();
    const [activeTab, setActiveTab] = useState<TabType>('overview');


    useEffect(() => {
        if (guest) {
            // Setup edit form state if needed in the future
        }
    }, [guest, isOpen]);

    const stats = useMemo(() => {
        const totalVisits = reservations.filter(r => r.status !== 'cancelled').length;
        const totalNights = reservations.reduce((sum, r) => {
            if (r.status === 'cancelled') return sum;
            const start = new Date(r.check_in_date);
            const end = new Date(r.check_out_date);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + (diff > 0 ? diff : 0);
        }, 0);

        let totalDebt = 0;
        let totalCollected = 0;

        folios.forEach(p => {
            if (p.status !== 'posted') return;

            const isPayment = p.item_type === "payment" || p.item_type === "discount";
            const isRefund = p.item_type === "refund";

            if (isPayment) {
                totalCollected += p.base_amount;
            } else if (isRefund) {
                totalDebt += p.base_amount;
            } else {
                totalDebt += p.base_amount;
            }
        });

        const totalPaid = totalCollected;
        const openBalance = totalDebt - totalCollected;

        const activeRes = reservations.find(r => r.status === 'checked_in') ||
            reservations.find(r => r.status === 'confirmed' && new Date(r.check_in_date) >= new Date());

        const lastPaymentDate = folios.filter(f => f.item_type === 'payment').length > 0
            ? new Date(Math.max(...folios.filter(f => f.item_type === 'payment').map(f => f.created_at ? new Date(f.created_at).getTime() : 0))).toLocaleDateString("tr-TR")
            : "-";

        return { totalVisits, totalNights, totalPaid, totalDebt, openBalance, activeRes, lastPaymentDate };
    }, [reservations, folios]);

    if (!isOpen || !guest) return null;

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Genel Bakış', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg> },
        { id: 'history', label: 'Rezervasyonlar', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> },
        { id: 'documents', label: 'Belgeler', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3h7.5M8.25 6.75h7.5M6.25 3h11.5a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25H6.25A2.25 2.25 0 014 18.75V5.25A2.25 2.25 0 016.25 3z" /></svg> },
        { id: 'notes', label: 'Notlar', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg> },
        { id: 'preferences', label: 'Tercihler', icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.937 6.937 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.127.332-.184.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-4xl bg-[#f8fafc] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>

                {/* Header Profile Summary */}
                <div className="bg-white border-b p-6 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-100 uppercase">
                                {guest.full_name[0]}
                            </div>
                            {guest.is_vip && <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1.5 rounded-lg shadow-md border-2 border-white" title="VIP"><svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.562.562 0 01.313.987l-4.183 3.593a.563.563 0 00-.162.499l1.117 5.485a.562.562 0 01-.818.594l-4.711-2.91a.562.562 0 00-.568 0l-4.711 2.91a.562.562 0 01-.818-.594l1.117-5.485a.563.563 0 00-.162-.499l-4.183-3.593a.562.562 0 01.313-.987l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" /></svg></div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-slate-900">{guest.full_name}</h2>
                                {guest.is_blacklist && <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-rose-200 uppercase tracking-tighter">KARA LİSTE</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-1">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                                    {guest.phone}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                    <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                                    {guest.email || "E-posta yok"}
                                </div>
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                                    <span className="text-[10px] bg-slate-100 px-1.5 rounded uppercase">{guest.id_type || 'ID'}</span>
                                    {guest.masked_identity_no || guest.identity_no || "Kayıt yok"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100">Yeni Rezervasyon</button>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="m14.74 9-.34 9m-4.78 0-.34-9m9.27 1.5h-15.5m1.5-3v14m12.5-3V5.25a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75V11.25" /></svg></button>
                        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M6 18 18 6M6 6l12 12" /></svg></button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white border-b px-6 flex items-center gap-1 shrink-0 scrollbar-hide overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Ziyaret</p>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalVisits}</p>
                                    <div className="h-1 w-full bg-slate-50 rounded-full mt-4 overflow-hidden"><div className="h-full bg-indigo-500 w-2/3"></div></div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Geceleme</p>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{stats.totalNights}</p>
                                    <div className="h-1 w-full bg-slate-50 rounded-full mt-4 overflow-hidden"><div className="h-full bg-emerald-500 w-1/2"></div></div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam Harcama</p>
                                    <p className="text-3xl font-black text-emerald-600 mt-1">{stats.totalDebt.toLocaleString()} ₺</p>
                                    <div className="h-1 w-full bg-slate-50 rounded-full mt-4 overflow-hidden"><div className="h-full bg-teal-500 w-3/4"></div></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-between">
                                        Aktif / Gelecek Rezervasyon
                                        {stats.activeRes && (
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm ${stats.activeRes.status === 'checked_in' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                {stats.activeRes.status === 'checked_in' ? 'Konaklıyor' : 'Onaylandı'}
                                            </span>
                                        )}
                                    </h3>
                                    {stats.activeRes ? (
                                        <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 p-5 group hover:border-emerald-200 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Oda Bilgisi</p>
                                                    <p className="text-xl font-black text-slate-900 mt-1.5 uppercase italic tracking-tighter">Oda {stats.activeRes.room_number || "-"}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pansiyon</p>
                                                    <p className="text-xs font-bold text-slate-700 mt-1 uppercase">{stats.activeRes.board_type || "Sadece Oda"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-3 border-y border-emerald-100/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Giriş</span>
                                                    <span className="text-sm font-bold text-slate-800">{new Date(stats.activeRes.check_in_date).toLocaleDateString("tr-TR")}</span>
                                                </div>
                                                <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" /></svg>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Çıkış</span>
                                                    <span className="text-sm font-bold text-slate-800">{new Date(stats.activeRes.check_out_date).toLocaleDateString("tr-TR")}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600">A</div>
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600">C</div>
                                                </div>
                                                <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Rezervasyon Detayı</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 group hover:bg-white hover:border-emerald-200 transition-all cursor-pointer">
                                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-slate-200 shadow-sm mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                            </div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aktif rezervasyon bulunmuyor</p>
                                            <button className="mt-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">+ Yeni Rezervasyon</button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Finansal Özet</h3>
                                            <a href={`payment-management?guestId=${guest.id}`} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Tüm İşlemler</a>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Toplam Harcama</p>
                                                <p className="text-lg font-black text-slate-900 mt-1">{financialSummary?.total_spent?.toLocaleString() || stats.totalDebt.toLocaleString()} ₺</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Açık Bakiye</p>
                                                <p className={`text-lg font-black mt-1 ${(financialSummary?.open_balance || stats.openBalance) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                                    {Math.abs(financialSummary?.open_balance || stats.openBalance).toLocaleString()} ₺
                                                </p>
                                            </div>
                                            <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Son Ödeme Tarihi</p>
                                                    <p className="text-xs font-bold text-slate-700 mt-1">{financialSummary?.last_payment_date ? new Date(financialSummary.last_payment_date).toLocaleDateString("tr-TR") : stats.lastPaymentDate}</p>
                                                </div>
                                                <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Son Aktivite</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase leading-none">Profil Görüntülendi</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Az Önce • {hotelCtx.hotelName}</p>
                                                </div>
                                            </div>
                                            {guest.created_at && (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase leading-none">Misafir Kaydı Oluşturuldu</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{new Date(guest.created_at).toLocaleString("tr-TR")}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {reservations.length > 0 ? (
                                <div className="space-y-3">
                                    {reservations.map(res => (
                                        <div key={res.id} className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 hover:bg-emerald-50/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all border border-slate-100 group-hover:border-emerald-200 uppercase">
                                                    <span className="text-[14px] font-black">{res.room_number || "?"}</span>
                                                    <span className="text-[8px] font-black tracking-widest">ODA</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-800 tracking-tight">{new Date(res.check_in_date).toLocaleDateString("tr-TR")} - {new Date(res.check_out_date).toLocaleDateString("tr-TR")}</p>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${res.status === 'checked_out' ? 'bg-slate-100 text-slate-500' :
                                                            res.status === 'checked_in' ? 'bg-emerald-500 text-white' :
                                                                res.status === 'confirmed' ? 'bg-blue-500 text-white' :
                                                                    res.status === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                            {res.status === 'checked_out' ? 'Çıkış Yaptı' :
                                                                res.status === 'checked_in' ? 'İçerde' :
                                                                    res.status === 'confirmed' ? 'Onaylı' :
                                                                        res.status === 'cancelled' ? 'İptal' : res.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{res.board_type || "Sadece Oda"} • {res.room_number ? `Oda ${res.room_number}` : "Oda atanmadı"}</p>
                                                </div>
                                            </div>
                                            <button className="h-10 w-10 flex items-center justify-center rounded-xl border-2 border-slate-50 text-slate-300 hover:text-emerald-500 hover:border-emerald-100 transition-all">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Geçmiş rezervasyon bulunmuyor</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm mb-4">
                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Yeni Belge Yükle</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Kimlik, Pasaport veya Diğer Dosyalar (PDF, JPG, PNG)</p>
                            </div>

                            {/* Placeholder for uploaded documents */}
                            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-slate-900 uppercase truncate">Kimlik Fotokopisi.jpg</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Yükleme: 12.02.2024 • 1.2 MB</p>
                                </div>
                                <div className="flex gap-1.5 px-2">
                                    <button className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                                    <button className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="m14.74 9-.34 9m-4.78 0-.34-9m9.27 1.5h-15.5m1.5-3v14m12.5-3V5.25a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75V11.25" /></svg></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-3xl p-4 border-2 border-slate-100 shadow-sm flex gap-3 group focus-within:border-emerald-300 transition-all">
                                        <input className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300" placeholder="Bir not ekleyin..." />
                                        <button className="h-10 px-6 rounded-2xl bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">Notu Kaydet</button>
                                    </div>

                                    <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 before:rounded-full">
                                        {/* Existing notes placeholder */}
                                        <div className="relative pl-8">
                                            <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-sm z-10"><div className="h-2 w-2 rounded-full bg-emerald-500"></div></div>
                                            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="text-xs font-black text-slate-900 leading-relaxed text-balance">Misafir her sabah oda servisi için saat 08:30&apos;da aranmak istiyor.</p>
                                                    <span className="shrink-0 bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Genel</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <p className="text-slate-600">Batuhan Arıöz</p>
                                                    <span>•</span>
                                                    <p>12.02.2024 14:30</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AUDIT TIMELINE (Enterprise) */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">İşlem Geçmişi (Audit)</h3>
                                    <div className="space-y-3">
                                        {auditLogs.map((log: any) => (
                                            <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${log.action === 'created' ? 'bg-emerald-100 text-emerald-700' :
                                                            log.action === 'merged' ? 'bg-indigo-100 text-indigo-700' :
                                                                log.action === 'blacklist_toggle' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-400">{new Date(log.created_at).toLocaleDateString("tr-TR")}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-700 mt-2">
                                                    {log.action === 'merged' ? 'Profil birleştirildi' :
                                                        log.action === 'blacklist_toggle' ? 'Kara liste durumu güncellendi' :
                                                            log.action === 'vip_changed' ? 'VIP seviyesi değiştirildi' : 'Bilgiler güncellendi'}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mt-1">İşlem: {log.actor?.full_name || "Sistem"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.562.562 0 01.313.987l-4.183 3.593a.563.563 0 00-.162.499l1.117 5.485a.562.562 0 01-.818.594l-4.711-2.91a.562.562 0 00-.568 0l-4.711 2.91a.562.562 0 01-.818-.594l1.117-5.485a.563.563 0 00-.162-.499l-4.183-3.593a.562.562 0 01.313-.987l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" /></svg>
                                    Özel Durumlar
                                </h3>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group cursor-pointer" onClick={() => onUpdate(guest.id, { is_vip: !guest.is_vip })}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${guest.is_vip ? 'bg-amber-100 text-amber-600 border border-amber-200 shadow-sm' : 'bg-white text-slate-300 border border-slate-100'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.562.562 0 01.313.987l-4.183 3.593a.563.563 0 00-.162.499l1.117 5.485a.562.562 0 01-.818.594l-4.711-2.91a.562.562 0 00-.568 0l-4.711 2.91a.562.562 0 01-.818-.594l1.117-5.485a.563.563 0 00-.162-.499l-4.183-3.593a.562.562 0 01.313-.987l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" /></svg></div>
                                            <div><p className="text-xs font-black text-slate-800 uppercase leading-none">VIP İşareti</p><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{guest.is_vip ? 'Aktif' : 'Pasif'}</p></div>
                                        </div>
                                        <div className={`h-6 w-11 rounded-full relative transition-all ${guest.is_vip ? 'bg-amber-500 shadow-sm shadow-amber-100' : 'bg-slate-200'}`}><div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${guest.is_vip ? 'right-1' : 'left-1'}`}></div></div>
                                    </div>

                                    <div className="flex flex-col gap-2 p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => onUpdate(guest.id, { is_blacklist: !guest.is_blacklist })}>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${guest.is_blacklist ? 'bg-rose-500 text-white shadow-md shadow-rose-100' : 'bg-white text-slate-300 border border-slate-100'}`}><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg></div>
                                                <div><p className="text-xs font-black text-slate-800 uppercase leading-none">Kara Liste</p><p className="text-[10px] font-bold text-rose-400 mt-1 uppercase tracking-tight">{guest.is_blacklist ? 'Açık' : 'Kapalı'}</p></div>
                                            </div>
                                            <div className={`h-6 w-11 rounded-full relative transition-all ${guest.is_blacklist ? 'bg-rose-500 shadow-sm shadow-rose-100' : 'bg-slate-200'}`}><div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${guest.is_blacklist ? 'right-1' : 'left-1'}`}></div></div>
                                        </div>
                                        {guest.is_blacklist && (
                                            <div className="mt-2 space-y-2">
                                                <textarea
                                                    className="w-full bg-white border border-rose-100 rounded-xl p-3 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-rose-300 transition-all"
                                                    placeholder="Neden kara listede? (Zorunlu)"
                                                    rows={2}
                                                    defaultValue={guest.blacklist_reason || ""}
                                                    onBlur={(e) => onUpdate(guest.id, { blacklist_reason: e.target.value })}
                                                />
                                                {!guest.blacklist_reason && <p className="text-[9px] font-black text-rose-500 uppercase italic">* Sebep belirtilmesi önerilir</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                                    Misafir Tercihleri
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex border-b border-slate-50 py-2">
                                        <p className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Yatak Tipi</p>
                                        <p className="flex-1 text-xs font-bold text-slate-700 uppercase">Geniş Çift Kişilik</p>
                                    </div>
                                    <div className="flex border-b border-slate-50 py-2">
                                        <p className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sigara</p>
                                        <p className="flex-1 text-xs font-bold text-slate-700 uppercase">İstemiyor</p>
                                    </div>
                                    <div className="flex border-b border-slate-50 py-2">
                                        <p className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Beslenme</p>
                                        <p className="flex-1 text-xs font-bold text-slate-700 uppercase">Vegan / Glütensiz</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path d="M10.34 15.84c-.68-.69-1.25-1.46-1.71-2.29M3 13.5a10 10 0 1 0 10-10C5.54 3.5 3 13.5 3 13.5Z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase leading-none">Pazarlama Onayı</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">SMS ve E-posta</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => onUpdate(guest.id, { marketing_consent: !guest.marketing_consent })}
                                            className={`h-6 w-11 rounded-full relative transition-all cursor-pointer ${guest.marketing_consent ? 'bg-indigo-500 shadow-sm shadow-indigo-100' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${guest.marketing_consent ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    <div className="flex py-2">
                                        <p className="w-1/3 text-[10px] font-black text-slate-400 uppercase tracking-widest">İletişim</p>
                                        <p className="flex-1 text-xs font-bold text-slate-700 uppercase">WhatsApp</p>
                                    </div>
                                </div>
                                <button className="mt-4 w-full h-11 rounded-2xl border-2 border-slate-50 text-xs font-black text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all uppercase tracking-widest">Tercihleri Düzenle</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-white border-t p-6 shrink-0 flex items-center justify-between gap-4">
                    <button onClick={onClose} className="px-6 h-12 rounded-2xl bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Kapat</button>
                    <div className="flex items-center gap-3">
                        <button className="h-12 px-6 rounded-2xl border-2 border-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12L12 16.5m0 0L16.5 12M12 16.5V3" /></svg> Rapor İndir</button>
                        <button onClick={() => alert("Profil düzenleme özelliği yakında aktif edilecektir.")} className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg> Bilgileri Düzenle</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
