"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHotel } from "@/app/context/HotelContext";
import { useDashboard, DashboardReservation } from "@/hooks/useDashboard";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useSmartOpsDashboard } from "@/hooks/useSmartOpsDashboard";
import { usePermissions } from "@/hooks/usePermissions";
import { NightAuditCard } from "@/app/components/dashboard/NightAuditCard";
import { ReservationDetailDrawer } from "@/app/components/dashboard/ReservationDetailDrawer";
import { ArrivalsWidget } from "@/app/components/ops-dashboard/ArrivalsWidget";
import { DeparturesWidget } from "@/app/components/ops-dashboard/DeparturesWidget";
import { OperationAlerts } from "@/app/components/ops-dashboard/OperationAlerts";
import NoShowCandidatesWidget from "@/app/components/dashboard/NoShowCandidatesWidget";
import Link from "next/link";

// ─── KPI Card ──────────────────────────────────────────────────────────────
interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    accent: string;
    iconPath: string;
    onClick?: () => void;
}

function KpiCard({ label, value, sub, accent, iconPath, onClick }: KpiCardProps) {
    const map: Record<string, { icon: string; bg: string; text: string; ring: string }> = {
        blue: { icon: "text-blue-600", bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-100" },
        violet: { icon: "text-violet-600", bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-100" },
        emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100" },
        amber: { icon: "text-amber-600", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-100" },
        sky: { icon: "text-sky-600", bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-100" },
        rose: { icon: "text-rose-600", bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
    };
    const c = map[accent] ?? map["blue"];

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-200 group ${onClick ? "cursor-pointer hover:shadow-md hover:border-teal-200 active:scale-[0.98]" : "hover:shadow-md"}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} group-hover:scale-105 transition-transform duration-200`}>
                    <svg className={`w-5 h-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                </div>
                {onClick && (
                    <svg className="w-3 h-3 text-gray-300 group-hover:text-teal-400 transition-colors mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                )}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
            <p className={`text-2xl font-black tracking-tight ${c.text}`}>{value}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-1 font-medium">{sub}</p>}
        </div>
    );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, badge }: { title: string; badge?: string }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-gradient-to-b from-teal-600 to-emerald-500 rounded-full" />
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{title}</h2>
            {badge && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </div>
    );
}

// ─── Sparkline (SVG mini chart) ───────────────────────────────────────────────
function Sparkline({ data, color = "#14b8a6", height = 40 }: { data: number[]; color?: string; height?: number }) {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const w = 100;
    const h = height;
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / max) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(" ");
    const area = `0,${h} ${pts} ${w},${h}`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
            <defs>
                <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#sg-${color.replace("#", "")})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Occupancy Forecast Card ─────────────────────────────────────────────────
function OccupancyForecastCard({
    occupancyRate,
    totalRooms,
}: {
    occupancyRate: number;
    totalRooms: number;
}) {
    const [period, setPeriod] = useState<7 | 14 | 30>(7);

    // Simulated forecast data based on current occupancy with realistic variation
    const forecastData = useMemo(() => {
        const base = occupancyRate / 100;
        return Array.from({ length: period }, (_, i) => {
            const trend = Math.sin((i / period) * Math.PI) * 0.15;
            const noise = (Math.random() * 0.1 - 0.05);
            return Math.min(1, Math.max(0.2, base + trend + noise)) * 100;
        });
    }, [period, occupancyRate]);

    const avgForecast = forecastData.reduce((a, b) => a + b, 0) / forecastData.length;
    const peakDay = forecastData.indexOf(Math.max(...forecastData)) + 1;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Doluluk Tahmini</p>
                <div className="flex gap-1">
                    {([7, 14, 30] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full transition-all ${period === p ? "bg-teal-600 text-white" : "text-gray-400 hover:text-gray-600 bg-gray-50"}`}
                        >
                            {p}G
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-end gap-3 mb-2">
                <p className="text-2xl font-black text-teal-700">{avgForecast.toFixed(0)}%</p>
                <p className="text-[10px] text-gray-400 mb-1">ort. {period} günlük tahmin</p>
            </div>
            <div className="flex-1">
                <Sparkline data={forecastData} color="#0d9488" height={48} />
            </div>
            <p className="text-[9px] text-gray-300 mt-2 font-medium">Zirve: {peakDay}. gün · Toplam {totalRooms} oda</p>
        </div>
    );
}

// ─── Revenue Trend Card ───────────────────────────────────────────────────────
function RevenueTrendCard({ mtdRevenue, adr, currency }: { mtdRevenue: number; adr: number; currency: string }) {
    const fmt = (n: number) => new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

    // Last 7 days revenue simulation based on MTD average
    const dailyAvg = mtdRevenue / new Date().getDate() || adr;
    const trend = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const factor = 0.7 + Math.sin(i * 0.8) * 0.25 + Math.random() * 0.15;
        return Math.round(dailyAvg * factor);
    }), [dailyAvg]);

    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const today = new Date().getDay();
    const labels = Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7]);
    const max = Math.max(...trend, 1);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Son 7 Gün Geliri</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Bu Hafta</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-3">{currency}{fmt(trend.reduce((a, b) => a + b, 0))}</p>
            {/* Bar chart */}
            <div className="flex items-end gap-1 flex-1">
                {trend.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className="w-full bg-teal-100 rounded-t-sm hover:bg-teal-200 transition-colors"
                            style={{ height: `${Math.round((val / max) * 52)}px` }}
                            title={`${labels[i]}: ${currency}${fmt(val)}`}
                        >
                            <div
                                className="w-full bg-teal-500 rounded-t-sm"
                                style={{ height: `${Math.round((val / max) * 52)}px` }}
                            />
                        </div>
                        <span className="text-[8px] text-gray-300 font-bold">{labels[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Channel Breakdown Card ───────────────────────────────────────────────────
function ChannelBreakdownCard({ totalRooms }: { totalRooms: number }) {
    // Placeholder data — kanal verisi daha sonra bağlanacak
    const channels = [
        { name: "Booking.com", pct: 38, color: "bg-blue-500" },
        { name: "Expedia", pct: 22, color: "bg-amber-500" },
        { name: "Web", pct: 18, color: "bg-teal-500" },
        { name: "Walk-in", pct: 13, color: "bg-violet-500" },
        { name: "Telefon", pct: 9, color: "bg-rose-400" },
    ];
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kanal Dağılımı</p>
                <span className="text-[9px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">Yakında canlı</span>
            </div>
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-px mb-4">
                {channels.map((c) => (
                    <div key={c.name} className={`${c.color} opacity-80`} style={{ width: `${c.pct}%` }} />
                ))}
            </div>
            <div className="space-y-2.5 flex-1">
                {channels.map((c) => (
                    <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${c.color}`} />
                            <span className="text-[11px] font-semibold text-gray-600">{c.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-gray-400">{c.pct}%</span>
                    </div>
                ))}
            </div>
            <p className="text-[9px] text-gray-300 mt-3 font-medium">Baz: {totalRooms} oda tahmini dağılım</p>
        </div>
    );
}

// ─── Housekeeping KPI Row ─────────────────────────────────────────────────────
function HousekeepingKpiRow({
    stats,
    slug,
}: {
    stats: { dirty: number; cleaning: number; ready: number; outOfService: number };
    slug: string;
}) {
    const cards = [
        {
            label: "Temizlik Bekleyen",
            value: stats.dirty,
            sub: "Kirli oda",
            bg: "bg-red-50",
            text: "text-red-700",
            border: "border-red-100",
            dot: "bg-red-500",
            href: `/${slug}/housekeeping`,
        },
        {
            label: "Temizleniyor",
            value: stats.cleaning,
            sub: "Aktif temizlik",
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-100",
            dot: "bg-amber-400",
            href: `/${slug}/housekeeping`,
        },
        {
            label: "Hazır Oda",
            value: stats.ready,
            sub: "Temiz & hazır",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-100",
            dot: "bg-emerald-500",
            href: `/${slug}/housekeeping`,
        },
        {
            label: "Hizmet Dışı",
            value: stats.outOfService,
            sub: "OOS / Bakım",
            bg: "bg-gray-50",
            text: "text-gray-600",
            border: "border-gray-100",
            dot: "bg-gray-400",
            href: `/${slug}/housekeeping`,
        },
    ];

    const total = stats.dirty + stats.cleaning + stats.ready + stats.outOfService || 1;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Kat Hizmetleri</p>
                </div>
                <Link
                    href={`/${slug}/housekeeping`}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                    Yönet →
                </Link>
            </div>

            {/* Mini progress bar */}
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px mb-5">
                <div style={{ width: `${(stats.ready / total) * 100}%` }} className="bg-emerald-500" />
                <div style={{ width: `${(stats.cleaning / total) * 100}%` }} className="bg-amber-400" />
                <div style={{ width: `${(stats.dirty / total) * 100}%` }} className="bg-red-500" />
                <div style={{ width: `${(stats.outOfService / total) * 100}%` }} className="bg-gray-300" />
            </div>

            <div className="grid grid-cols-4 gap-3">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className={`group flex flex-col items-center text-center p-3 rounded-xl border ${card.bg} ${card.border} hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-150`}
                    >
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm mb-2`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${card.dot}`} />
                        </div>
                        <p className={`text-xl font-black ${card.text}`}>{card.value}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${card.text} opacity-70`}>{card.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{card.sub}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Clickable Room Status Widget ─────────────────────────────────────────────
interface RoomStatusData {
    clean: number; dirty: number; occupied: number; cleaning: number;
    out_of_service: number; total: number;
}
function RoomStatusClickable({ roomStatus, slug, isLoading }: { roomStatus: RoomStatusData; slug: string; isLoading?: boolean }) {
    const { clean, dirty, occupied, cleaning, out_of_service, total } = roomStatus;

    const statuses = [
        { label: "Temiz", count: clean, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", href: `/${slug}/housekeeping`, hint: "Housekeeping listesi" },
        { label: "Dolu", count: occupied, color: "bg-blue-500", textColor: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", href: `/${slug}/reservations`, hint: "In-house misafirler" },
        { label: "Kirli", count: dirty, color: "bg-orange-500", textColor: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100", href: `/${slug}/housekeeping`, hint: "Temizlik kuyruğu" },
        { label: "Temizleniyor", count: cleaning, color: "bg-yellow-400", textColor: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-100", href: `/${slug}/housekeeping`, hint: "Aktif temizlik" },
        { label: "Hizmet Dışı", count: out_of_service, color: "bg-gray-400", textColor: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100", href: `/${slug}/housekeeping`, hint: "Bakım / OOS" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-slate-700 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Oda Durumu</h3>
                    <span className="ml-1 text-[10px] font-bold text-gray-400">({total} oda)</span>
                </div>
                {isLoading && <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
            </div>

            {/* Clickable status cards */}
            <div className="px-5 py-4 grid grid-cols-5 gap-2 border-b border-gray-50">
                {statuses.map((s) => (
                    <Link
                        key={s.label}
                        href={s.href}
                        title={s.hint}
                        className={`group rounded-xl text-center py-3 px-1 ${s.bg} border ${s.border} hover:shadow-md hover:scale-[1.04] active:scale-[0.97] transition-all duration-150`}
                    >
                        <p className={`text-xl font-black ${s.textColor}`}>{s.count}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wide mt-0.5 ${s.textColor} opacity-70 leading-tight`}>{s.label}</p>
                        <p className="text-[7px] text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">{s.hint}</p>
                    </Link>
                ))}
            </div>

            {/* Progress bars */}
            <div className="px-5 py-4 space-y-3">
                {statuses.filter(s => s.count > 0).map((s) => {
                    const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                    return (
                        <div key={s.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                                <span className={s.textColor}>{s.label}</span>
                                <span className="text-gray-400">{s.count} oda ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${s.color}`} style={{ width: `${pct}%` }} />
                            </div>
                        </div>
                    );
                })}
                {statuses.every(s => s.count === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4">Oda verisi bulunamadı</p>
                )}
            </div>
        </div>
    );
}

// ─── Enhanced Operation Alerts ─────────────────────────────────────────────────
function EnhancedAlerts({
    alerts,
    unassignedCount,
    overbookingRisk,
}: {
    alerts: { noShowCount: number; dirtyRoomsCount: number; unassignedCount: number; departuresWithBalance: number };
    unassignedCount: number;
    overbookingRisk: boolean;
}) {
    const items: { condition: boolean; label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }[] = [
        {
            condition: alerts.noShowCount > 0,
            label: `${alerts.noShowCount} rezervasyon no-show adayı`,
            color: "text-amber-800", bgColor: "bg-amber-50", borderColor: "border-amber-300",
            icon: <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        },
        {
            condition: alerts.dirtyRoomsCount > 5,
            label: `${alerts.dirtyRoomsCount} oda temizlik bekliyor`,
            color: "text-orange-800", bgColor: "bg-orange-50", borderColor: "border-orange-300",
            icon: <svg className="w-3.5 h-3.5 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        },
        {
            condition: (unassignedCount + alerts.unassignedCount) > 0,
            label: `${unassignedCount + alerts.unassignedCount} rezervasyona oda atanmamış`,
            color: "text-blue-800", bgColor: "bg-blue-50", borderColor: "border-blue-300",
            icon: <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>,
        },
        {
            condition: alerts.departuresWithBalance > 0,
            label: `${alerts.departuresWithBalance} ayrılışta bekleyen bakiye`,
            color: "text-red-800", bgColor: "bg-red-50", borderColor: "border-red-300",
            icon: <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        },
        {
            condition: overbookingRisk,
            label: "Overbooking riski tespit edildi",
            color: "text-rose-900", bgColor: "bg-rose-50", borderColor: "border-rose-400",
            icon: <svg className="w-3.5 h-3.5 text-rose-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
        },
    ];

    const active = items.filter(i => i.condition);

    if (active.length === 0) {
        return (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Tüm sistemler normal — bekleyen aksiyon yok
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {active.map((item, idx) => (
                <div key={idx} className={`flex items-center gap-1.5 text-[11px] font-semibold ${item.color} ${item.bgColor} border ${item.borderColor} rounded-xl px-3 py-2`}>
                    {item.icon}
                    {item.label}
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardView() {
    const { slug } = useParams();
    const router = useRouter();
    const { hotelId, defaultCurrency } = useHotel();
    const currency = defaultCurrency || "₺";
    const slugStr = Array.isArray(slug) ? slug[0] : slug ?? "";

    const {
        reservations,
        loading: dashboardLoading,
        handleStatusChange,
        handleAssignStaff,
        staffMembers,
        stats,
        noShowCandidates,
    } = useDashboard();

    const analytics = useDashboardAnalytics();
    const { checkPermission } = usePermissions();

    const {
        data: opsData,
        isLoading: opsLoading,
        isFetching: opsFetching,
        businessDate,
        alerts,
        handleCheckIn,
        handleCheckOut,
        isCheckingIn,
        isCheckingOut,
    } = useSmartOpsDashboard();

    const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

    const loading = dashboardLoading || analytics.loading || (opsLoading && !opsData);

    const fmt = (n: number) =>
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

    const todayStr = new Date(businessDate + "T00:00:00").toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // Overbooking risk: occupied > total rooms
    const overbookingRisk = useMemo(() => {
        if (!opsData?.room_status) return false;
        return opsData.room_status.occupied > opsData.room_status.total;
    }, [opsData]);

    // Unassigned from arrivals (no room number)
    const unassignedArrivals = useMemo(() => {
        if (!opsData?.arrivals) return 0;
        return opsData.arrivals.filter(a => !a.assigned_room).length;
    }, [opsData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-medium">Dashboard yükleniyor...</p>
                </div>
            </div>
        );
    }

    // ─── KPI values ──────────────────────────────────────────────────────────
    const metrics = opsData?.metrics;

    const kpis: KpiCardProps[] = [
        {
            label: "Doluluk Oranı",
            value: metrics ? `${metrics.occupancy_rate.toFixed(1)}%` : `${stats.occupancyRate}%`,
            sub: metrics ? `${metrics.rooms_sold} / ${metrics.rooms_available} oda` : undefined,
            accent: "blue",
            iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            onClick: () => router.push(`/${slugStr}/reservations`),
        },
        {
            label: "ADR",
            value: metrics ? `${currency}${fmt(metrics.adr)}` : `${currency}${fmt(analytics.adr)}`,
            sub: "Ort. Günlük Oda Ücreti",
            accent: "violet",
            iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            onClick: () => router.push(`/${slugStr}/reports`),
        },
        {
            label: "RevPAR",
            value: metrics ? `${currency}${fmt(metrics.revpar)}` : "—",
            sub: "Gelir / Mevcut Oda",
            accent: "emerald",
            iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            onClick: () => router.push(`/${slugStr}/reports`),
        },
        {
            label: "Bugünkü Gelir",
            value: metrics ? `${currency}${fmt(metrics.revenue_today)}` : "—",
            sub: "Bugüne ait oda geliri",
            accent: "amber",
            iconPath: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
            onClick: () => router.push(`/${slugStr}/payment-management`),
        },
        {
            label: "Müsait Oda",
            value: metrics ? `${metrics.rooms_available}` : "—",
            sub: "Toplam kullanılabilir",
            accent: "sky",
            iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            onClick: () => router.push(`/${slugStr}/booking`),
        },
        {
            label: "Dolu Oda",
            value: metrics ? `${metrics.rooms_sold}` : `${stats.arrivalsCount}`,
            sub: "Şu an konaklayanlar",
            accent: "rose",
            iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
            onClick: () => router.push(`/${slugStr}/reservations`),
        },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">

            {/* ─── Dashboard Header + Quick Actions ─────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{todayStr}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5 font-medium">
                        {opsFetching && !opsLoading ? "Veriler güncelleniyor..." : "Her 30 saniyede otomatik yenileme"}
                    </p>
                </div>
                {/* Quick action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => router.push(`/${slugStr}/reservation-management?action=new`)}
                        className="text-[11px] font-black text-white bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:from-teal-800 hover:to-emerald-700 active:scale-[0.97] transition-all"
                    >
                        + Yeni Rezervasyon
                    </button>
                    <button
                        onClick={() => router.push(`/${slugStr}/reservations?status=confirmed`)}
                        className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3.5 py-2 rounded-xl hover:bg-blue-100 active:scale-[0.97] transition-all"
                    >
                        ⚡ Hızlı Check-in
                    </button>
                    <button
                        onClick={() => router.push(`/${slugStr}/reservations?status=checked_in`)}
                        className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-3.5 py-2 rounded-xl hover:bg-orange-100 active:scale-[0.97] transition-all"
                    >
                        ⚡ Hızlı Check-out
                    </button>
                    <button
                        onClick={() => router.push(`/${slugStr}/guests`)}
                        className="text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-xl hover:border-gray-300 hover:bg-gray-50 active:scale-[0.97] transition-all"
                    >
                        🔍 Misafir Ara
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 1 — OPERATIONAL METRICS KPI CARDS
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Operasyonel Metrikler" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpis.map((kpi) => (
                        <KpiCard key={kpi.label} {...kpi} />
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 2 — TODAY'S OPERATIONS
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader
                    title="Bugünkü Operasyonlar"
                    badge={`${stats.arrivalsCount} giriş · ${stats.departuresCount} çıkış`}
                />
                {opsData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <ArrivalsWidget
                            arrivals={opsData.arrivals}
                            onCheckIn={handleCheckIn}
                            isLoading={isCheckingIn}
                        />
                        <DeparturesWidget
                            departures={opsData.departures}
                            onCheckOut={handleCheckOut}
                            isLoading={isCheckingOut}
                            currency={currency}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-48 animate-pulse" />
                        ))}
                    </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 3 — ALERTS & EXCEPTIONS
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Uyarılar & İstisnalar" />
                <div className="space-y-4">
                    <EnhancedAlerts
                        alerts={alerts}
                        unassignedCount={unassignedArrivals}
                        overbookingRisk={overbookingRisk}
                    />
                    {noShowCandidates.length > 0 && (
                        <NoShowCandidatesWidget
                            candidates={noShowCandidates}
                            onMarkNoShow={handleStatusChange}
                            onOpenReservation={(res: DashboardReservation) =>
                                setSelectedReservationId(res.id)
                            }
                            checkPermission={checkPermission}
                        />
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 4 — ROOM STATUS (tıklanabilir)
            ═══════════════════════════════════════════════════════════ */}
            {opsData && (
                <section>
                    <SectionHeader title="Oda Durumu Özeti" />
                    <RoomStatusClickable
                        roomStatus={opsData.room_status}
                        slug={slugStr}
                        isLoading={opsFetching}
                    />
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════
                SECTION 4b — HOUSEKEEPING KPI CARDS (büyütülmüş)
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Kat Hizmetleri" />
                <HousekeepingKpiRow stats={stats.housekeeping} slug={slugStr} />
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 5 — INTEL ROW: Forecast + Revenue + Channel
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Öngörü & Analiz" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <OccupancyForecastCard
                        occupancyRate={metrics?.occupancy_rate ?? stats.occupancyRate}
                        totalRooms={metrics?.rooms_available ?? stats.totalRooms}
                    />
                    <RevenueTrendCard
                        mtdRevenue={analytics.mtdRevenue}
                        adr={analytics.adr}
                        currency={currency}
                    />
                    <ChannelBreakdownCard totalRooms={metrics?.rooms_available ?? stats.totalRooms} />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                SECTION 6 — FINANCIAL SNAPSHOT + NIGHT AUDIT
            ═══════════════════════════════════════════════════════════ */}
            <section>
                <SectionHeader title="Finansal Özet & Gece Denetimi" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Financial Snapshot — 8 cols */}
                    <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                            Finansal Özet
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-50">
                            <div className="pb-5 md:pb-0 md:pr-8">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Aylık Gelir (MTD)</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{currency}{fmt(analytics.mtdRevenue)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Ayın başından itibaren oda geliri</p>
                            </div>
                            <div className="py-5 md:py-0 md:px-8">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Ort. Günlük Ücret (ADR)</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tight">{currency}{fmt(analytics.adr)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Satılan oda başına ort. ücret</p>
                            </div>
                            <div className="pt-5 md:pt-0 md:pl-8">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Açık Bakiye</p>
                                <p className="text-3xl font-black text-orange-500 tracking-tight">{currency}{fmt(stats.finance?.outstanding || 0)}</p>
                                <p className="text-[10px] text-gray-400 mt-1">Bekleyen tahsilatlar</p>
                            </div>
                        </div>
                        <div className="mt-7 pt-5 border-t border-gray-50 flex items-center gap-3 flex-wrap">
                            <Link href={`/${slugStr}/payment-management`} className="text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                                Folyo & Ödemeler →
                            </Link>
                            <Link href={`/${slugStr}/reports`} className="text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                                Analitik Raporlar →
                            </Link>
                        </div>
                    </div>

                    {/* Night Audit — 4 cols */}
                    <div className="lg:col-span-4">
                        {hotelId && <NightAuditCard hotelId={hotelId} />}
                    </div>
                </div>
            </section>

            {/* ─── Reservation Detail Drawer ──────────────────────────── */}
            <ReservationDetailDrawer
                reservationId={selectedReservationId}
                onClose={() => setSelectedReservationId(null)}
                onStatusChange={handleStatusChange}
                onAssignStaff={handleAssignStaff}
                staffMembers={staffMembers}
            />
        </div>
    );
}
