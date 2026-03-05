"use client";

import React, { useState } from "react";
import { SmartOpsArrival } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Props {
    arrivals: SmartOpsArrival[];
    onCheckIn: (reservationId: string) => Promise<void>;
    isLoading?: boolean;
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
    });
}

export function ArrivalsWidget({ arrivals, onCheckIn, isLoading }: Props) {
    const { slug } = useParams();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleCheckIn = async (id: string) => {
        setProcessingId(id);
        try {
            await onCheckIn(id);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bilinmeyen hata";
            alert("Check-in hatası: " + message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Bugünkü Gelişler
                    </h3>
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black bg-blue-600 text-white rounded-full">
                        {arrivals.length}
                    </span>
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {arrivals.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400 font-medium">Bugün beklenen geliş yok</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {arrivals.map((arrival) => (
                        <div key={arrival.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-gray-900 truncate">{arrival.guest_name}</p>
                                        {arrival.adults_count && (
                                            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                                                {arrival.adults_count} kişi
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                        <span>{arrival.room_type || "—"}</span>
                                        {arrival.assigned_room && (
                                            <>
                                                <span>·</span>
                                                <span className="font-bold text-gray-700">Oda {arrival.assigned_room}</span>
                                            </>
                                        )}
                                        {!arrival.assigned_room && (
                                            <>
                                                <span>·</span>
                                                <span className="text-orange-500 font-bold">Oda Atanmamış</span>
                                            </>
                                        )}
                                        <span>·</span>
                                        <span>{formatTime(arrival.arrival_time)}</span>
                                    </div>
                                    {arrival.reservation_number && (
                                        <p className="text-[9px] text-gray-300 font-mono mt-0.5">#{arrival.reservation_number}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => router.push(`/${slug}/reservation-management?res=${arrival.id}`)}
                                        className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                                    >
                                        Aç
                                    </button>
                                    <button
                                        onClick={() => handleCheckIn(arrival.id)}
                                        disabled={processingId === arrival.id}
                                        className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                    >
                                        {processingId === arrival.id ? (
                                            <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : null}
                                        Check-in
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
