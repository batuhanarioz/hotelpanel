"use client";

import React from "react";
import { SmartOpsRoomStatus } from "@/lib/api";

interface Props {
    roomStatus: SmartOpsRoomStatus;
    isLoading?: boolean;
}

interface StatusBarProps {
    label: string;
    count: number;
    total: number;
    color: string;
    textColor: string;
}

function StatusBar({ label, count, total, color, textColor }: StatusBarProps) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
                <span className={textColor}>{label}</span>
                <span className="text-gray-400">{count} oda ({pct}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export function RoomStatusWidget({ roomStatus, isLoading }: Props) {
    const { clean, dirty, occupied, cleaning, out_of_service, total } = roomStatus;

    const statuses: { label: string; count: number; color: string; textColor: string; bgColor: string; dotColor: string }[] = [
        {
            label: "Temiz",
            count: clean,
            color: "bg-emerald-500",
            textColor: "text-emerald-700",
            bgColor: "bg-emerald-50",
            dotColor: "bg-emerald-500",
        },
        {
            label: "Dolu",
            count: occupied,
            color: "bg-blue-500",
            textColor: "text-blue-700",
            bgColor: "bg-blue-50",
            dotColor: "bg-blue-500",
        },
        {
            label: "Kirli",
            count: dirty,
            color: "bg-orange-500",
            textColor: "text-orange-700",
            bgColor: "bg-orange-50",
            dotColor: "bg-orange-500",
        },
        {
            label: "Temizleniyor",
            count: cleaning,
            color: "bg-yellow-400",
            textColor: "text-yellow-700",
            bgColor: "bg-yellow-50",
            dotColor: "bg-yellow-400",
        },
        {
            label: "Hizmet Dışı",
            count: out_of_service,
            color: "bg-gray-400",
            textColor: "text-gray-600",
            bgColor: "bg-gray-50",
            dotColor: "bg-gray-400",
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-slate-700 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Oda Durumu
                    </h3>
                    <span className="ml-1 text-[10px] font-bold text-gray-400">({total} oda)</span>
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {/* Quick summary badges */}
            <div className="px-5 py-4 grid grid-cols-5 gap-2 border-b border-gray-50">
                {statuses.map((s) => (
                    <div key={s.label} className={`rounded-xl text-center py-3 ${s.bgColor}`}>
                        <p className={`text-xl font-black ${s.textColor}`}>{s.count}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wide mt-0.5 ${s.textColor} opacity-70`}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Progress bars */}
            <div className="px-5 py-4 space-y-3">
                {statuses.filter(s => s.count > 0).map((s) => (
                    <StatusBar
                        key={s.label}
                        label={s.label}
                        count={s.count}
                        total={total}
                        color={s.color}
                        textColor={s.textColor}
                    />
                ))}
                {statuses.every(s => s.count === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">Oda verisi bulunamadı</p>
                )}
            </div>
        </div>
    );
}
