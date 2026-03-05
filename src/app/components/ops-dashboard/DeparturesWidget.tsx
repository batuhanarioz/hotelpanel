"use client";

import React, { useState } from "react";
import { SmartOpsDeparture } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Props {
    departures: SmartOpsDeparture[];
    onCheckOut: (reservationId: string) => Promise<void>;
    isLoading?: boolean;
    currency?: string;
}

export function DeparturesWidget({ departures, onCheckOut, isLoading, currency = "₺" }: Props) {
    const { slug } = useParams();
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleCheckOut = async (id: string) => {
        setProcessingId(id);
        try {
            await onCheckOut(id);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Bilinmeyen hata";
            alert("Check-out hatası: " + message);
        } finally {
            setProcessingId(null);
        }
    };

    const fmt = (n: number) =>
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-orange-500 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        Bugünkü Ayrılışlar
                    </h3>
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black bg-orange-500 text-white rounded-full">
                        {departures.length}
                    </span>
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {departures.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400 font-medium">Bugün planlanan ayrılış yok</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {departures.map((dep) => (
                        <div key={dep.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-gray-900 truncate">{dep.guest_name}</p>
                                        {dep.balance_due > 0 && (
                                            <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">
                                                {currency}{fmt(dep.balance_due)} borç
                                            </span>
                                        )}
                                        {dep.balance_due <= 0 && (
                                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                                                Ödendi
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {dep.room_number ? `Oda ${dep.room_number}` : "Oda bilgisi yok"}
                                    </p>
                                    {dep.reservation_number && (
                                        <p className="text-[9px] text-gray-300 font-mono mt-0.5">#{dep.reservation_number}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {dep.folio_id && (
                                        <button
                                            onClick={() => router.push(`/${slug}/payment-management`)}
                                            className="text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                                        >
                                            Folio
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleCheckOut(dep.id)}
                                        disabled={processingId === dep.id}
                                        className="text-[10px] font-black text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                                    >
                                        {processingId === dep.id ? (
                                            <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : null}
                                        Check-out
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
