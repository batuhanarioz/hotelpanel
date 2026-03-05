import React from "react";
import { ReservationFolio } from "@/hooks/useFolio";

interface FolioListProps {
    folios: ReservationFolio[];
    loading: boolean;
    onViewFolio: (id: string) => void;
    // Filters
    roomSearch: string;
    setRoomSearch: (v: string) => void;
    statusFilter: string;
    setStatusFilter: (v: string) => void;
    currencyFilter: string;
    setCurrencyFilter: (v: string) => void;
    // Pagination
    page: number;
    setPage: (v: number) => void;
    pageSize: number;
    setPageSize: (v: number) => void;
    totalCount: number;
}

export function FolioList({
    folios, loading, onViewFolio,
    roomSearch, setRoomSearch,
    statusFilter, setStatusFilter,
    currencyFilter, setCurrencyFilter,
    page, setPage, pageSize, setPageSize, totalCount
}: FolioListProps) {
    const statusBadge = (s: string) => {
        switch (s) {
            case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "partial": return "bg-amber-100 text-amber-700 border-amber-200";
            case "refunded": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    const statusLabel = (s: string) => {
        switch (s) {
            case "paid": return "Ödendi";
            case "partial": return "Kısmi";
            case "refunded": return "İade";
            default: return "Ödenmedi";
        }
    };

    if (loading) {
        return (
            <div className="px-5 py-12 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
                <svg className="h-6 w-6 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 italic-none">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 border-b border-slate-100 rounded-t-2xl">
                <div className="relative flex-1 min-w-[150px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Oda No ile Ara..."
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="unpaid">Ödenmedi</option>
                    <option value="partial">Kısmi</option>
                    <option value="paid">Ödendi</option>
                    <option value="refunded">İade Edildi</option>
                </select>

                <select
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                >
                    <option value="all">Tüm Para Birimleri</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                </select>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    {totalCount} Kayıt Bulundu (Sayfa {page})
                </div>
            </div>

            <div className="divide-y divide-slate-100">
                {folios.length === 0 ? (
                    <div className="px-5 py-16 text-center text-slate-400 flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 border shadow-sm">
                            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium">Bu dönemde folyo kaydı bulunmuyor</p>
                    </div>
                ) : folios.map((f) => (
                    <div
                        key={f.id}
                        className="w-full grid grid-cols-[2fr_1fr_auto] sm:grid-cols-[1.5fr_1fr_1fr_1.5fr_auto_auto] gap-3 sm:gap-4 items-center px-4 sm:px-5 py-4 hover:bg-slate-50/80 transition-colors group"
                    >
                        {/* Guest & Room */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 font-bold border border-indigo-100 shadow-sm leading-none">
                                <span className="text-[9px] uppercase tracking-tighter opacity-70 mb-0.5">Oda</span>
                                <span className="text-sm tracking-tight">{f.room_number || "—"}</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[13px] sm:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                                    {f.guest_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                    Kayıt #{f.id.slice(0, 6)} &bull; {f.guest_count} Kişi
                                </span>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="hidden sm:flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold truncate">
                                <svg className="h-3 w-3 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                                {new Date(f.check_in_date).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit' })} - {new Date(f.check_out_date).toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit' })}
                            </div>
                        </div>

                        {/* Financials: Charges & Payments */}
                        <div className="hidden sm:flex flex-col min-w-0">
                            <div className="flex justify-between text-[11px] font-bold mb-0.5">
                                <span className="text-slate-400">Tutar:</span>
                                <span className="text-slate-700">{f.total_charges.toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Ödenen:</span>
                                <span className="text-emerald-600">{f.total_payments.toLocaleString("tr-TR")} ₺</span>
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="flex flex-col items-end sm:items-start justify-center gap-1 min-w-0">
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-tight">Kalan Bakiye</span>
                            <span className={`text-[13px] sm:text-[15px] font-black tracking-tight ${f.balance > 0 ? "text-amber-600" : f.balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                {f.balance.toLocaleString("tr-TR")} ₺
                            </span>
                        </div>

                        {/* Status Badge */}
                        <div className="hidden sm:flex flex-col items-end justify-center gap-1.5">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] uppercase font-black tracking-widest border ${statusBadge(f.payment_status)}`}>
                                {statusLabel(f.payment_status)}
                            </span>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => onViewFolio(f.id)}
                                className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap"
                            >
                                <span className="hidden sm:inline">Folyo </span>Görüntüle
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border-t border-slate-100 rounded-b-2xl italic-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sayfa Başı:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            {[50, 100, 200].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l pl-4">
                        {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} / {totalCount}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
                            const p = i + 1;
                            // Basic logic to show pages around current page if many pages
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${page === p ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        {Math.ceil(totalCount / pageSize) > 5 && (
                            <span className="text-slate-300 px-1 font-black underline decoration-indigo-300 decoration-2">...</span>
                        )}
                    </div>

                    <button
                        onClick={() => setPage(Math.min(Math.ceil(totalCount / pageSize), page + 1))}
                        disabled={page >= Math.ceil(totalCount / pageSize)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
