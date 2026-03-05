"use client";

import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import {
    Moon,
    Play,
    RefreshCw,
    TrendingUp,
    Home,
    Clock,
    CalendarCheck,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";

interface NightAuditStatus {
    business_date: string | null;
    last_audit_at: string | null;
    revenue_today: number;
    occupancy_rate: number;
}

interface NightAuditResult {
    success: boolean;
    business_date_closed: string;
    new_business_date: string;
    charges_posted: number;
    rooms_sold: number;
    occupancy_rate: number;
    revenue_room: number;
    adr: number;
    revpar: number;
    error?: string;
}

interface NightAuditCardProps {
    hotelId: string;
}

function formatCurrency(val: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
}

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatTime(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

export function NightAuditCard({ hotelId }: NightAuditCardProps) {
    // supabase singleton imported above
    const queryClient = useQueryClient();
    const [lastResult, setLastResult] = useState<NightAuditResult | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Fetch audit status
    const { data: status, isLoading } = useQuery<NightAuditStatus>({
        queryKey: ["night-audit-status", hotelId],
        queryFn: async () => {
            const { data, error } = await supabase.rpc("get_night_audit_status", {
                p_hotel_id: hotelId,
            });
            if (error) throw error;
            return data as NightAuditStatus;
        },
        refetchInterval: 60_000, // refresh every 60s
        staleTime: 30_000,
    });

    // Run night audit mutation
    const auditMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.rpc("run_night_audit", {
                p_hotel_id: hotelId,
            });
            if (error) throw error;
            return data as NightAuditResult;
        },
        onSuccess: (result) => {
            setLastResult(result);
            setShowResult(true);
            queryClient.invalidateQueries({ queryKey: ["night-audit-status", hotelId] });
            setTimeout(() => setShowResult(false), 8000);
        },
    });

    const handleRunAudit = useCallback(() => {
        if (auditMutation.isPending) return;
        auditMutation.mutate();
    }, [auditMutation]);

    const occupancy = status?.occupancy_rate ?? 0;
    const occupancyColor =
        occupancy >= 80 ? "#10b981" : occupancy >= 50 ? "#f59e0b" : "#6b7280";

    return (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
            {/* Background accent */}
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.03] pointer-events-none"
                style={{
                    background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
                    transform: "translate(20%, -20%)",
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Moon size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">
                            Night Audit
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            Gün Kapanış Motoru
                        </p>
                    </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                        Aktif
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                            <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
                            <div className="h-6 w-28 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Business Date */}
                    <div className="bg-indigo-50/60 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <CalendarCheck size={12} className="text-indigo-400" />
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                İş Tarihi
                            </p>
                        </div>
                        <p className="text-sm font-black text-gray-900 leading-tight">
                            {formatDate(status?.business_date)}
                        </p>
                    </div>

                    {/* Last Audit */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Clock size={12} className="text-gray-400" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Son Audit
                            </p>
                        </div>
                        {status?.last_audit_at ? (
                            <div>
                                <p className="text-sm font-black text-gray-900 leading-tight">
                                    {formatTime(status.last_audit_at)}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold">
                                    {formatDate(status.last_audit_at)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-gray-400">
                                Henüz çalışmadı
                            </p>
                        )}
                    </div>

                    {/* Revenue Today */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <TrendingUp size={12} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Günlük Gelir
                            </p>
                        </div>
                        <p className="text-lg font-black text-gray-900 leading-tight tabular-nums">
                            {formatCurrency(status?.revenue_today ?? 0)}
                        </p>
                    </div>

                    {/* Occupancy */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Home size={12} style={{ color: occupancyColor }} />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                Doluluk
                            </p>
                        </div>
                        <p
                            className="text-lg font-black leading-tight tabular-nums"
                            style={{ color: occupancyColor }}
                        >
                            %{occupancy.toFixed(1)}
                        </p>
                        {/* Occupancy bar */}
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${Math.min(occupancy, 100)}%`,
                                    backgroundColor: occupancyColor,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Result */}
            {showResult && lastResult && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                            Audit Tamamlandı
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                        <span className="text-gray-500 font-bold">Kapatılan gün</span>
                        <span className="font-black text-gray-800">
                            {formatDate(lastResult.business_date_closed)}
                        </span>
                        <span className="text-gray-500 font-bold">Oda ücreti postlandı</span>
                        <span className="font-black text-gray-800">
                            {lastResult.charges_posted} rezervasyon
                        </span>
                        <span className="text-gray-500 font-bold">Doluluk</span>
                        <span className="font-black text-gray-800">
                            %{lastResult.occupancy_rate?.toFixed(1)}
                        </span>
                        <span className="text-gray-500 font-bold">ADR</span>
                        <span className="font-black text-gray-800">
                            {formatCurrency(lastResult.adr)}
                        </span>
                        <span className="text-gray-500 font-bold">RevPAR</span>
                        <span className="font-black text-gray-800">
                            {formatCurrency(lastResult.revpar)}
                        </span>
                    </div>
                </div>
            )}

            {/* Error Result */}
            {auditMutation.isError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-black text-red-700 uppercase tracking-wide mb-1">
                            Audit Başarısız
                        </p>
                        <p className="text-[11px] text-red-500 font-bold">
                            {(auditMutation.error as Error)?.message || "Bilinmeyen hata"}
                        </p>
                    </div>
                </div>
            )}

            {/* Run Button */}
            <button
                id="run-night-audit-btn"
                onClick={handleRunAudit}
                disabled={auditMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                    background: auditMutation.isPending
                        ? "#e0e7ff"
                        : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: auditMutation.isPending ? "#6366f1" : "#ffffff",
                    boxShadow: auditMutation.isPending
                        ? "none"
                        : "0 4px 20px rgba(99,102,241,0.35)",
                }}
            >
                {auditMutation.isPending ? (
                    <>
                        <RefreshCw size={14} className="animate-spin" />
                        Audit Çalışıyor...
                    </>
                ) : (
                    <>
                        <Play size={14} />
                        Run Night Audit
                    </>
                )}
            </button>

            <p className="text-center text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-3">
                Her gece 02:00&apos;de otomatik çalışır
            </p>
        </div>
    );
}
