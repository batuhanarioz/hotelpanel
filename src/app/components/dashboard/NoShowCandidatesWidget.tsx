"use client";

import React from "react";
import { UserRole } from "@/types/database";
import { DashboardReservation } from "@/hooks/useDashboard";
import { Permission } from "@/types/permissions";
import { Users, Clock, AlertTriangle, ExternalLink } from "lucide-react";

interface NoShowCandidatesWidgetProps {
    candidates: DashboardReservation[];
    onMarkNoShow: (id: string, status: any, note: string, expectedUpdatedAt?: string) => Promise<void>;
    onOpenReservation: (res: DashboardReservation) => void;
    checkPermission: (p: Permission) => boolean;
}

export const NoShowCandidatesWidget: React.FC<NoShowCandidatesWidgetProps> = ({
    candidates,
    onMarkNoShow,
    onOpenReservation,
    checkPermission
}) => {
    if (candidates.length === 0) return null;

    const canMark = checkPermission(Permission.RESERVATION_NO_SHOW_MARK);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">No-show Adayları</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Onay bekleyen {candidates.length} rezervasyon</p>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                    DİKKAT
                </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {candidates.map((res) => {
                    const checkInTime = new Date(res.startsAt);
                    const candidateTime = res.noShowCandidateAt ? new Date(res.noShowCandidateAt) : null;
                    const now = new Date();
                    const delayMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60000);
                    const hours = Math.floor(delayMinutes / 60);
                    const mins = delayMinutes % 60;

                    let severityClass = "text-amber-500";
                    let severityBg = "bg-amber-50";
                    if (delayMinutes >= 240) {
                        severityClass = "text-rose-500 font-black animate-pulse";
                        severityBg = "bg-rose-50";
                    } else if (delayMinutes >= 120) {
                        severityClass = "text-orange-500 font-black";
                        severityBg = "bg-orange-50";
                    }

                    return (
                        <div key={res.id} className={`p-4 hover:bg-slate-50/80 transition-colors group ${delayMinutes >= 240 ? 'border-l-4 border-rose-500' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-black text-slate-800 truncate">{res.guestName}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">
                                            {res.reservationNumber || res.id.slice(0, 8).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${severityBg} ${severityClass}`}>
                                            <Clock size={12} strokeWidth={3} />
                                            <span>{hours > 0 ? `${hours}sa ${mins}dk` : `${mins}dk`} gecikme</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-medium text-slate-700">{res.roomNumber || "Oda atanmadı"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => onOpenReservation(res)}
                                        className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all border border-transparent hover:border-teal-100"
                                        title="Detayları Gör"
                                    >
                                        <ExternalLink size={16} />
                                    </button>

                                    {canMark && (
                                        <button
                                            onClick={async () => {
                                                const note = window.prompt("No-show olarak işaretleme sebebi:");
                                                if (note) {
                                                    await onMarkNoShow(res.id, "no_show", note, res.updated_at);
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-700 transition-all shadow-sm active:scale-95"
                                        >
                                            No-Show Yap
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-slate-50/50 border-t border-slate-100 italic text-[10px] text-slate-400 text-center">
                Sistem tarafından otomatik tespit edilen adaylar. Resepsiyon onayı gerektirir.
            </div>
        </div>
    );
};

export default NoShowCandidatesWidget;
