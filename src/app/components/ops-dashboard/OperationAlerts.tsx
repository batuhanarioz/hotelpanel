"use client";

import React from "react";
import { SmartOpsAlerts } from "@/hooks/useSmartOpsDashboard";

interface Props {
    alerts: SmartOpsAlerts;
}

export function OperationAlerts({ alerts }: Props) {
    const items: { condition: boolean; label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }[] = [
        {
            condition: alerts.noShowCount > 0,
            label: `${alerts.noShowCount} rezervasyon no-show adayı`,
            color: "text-amber-800",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-300",
            icon: (
                <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        {
            condition: alerts.dirtyRoomsCount > 5,
            label: `${alerts.dirtyRoomsCount} oda temizlik bekliyor`,
            color: "text-orange-800",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-300",
            icon: (
                <svg className="w-3.5 h-3.5 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            condition: alerts.unassignedCount > 0,
            label: `${alerts.unassignedCount} rezervasyona oda atanmamış`,
            color: "text-blue-800",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-300",
            icon: (
                <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            ),
        },
        {
            condition: alerts.departuresWithBalance > 0,
            label: `${alerts.departuresWithBalance} ayrılışta bekleyen bakiye`,
            color: "text-red-800",
            bgColor: "bg-red-50",
            borderColor: "border-red-300",
            icon: (
                <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    const activeItems = items.filter(i => i.condition);

    if (activeItems.length === 0) {
        return (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tüm sistemler normal — bekleyen aksiyon yok
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {activeItems.map((item, idx) => (
                <div
                    key={idx}
                    className={`flex items-center gap-1.5 text-[11px] font-semibold ${item.color} ${item.bgColor} border ${item.borderColor} rounded-xl px-3 py-2`}
                >
                    {item.icon}
                    {item.label}
                </div>
            ))}
        </div>
    );
}
