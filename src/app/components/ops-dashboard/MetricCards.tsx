"use client";

import React from "react";
import { SmartOpsMetrics } from "@/lib/api";

interface Props {
    metrics: SmartOpsMetrics;
    currency?: string;
}

interface MetricCardProps {
    label: string;
    value: string;
    sub?: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

function MetricCard({ label, value, sub, color, bgColor, icon }: MetricCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
            <div className={`absolute inset-0 opacity-[0.04] ${bgColor}`} />
            <div className="relative">
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-3 ${bgColor} ${color}`}>
                    {icon}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
                {sub && <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{sub}</p>}
            </div>
        </div>
    );
}

export function MetricCards({ metrics, currency = "₺" }: Props) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

    const cards: MetricCardProps[] = [
        {
            label: "Doluluk",
            value: `${metrics.occupancy_rate.toFixed(1)}%`,
            sub: `${metrics.rooms_sold} / ${metrics.rooms_available} oda`,
            color: "text-blue-700",
            bgColor: "bg-blue-500",
            icon: (
                <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            label: "ADR",
            value: `${currency}${fmt(metrics.adr)}`,
            sub: "Ort. Günlük Oda Ücreti",
            color: "text-violet-700",
            bgColor: "bg-violet-500",
            icon: (
                <svg className="w-4 h-4 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            label: "RevPAR",
            value: `${currency}${fmt(metrics.revpar)}`,
            sub: "Gelir / Mevcut Oda",
            color: "text-emerald-700",
            bgColor: "bg-emerald-500",
            icon: (
                <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            label: "Bugünkü Gelir",
            value: `${currency}${fmt(metrics.revenue_today)}`,
            sub: "Bugüne ait oda geliri",
            color: "text-amber-700",
            bgColor: "bg-amber-500",
            icon: (
                <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            ),
        },
        {
            label: "Müsait Oda",
            value: `${metrics.rooms_available}`,
            sub: "Toplam kullanılabilir",
            color: "text-sky-700",
            bgColor: "bg-sky-500",
            icon: (
                <svg className="w-4 h-4 text-sky-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            label: "Satılan Oda",
            value: `${metrics.rooms_sold}`,
            sub: "Şu an checked-in",
            color: "text-rose-700",
            bgColor: "bg-rose-500",
            icon: (
                <svg className="w-4 h-4 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
                <MetricCard key={card.label} {...card} />
            ))}
        </div>
    );
}
