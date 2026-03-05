"use client";

import React, { useState } from "react";
import { SmartOpsNoShow } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Props {
    noShowCandidates: SmartOpsNoShow[];
    onMarkNoShow: (reservationId: string) => Promise<void>;
    isLoading?: boolean;
}

function formatDelay(minutes: number): string {
    if (minutes < 60) return `${Math.round(minutes)} dk gecikme`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}s ${m}dk gecikme`;
}

export function NoShowWidget({ noShowCandidates, onMarkNoShow, isLoading }: Props) {
    const { slug } = useParams();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleMark = async (id: string) => {
        if (!confirm("Bu rezervasyonu no-show olarak işaretlemek istediğinize emin misiniz?")) return;
        setProcessingId(id);
        try {
            await onMarkNoShow(id);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bilinmeyen hata";
            alert("No-show işareti hatası: " + message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        No-Show Adayları
                    </h3>
                    {noShowCandidates.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black bg-amber-500 text-white rounded-full">
                            {noShowCandidates.length}
                        </span>
                    )}
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {noShowCandidates.length === 0 ? (
                <div className="px-5 py-6 text-center">
                    <p className="text-sm text-gray-400 font-medium">No-show adayı bulunmuyor</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {noShowCandidates.map((candidate) => (
                        <div key={candidate.id} className="px-5 py-3.5 hover:bg-amber-50/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{candidate.guest_name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                            {formatDelay(candidate.delay_minutes)}
                                        </span>
                                        {candidate.reservation_number && (
                                            <span className="text-[9px] text-gray-300 font-mono">#{candidate.reservation_number}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => router.push(`/${slug}/reservation-management?res=${candidate.id}`)}
                                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        Aç
                                    </button>
                                    <button
                                        onClick={() => handleMark(candidate.id)}
                                        disabled={processingId === candidate.id}
                                        className="text-[10px] font-black text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                    >
                                        {processingId === candidate.id ? (
                                            <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : null}
                                        No-Show
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
