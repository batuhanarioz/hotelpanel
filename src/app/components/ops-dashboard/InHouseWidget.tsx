"use client";

import React from "react";
import { SmartOpsInHouse } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

interface Props {
    inHouse: SmartOpsInHouse[];
    isLoading?: boolean;
    currency?: string;
}

export function InHouseWidget({ inHouse, isLoading, currency = "₺" }: Props) {
    const { slug } = useParams();
    const router = useRouter();

    const fmt = (n: number) =>
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        In-House
                    </h3>
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[9px] font-black bg-emerald-600 text-white rounded-full">
                        {inHouse.length}
                    </span>
                </div>
                {isLoading && (
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                )}
            </div>

            {inHouse.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400 font-medium">Şu an konaklamakta misafir yok</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {inHouse.map((guest) => (
                        <div
                            key={guest.id}
                            className="px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => router.push(`/${slug}/reservation-management?res=${guest.id}`)}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 truncate">{guest.guest_name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                                        {guest.room_number && <span className="font-bold text-gray-600">Oda {guest.room_number}</span>}
                                        <span>·</span>
                                        <span className={`font-bold ${guest.nights_remaining <= 1 ? "text-orange-500" : "text-gray-500"}`}>
                                            {guest.nights_remaining} gece kaldı
                                        </span>
                                        {guest.balance_due > 0 && (
                                            <>
                                                <span>·</span>
                                                <span className="text-red-500 font-bold">{currency}{fmt(guest.balance_due)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {guest.nights_remaining <= 1 && (
                                    <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full shrink-0">
                                        Yarın çıkış
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
