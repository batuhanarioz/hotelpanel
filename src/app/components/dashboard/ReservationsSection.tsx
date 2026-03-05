"use client";

import React from "react";
import {
    MessageSquare,
    MoreHorizontal,
    User,
    Key,
    Navigation,
    CircleDashed,
    CheckCircle2,
    XCircle,
    UserMinus,
    LogOut,
    ExternalLink,
    Clock
} from "lucide-react";
import { ReservationStatus } from "@/types/database";
import { DashboardReservation } from "@/hooks/useDashboard";

interface ReservationsSectionProps {
    isToday: boolean;
    reservations: DashboardReservation[];
    arrivals: DashboardReservation[];
    inHouse: DashboardReservation[];
    departures: DashboardReservation[];
    loading: boolean;
    onOffsetChange: () => void;
    activeTab: "arrivals" | "in-house" | "departures" | "all";
    onTabChange: (tab: "arrivals" | "in-house" | "departures" | "all") => void;
    onReminderClick: (id: string) => void;
}

const statusConfig: Record<ReservationStatus, { label: string; color: string; icon: React.ElementType }> = {
    inquiry: { label: "Talep", color: "bg-purple-50 text-purple-700 border-purple-100", icon: CircleDashed },
    confirmed: { label: "Onaylı", color: "bg-blue-50 text-blue-700 border-blue-100", icon: Navigation },
    checked_in: { label: "İçeride", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    checked_out: { label: "Çıkış Yaptı", color: "bg-gray-100 text-gray-500 border-gray-200", icon: LogOut },
    cancelled: { label: "İptal", color: "bg-red-50 text-red-700 border-red-100", icon: XCircle },
    no_show: { label: "Gelmedi", color: "bg-orange-50 text-orange-700 border-orange-100", icon: UserMinus },
};

export function ReservationsSection({
    isToday,
    arrivals,
    inHouse,
    departures,
    reservations,
    loading,
    onOffsetChange,
    activeTab,
    onTabChange,
    onReminderClick
}: ReservationsSectionProps) {
    const data = activeTab === "arrivals" ? arrivals
        : activeTab === "in-house" ? inHouse
            : activeTab === "departures" ? departures
                : reservations;

    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 border-b border-gray-50 bg-gray-50/30">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => onTabChange("arrivals")}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${activeTab === "arrivals" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Bugün Giriş <span className="ml-1 opacity-50">({arrivals.length})</span>
                    </button>
                    <button
                        onClick={() => onTabChange("in-house")}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${activeTab === "in-house" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Konaklayanlar <span className="ml-1 opacity-50">({inHouse.length})</span>
                    </button>
                    <button
                        onClick={() => onTabChange("departures")}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${activeTab === "departures" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Bugün Çıkış <span className="ml-1 opacity-50">({departures.length})</span>
                    </button>
                    <button
                        onClick={() => onTabChange("all")}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-tight ${activeTab === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Hepsi
                    </button>
                </div>

                <button
                    onClick={onOffsetChange}
                    className="text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                    {isToday ? "Yarınki Kayıtlar" : "Bugünkü Kayıtlar"}
                    <Navigation size={14} className={isToday ? "rotate-90" : "-rotate-90"} />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full min-h-[300px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                        <div className="p-5 bg-gray-50 rounded-full mb-4">
                            <User className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400 font-bold tracking-tight">Bu bölümde aktif kayıt bulunmuyor.</p>
                        <p className="text-xs text-gray-300 mt-1 uppercase font-black tracking-widest">Hızlı rezervasyon ekleyerek başlayın.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Misafir & Oda</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Pansiyon & Kanal</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Aksiyonlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((res: DashboardReservation) => {
                                const status = statusConfig[res.status] || statusConfig.inquiry;
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-gray-500 group-hover:bg-white transition-colors">
                                                    {res.guestName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-gray-900 tracking-tight">{res.guestName}</p>
                                                        {res.noShowCandidate && (() => {
                                                            const delay = Math.floor((new Date().getTime() - new Date(res.startsAt).getTime()) / 60000);
                                                            let colorClass = "bg-amber-100 text-amber-700";
                                                            if (delay >= 240) colorClass = "bg-rose-100 text-rose-700 font-black border border-rose-200 animate-pulse";
                                                            else if (delay >= 120) colorClass = "bg-orange-100 text-orange-700 font-black border border-orange-200";
                                                            return (
                                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${colorClass}`}>
                                                                    NO-SHOW ADAY
                                                                </span>
                                                            );
                                                        })()}
                                                        {!res.noShowCandidate && res.status === 'confirmed' && (() => {
                                                            const delay = Math.floor((new Date().getTime() - new Date(res.startsAt).getTime()) / 60000);
                                                            if (delay > 60) {
                                                                return (
                                                                    <span className="flex items-center gap-1 text-[9px] font-black font-black text-rose-500 uppercase tracking-tight animate-bounce">
                                                                        <Clock size={10} strokeWidth={3} />
                                                                        GECİKMİŞ
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Key size={12} className="text-orange-500" />
                                                        <span className="text-[11px] font-bold text-gray-500">Oda {res.roomNumber || "---"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight border shadow-sm ${status.color}`}>
                                                <StatusIcon size={12} strokeWidth={3} />
                                                {status.label.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[11px] font-bold text-gray-700">{res.boardType || "Sadece Oda"}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{res.channel}</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{res.staffName || "Atanmadı"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {res.guestPhone && (
                                                    <button
                                                        onClick={() => onReminderClick(res.id)}
                                                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 shadow-sm active:scale-95"
                                                        title="WhatsApp Hatırlatıcı"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm active:scale-95"
                                                    title="Detaylara Git"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                                <button className="p-2.5 text-gray-400 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200 active:scale-95">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
