"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSmartOpsDashboard } from "@/hooks/useSmartOpsDashboard";
import { MetricCards } from "@/app/components/ops-dashboard/MetricCards";
import { OperationAlerts } from "@/app/components/ops-dashboard/OperationAlerts";
import { ArrivalsWidget } from "@/app/components/ops-dashboard/ArrivalsWidget";
import { DeparturesWidget } from "@/app/components/ops-dashboard/DeparturesWidget";
import { InHouseWidget } from "@/app/components/ops-dashboard/InHouseWidget";
import { NoShowWidget } from "@/app/components/ops-dashboard/NoShowWidget";
import { RoomStatusWidget } from "@/app/components/ops-dashboard/RoomStatusWidget";
import { UnassignedReservationsWidget } from "@/app/components/ops-dashboard/UnassignedReservationsWidget";
import { useHotel } from "@/app/context/HotelContext";

export default function SmartOpsDashboardView() {
    const { slug } = useParams();
    const router = useRouter();
    const { defaultCurrency } = useHotel();
    const currency = defaultCurrency || "₺";

    const {
        data,
        isLoading,
        isFetching,
        businessDate,
        widgetVisibility,
        alerts,
        handleCheckIn,
        handleCheckOut,
        handleMarkNoShow,
        handleAutoAssign,
        isCheckingIn,
        isCheckingOut,
        isAutoAssigning,
    } = useSmartOpsDashboard();

    const today = new Date(businessDate + "T00:00:00").toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-400 font-medium">Dashboard yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{today}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5 font-medium">
                        {isFetching && !isLoading ? "Veriler güncelleniyor..." : "Her 30 saniyede otomatik yenileme"}
                    </p>
                </div>
                <button
                    onClick={() => router.push(`/${slug}`)}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Genel Bakış
                </button>
            </div>

            {/* Alerts */}
            <OperationAlerts alerts={alerts} />

            {/* Row 1: Metric Cards */}
            {widgetVisibility.metrics && (
                <MetricCards metrics={data.metrics} currency={currency} />
            )}

            {/* Row 2: Arrivals + Departures */}
            {(widgetVisibility.arrivals || widgetVisibility.departures) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {widgetVisibility.arrivals && (
                        <ArrivalsWidget
                            arrivals={data.arrivals}
                            onCheckIn={handleCheckIn}
                            isLoading={isCheckingIn}
                        />
                    )}
                    {widgetVisibility.departures && (
                        <DeparturesWidget
                            departures={data.departures}
                            onCheckOut={handleCheckOut}
                            isLoading={isCheckingOut}
                            currency={currency}
                        />
                    )}
                </div>
            )}

            {/* Row 3: In-House + No-Show + Unassigned */}
            {(widgetVisibility.inHouse || widgetVisibility.noShow || widgetVisibility.unassigned) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {widgetVisibility.inHouse && (
                        <InHouseWidget
                            inHouse={data.in_house}
                            isLoading={isFetching}
                            currency={currency}
                        />
                    )}
                    {widgetVisibility.noShow && (
                        <NoShowWidget
                            noShowCandidates={data.no_show}
                            onMarkNoShow={handleMarkNoShow}
                            isLoading={isFetching}
                        />
                    )}
                    {widgetVisibility.unassigned && (
                        <UnassignedReservationsWidget
                            unassigned={data.unassigned}
                            onAutoAssign={handleAutoAssign}
                            isLoading={isAutoAssigning}
                        />
                    )}
                </div>
            )}

            {/* Row 4: Room Status (full width) */}
            {widgetVisibility.roomStatus && (
                <RoomStatusWidget
                    roomStatus={data.room_status}
                    isLoading={isFetching}
                />
            )}
        </div>
    );
}
