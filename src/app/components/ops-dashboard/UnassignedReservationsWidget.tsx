"use client";

import React, { useState } from "react";
import { SmartOpsUnassigned } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Props {
    unassigned: SmartOpsUnassigned[];
    onAutoAssign: (reservationId: string) => Promise<void>;
    isLoading?: boolean;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        timeZone: "Europe/Istanbul",
    });
}

export function UnassignedReservationsWidget({ unassigned, onAutoAssign, isLoading }: Props) {
    const { slug } = useParams();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAutoAssign = async (id: string) => {
        setProcessingId(id);
        try {
            await onAutoAssign(id);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bilinmeyen hata";
            alert("Otomatik atama hatası: " + message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Oda Atanmamış
                    </h3>
                    {unassigned.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black bg-indigo-600 text-white rounded-full">
                            {unassigned.length}
                        </span>
                    )}
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {unassigned.length === 0 ? (
                <div className="px-5 py-6 text-center">
                    <p className="text-sm text-gray-400 font-medium">Tüm rezervasyonlara oda atandı ✓</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {unassigned.map((res) => (
                        <div key={res.id} className="px-5 py-3.5 hover:bg-indigo-50/30 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{res.guest_name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                                        <span>{res.room_type || "Oda tipi belirtilmemiş"}</span>
                                        <span>·</span>
                                        <span className="font-bold text-indigo-600">{formatDate(res.check_in_date)}</span>
                                        {res.adults_count && (
                                            <>
                                                <span>·</span>
                                                <span>{res.adults_count} kişi</span>
                                            </>
                                        )}
                                    </div>
                                    {res.reservation_number && (
                                        <p className="text-[9px] text-gray-300 font-mono mt-0.5">#{res.reservation_number}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => router.push(`/${slug}/reservation-management?res=${res.id}`)}
                                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        Aç
                                    </button>
                                    <button
                                        onClick={() => handleAutoAssign(res.id)}
                                        disabled={processingId === res.id}
                                        className="text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                    >
                                        {processingId === res.id ? (
                                            <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : null}
                                        Oto. Ata
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
