"use client";

import React from "react";
import { HousekeepingTask } from "@/types/database";
import { ChevronRight, Home, Info } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface HousekeepingSnapshotProps {
    stats: {
        dirty: number;
        cleaning: number;
        ready: number;
        outOfService: number;
    };
    tasks: (HousekeepingTask & { room_number?: string; staff_name?: string })[];
    loading: boolean;
}

export function HousekeepingSnapshot({
    stats,
    tasks,
    loading
}: HousekeepingSnapshotProps) {
    const { slug } = useParams();

    if (loading) {
        return <div className="h-24 rounded-[32px] border border-gray-100 bg-white animate-pulse" />;
    }

    const total = stats.dirty + stats.cleaning + stats.ready + stats.outOfService || 1;
    const dirtyWidth = (stats.dirty / total) * 100;
    const cleaningWidth = (stats.cleaning / total) * 100;
    const readyWidth = (stats.ready / total) * 100;
    const oooWidth = (stats.outOfService / total) * 100;

    return (
        <section className="bg-white border border-gray-100 rounded-[32px] p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Title & Progress */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500">
                            <Home size={18} />
                        </div>
                        <h2 className="text-sm font-black text-gray-900 tracking-tight whitespace-nowrap">Kat Hizmetleri</h2>
                    </div>

                    <div className="h-1.5 w-24 bg-gray-50 rounded-full overflow-hidden flex shrink-0">
                        <div style={{ width: `${readyWidth}%` }} className="h-full bg-emerald-500" />
                        <div style={{ width: `${cleaningWidth}%` }} className="h-full bg-orange-400" />
                        <div style={{ width: `${dirtyWidth}%` }} className="h-full bg-red-500" />
                        <div style={{ width: `${oooWidth}%` }} className="h-full bg-gray-400" />
                    </div>
                </div>

                {/* Center: Metrics (Unified Row) */}
                <div className="flex flex-1 items-center justify-around md:justify-start md:gap-8 overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">KİRLİ</span>
                        <span className="text-base font-black text-gray-900">{stats.dirty}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">TEMİZLİK</span>
                        <span className="text-base font-black text-gray-900">{stats.cleaning}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">HAZIR</span>
                        <span className="text-base font-black text-gray-900">{stats.ready}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">OOS</span>
                        <span className="text-base font-black text-gray-900">{stats.outOfService}</span>
                    </div>
                </div>

                {/* Right: Link & Task Count */}
                <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-gray-50 pt-3 md:pt-0 md:pl-4">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest hidden lg:block">
                        {tasks.length} Görev Bekliyor
                    </span>
                    <Link
                        href={`/${slug}/housekeeping`}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                        YÖNET
                        <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
