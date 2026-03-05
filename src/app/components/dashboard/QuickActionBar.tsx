"use client";

import React from "react";
import {
    Plus,
    UserPlus,
    UserMinus,
    Search,
    DoorOpen
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface QuickActionBarProps {
    onNewReservation?: () => void;
    onQuickCheckIn?: () => void;
    onQuickCheckOut?: () => void;
    onSearchGuest?: () => void;
}

export function QuickActionBar({
    onNewReservation,
    onQuickCheckIn,
    onQuickCheckOut,
    onSearchGuest,
}: QuickActionBarProps) {
    const { slug } = useParams();

    return (
        <div className="flex flex-wrap items-center gap-3 mb-8 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
            <button
                onClick={onNewReservation}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm shadow-blue-200 transition-all active:scale-95"
            >
                <Plus size={20} />
                <span>Yeni Rezervasyon</span>
            </button>

            <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block" />

            <button
                onClick={onQuickCheckIn}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-all active:scale-95"
            >
                <UserPlus size={18} className="text-emerald-500" />
                <span>Hızlı Check-in</span>
            </button>

            <button
                onClick={onQuickCheckOut}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-all active:scale-95"
            >
                <UserMinus size={18} className="text-orange-500" />
                <span>Hızlı Check-out</span>
            </button>

            <button
                onClick={onSearchGuest}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-all active:scale-95"
            >
                <Search size={18} className="text-gray-400" />
                <span>Misafir Ara</span>
            </button>

            <Link
                href={`/${slug}/rooms`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium transition-all active:scale-95"
            >
                <DoorOpen size={18} className="text-purple-500" />
                <span>Oda Durumu</span>
            </Link>
        </div>
    );
}
