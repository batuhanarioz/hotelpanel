"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { CalendarReservation } from "@/hooks/useReservationManagement";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission } from "@/types/permissions";
import { supabase } from "@/lib/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

interface ReservationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: CalendarReservation | null;
    onEdit: (res: CalendarReservation) => void;
    onStatusChange: (res: CalendarReservation, newStatus: string, note?: string) => void;
    onExtend: (res: CalendarReservation) => void;
    onMove: (res: CalendarReservation) => void;
    onDelete?: (res: CalendarReservation) => void;
}

const STATUS_LABELS: Record<string, string> = {
    confirmed: "Onaylandı",
    checked_in: "Giriş Yapıldı",
    checked_out: "Çıkış Yapıldı",
    cancelled: "İptal",
    no_show: "Gelmedi",
};

const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-indigo-100 text-indigo-700",
    checked_in: "bg-emerald-100 text-emerald-700",
    checked_out: "bg-slate-100 text-slate-700",
    cancelled: "bg-rose-100 text-rose-700",
    no_show: "bg-orange-100 text-orange-700",
};

export function ReservationDrawer({ isOpen, onClose, reservation, onEdit, onStatusChange, onExtend, onMove, onDelete }: ReservationDrawerProps) {
    const [copiedId, setCopiedId] = React.useState(false);
    const [copiedPhone, setCopiedPhone] = React.useState(false);
    const queryClient = useQueryClient();
    const { checkPermission } = usePermissions();

    if (!reservation) return null;

    const depositAmount = (reservation as CalendarReservation & { deposit_amount?: number }).deposit_amount || 0;
    const totalAmount = Number(reservation.total_amount || reservation.estimatedAmount || 0);

    const start = parseISO(reservation.checkInDate!);
    const end = parseISO(reservation.checkOutDate!);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const nightlyRate = reservation.nightly_rate || (totalAmount / nights);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[1000] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[1001] transform transition-transform duration-300 ease-out border-l border-slate-200 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_COLORS[reservation.dbStatus] || 'bg-slate-100 text-slate-600'}`}>
                                {STATUS_LABELS[reservation.dbStatus] || reservation.dbStatus}
                            </span>
                            {reservation.noShowCandidate && (() => {
                                const delay = Math.floor((new Date().getTime() - new Date(reservation.checkInDate!).getTime()) / 60000);
                                let colorClass = "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
                                if (delay >= 240) colorClass = "bg-rose-100 text-rose-700 border-rose-200 animate-pulse";
                                else if (delay >= 120) colorClass = "bg-orange-100 text-orange-700 border-orange-200";
                                return (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${colorClass}`}>
                                        NO-SHOW ADAY
                                    </span>
                                );
                            })()}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(reservation.reservationNumber || `#${reservation.id.slice(0, 8)}`);
                                    setCopiedId(true);
                                    setTimeout(() => setCopiedId(false), 2000);
                                }}
                                className={`text-[10px] flex items-center gap-1 font-black transition-colors uppercase tracking-widest px-2 py-1 rounded-full border shadow-sm group ${copiedId ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-400 hover:text-indigo-600 border-slate-100 hover:border-indigo-200'}`}
                                title={copiedId ? "Kopyalandı!" : "Kopyalamak için tıklayın"}
                            >
                                <span>ID: {reservation.reservationNumber || `#${reservation.id.slice(0, 8)}`}</span>
                                {copiedId ? (
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                )}
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">
                        {reservation.guestName}
                    </h3>
                    <div className="flex items-center justify-between gap-3 text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-xs font-bold">{reservation.phone || 'Telefon Yok'}</span>
                            </div>
                            {reservation.phone && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(reservation.phone!);
                                        setCopiedPhone(true);
                                        setTimeout(() => setCopiedPhone(false), 2000);
                                    }}
                                    className={`p-1 rounded transition-colors ${copiedPhone ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-slate-50 shadow-sm'} group`}
                                    title={copiedPhone ? "Kopyalandı!" : "Telefonu kopyalamak için tıklayın"}
                                >
                                    {copiedPhone ? (
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-3 h-3 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                </button>
                            )}
                        </div>
                        {reservation.phone && (
                            <a
                                href={`https://wa.me/${reservation.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase hover:bg-emerald-600 transition-colors shadow-sm"
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Stay Info */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Konaklama Bilgileri</h4>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                {nights} Gece
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Giriş</span>
                                <span className="text-sm font-black text-slate-800">{format(parseISO(reservation.checkInDate!), "d MMM yyyy", { locale: tr })}</span>
                                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">14:00&apos;den itibaren</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Çıkış</span>
                                <span className="text-sm font-black text-slate-800">{format(parseISO(reservation.checkOutDate!), "d MMM yyyy", { locale: tr })}</span>
                                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">12:00&apos;ye kadar</span>
                            </div>
                            <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 col-span-2 flex items-center justify-between shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Oda No</span>
                                    <span className="text-xl font-black text-indigo-700">{reservation.roomNumber ? `#${reservation.roomNumber}` : 'ATANMADI'}</span>
                                    <span className="text-[9px] font-bold text-indigo-400/60 uppercase">{reservation.boardType || 'Sadece Konaklama'}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Misafirler</span>
                                    <span className="text-xl font-black text-indigo-700">
                                        {(reservation as CalendarReservation & { adults_count?: number }).adults_count || 1}A
                                        {(reservation as CalendarReservation & { children_count?: number }).children_count ? ` + ${(reservation as CalendarReservation & { children_count?: number }).children_count}C` : ''}
                                    </span>
                                    <span className="text-[10px] font-bold text-indigo-400/60 uppercase capitalize">{reservation.channel}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Ödeme Özeti</h4>
                        <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
                            <div className="flex flex-col gap-1.5 mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Konaklama Detayı</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600">
                                        {nights} Gece x {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(nightlyRate)}
                                    </span>
                                    <span className="text-sm font-black text-slate-800">
                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                                <span className="font-bold text-slate-500">Toplam Tutar</span>
                                <span className="font-black text-slate-800">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Alınan Kapora</span>
                                <span className="font-black text-emerald-600">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(depositAmount)}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Kalan Bakiye</span>
                                    {reservation.payment_status === 'paid' && (
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">TAMAMI ÖDENDİ</span>
                                    )}
                                </div>
                                <span className={`text-xl font-black ${reservation.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-600'}`}>
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(totalAmount - depositAmount)}
                                </span>
                            </div>

                            {reservation.payment_status === 'paid' && (
                                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                                    <div className="absolute top-2 right-[-15px] bg-emerald-500 text-white text-[8px] font-black py-0.5 px-6 rotate-45 shadow-sm uppercase">{reservation.payment_status === 'paid' ? 'ÖDENDİ' : 'BORÇLU'}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hızlı İşlemler</h4>
                            <div className="flex gap-2">
                                {!reservation.roomId && checkPermission(Permission.RESERVATION_ROOM_ASSIGN_AUTO) && (
                                    <button
                                        onClick={async () => {
                                            const reason = window.prompt("Otomatik atama sebebi:", "Sistem tarafından otomatik atandı");
                                            if (reason !== null) {
                                                try {
                                                    const { data, error } = await supabase.rpc('auto_assign_room', {
                                                        p_reservation_id: reservation.id,
                                                        p_strategy: 'best_score',
                                                        p_allow_dirty: false,
                                                        p_reason: reason
                                                    });
                                                    if (error) throw error;
                                                    if (data && !data.success) throw new Error(data.message);
                                                    alert(`Oda başarıyla atandı: #${data.room_number}`);
                                                    queryClient.invalidateQueries({ queryKey: ["reservations"] });
                                                } catch (err: any) {
                                                    alert("Hata: " + err.message);
                                                }
                                            }
                                        }}
                                        className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        OTO ATA
                                    </button>
                                )}
                                {(reservation.dbStatus === 'cancelled' || reservation.dbStatus === 'no_show') && checkPermission(Permission.RESERVATION_STATUS_REINSTATE) && (
                                    <button
                                        onClick={() => {
                                            const reason = window.prompt("Rezervasyonu aktif hale getirme sebebi:");
                                            if (reason) onStatusChange(reservation, 'confirmed', reason);
                                        }}
                                        className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase hover:bg-indigo-100 transition-colors"
                                    >
                                        Geri Al (Reinstate)
                                    </button>
                                )}
                                {reservation.dbStatus === 'checked_out' && checkPermission(Permission.RESERVATION_STATUS_UNDO_CHECKOUT) && (
                                    <button
                                        onClick={() => {
                                            const reason = window.prompt("Check-out işlemini geri alma sebebi:");
                                            if (reason) onStatusChange(reservation, 'checked_in', reason);
                                        }}
                                        className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase hover:bg-rose-100 transition-colors"
                                    >
                                        Check-out Geri Al
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    if (!reservation.roomId) {
                                        alert("Check-in işlemi için önce bir oda ataması yapmalısınız.");
                                        return;
                                    }
                                    onStatusChange(reservation, 'checked_in');
                                }}
                                disabled={!checkPermission(Permission.RESERVATION_STATUS_CHECKIN) || reservation.dbStatus === 'checked_in' || reservation.dbStatus === 'checked_out'}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${(!checkPermission(Permission.RESERVATION_STATUS_CHECKIN) || reservation.dbStatus === 'checked_in' || reservation.dbStatus === 'checked_out') ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 shadow-sm shadow-emerald-100/50'}`}
                            >
                                <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${reservation.dbStatus === 'checked_in' ? 'opacity-50' : ''}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-[10px] font-black uppercase">Check-in</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (totalAmount > depositAmount && reservation.payment_status !== 'paid') {
                                        const formattedBalance = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: reservation.currency || 'TRY', maximumFractionDigits: 0 }).format(totalAmount - depositAmount);
                                        if (!window.confirm(`DİKKAT: Misafirin ${formattedBalance} ödenmemiş bakiyesi bulunmaktadır.\n\nYine de çıkış yapmak istediğinize emin misiniz?`)) {
                                            return;
                                        }
                                    }
                                    onStatusChange(reservation, 'checked_out');
                                }}
                                disabled={!checkPermission(Permission.RESERVATION_STATUS_CHECKOUT) || reservation.dbStatus === 'checked_out' || reservation.dbStatus !== 'checked_in'}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${(!checkPermission(Permission.RESERVATION_STATUS_CHECKOUT) || reservation.dbStatus === 'checked_out' || reservation.dbStatus !== 'checked_in') ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
                            >
                                <div className={`w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm ${reservation.dbStatus === 'checked_out' ? 'opacity-50' : ''}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                </div>
                                <span className="text-[10px] font-black uppercase">Check-out</span>
                            </button>
                            <button
                                onClick={() => onExtend(reservation)}
                                disabled={!checkPermission(Permission.RESERVATION_EDIT)}
                                className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-xs font-black uppercase">1 GÜN UZAT</span>
                            </button>
                            <button
                                onClick={() => onMove(reservation)}
                                disabled={!checkPermission(Permission.RESERVATION_EDIT)}
                                className="flex items-center gap-3 p-3 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                </div>
                                <span className="text-xs font-black uppercase">Kaydır</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 mt-auto">
                    <button
                        onClick={() => onEdit(reservation)}
                        className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        Tüm Detayları Düzenle
                    </button>
                    <button
                        onClick={() => onDelete?.(reservation)}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
}
