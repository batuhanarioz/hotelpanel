"use client";

import { usePageHeader } from "@/app/components/AppShell";
import ReservationsList from "@/app/components/reservations/list/ReservationsList";

export default function ReservationsPage() {
    usePageHeader(
        "Rezervasyon Listesi",
        "Tüm rezervasyonları detaylı olarak listeleyin, filtreleyin ve arayın."
    );

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-500 space-y-6">
            <ReservationsList />
        </div>
    );
}
