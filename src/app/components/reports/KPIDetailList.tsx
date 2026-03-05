import React from "react";
import { ReservationRow } from "@/hooks/useReports";

interface KPIDetailListProps {
    data: ReservationRow[];
    guestNames: Record<string, string>;
    staffMembers: Array<{ id: string; full_name: string }>;
    title: string;
    onClose: () => void;
    onItemClick: (date: string) => void;
    isUnpaid?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
    inquiry: "Talep",
    confirmed: "Onaylı",
    checked_in: "Giriş Yaptı",
    checked_out: "Çıkış Yaptı",
    cancelled: "İptal",
    no_show: "Gelmedi",
};

export function KPIDetailList({
    data, guestNames, staffMembers, title, onClose, onItemClick, isUnpaid
}: KPIDetailListProps) {
    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b px-5 py-3 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">{title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{data.length} kayıt bulundu</p>
                </div>
                <button type="button" onClick={onClose} className="rounded-lg border p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-3 py-3 space-y-2 max-h-[400px] overflow-y-auto bg-slate-50/30">
                {data.map((a) => {
                    const checkInDate = new Date(a.check_in_date);
                    const checkOutDate = new Date(a.check_out_date);
                    const staffName = staffMembers.find((s) => s.id === a.doctor_id)?.full_name || "Belirtilmemiş";
                    const guestName = a.patient_id ? guestNames[a.patient_id] || "Misafir" : "-";
                    const initials = guestName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

                    return (
                        <button
                            key={a.id}
                            type="button"
                            className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-indigo-200 hover:shadow-sm transition-all group"
                            onClick={() => onItemClick(a.check_in_date.slice(0, 10))}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[11px] font-black text-indigo-600 border border-indigo-100 shadow-sm">{initials}</div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-slate-900 truncate tracking-tight">{guestName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] text-slate-500 font-bold truncate">{a.board_type || "Oda"} · {staffName}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-tight shadow-sm ${a.status === 'checked_out' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                        a.status === 'checked_in' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                                            a.status === 'cancelled' || a.status === 'no_show' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                                                'border-slate-200 bg-slate-50 text-slate-600'
                                    }`}>
                                    {STATUS_LABELS[a.status] || a.status}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold italic">
                                    {checkInDate.toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit' })} - {checkOutDate.toLocaleDateString("tr-TR", { day: '2-digit', month: '2-digit' })}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            {isUnpaid && (
                <div className="border-t px-5 py-3 bg-amber-50">
                    <p className="text-[10px] text-amber-700 flex items-center gap-2 font-black uppercase tracking-tight">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        ÖDEME EKSİK: TAKVİMDE DÜZENLEYİN
                    </p>
                </div>
            )}
        </div>
    );
}
