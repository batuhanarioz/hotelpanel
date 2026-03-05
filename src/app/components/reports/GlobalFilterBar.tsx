"use client";

import { useEffect, useState } from "react";
import { PremiumDatePicker } from "../PremiumDatePicker";

type DatePreset = "today" | "7d" | "30d" | "custom";

interface FilterState {
    dateRange: { start: string; end: string };
    preset: DatePreset;
    compare: boolean;
    roomType: string;
    source: string;
    staff: string;
    currency: string;
}

interface Props {
    onFilterChange: (filters: FilterState) => void;
    roomTypes: { id: string; name: string }[];
    sources: string[];
    staffList: { id: string; full_name: string }[];
}

export function GlobalFilterBar({ onFilterChange, roomTypes, sources, staffList }: Props) {
    const [preset, setPreset] = useState<DatePreset>("30d");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [compare, setCompare] = useState(false);
    const [roomType, setRoomType] = useState("ALL");
    const [source, setSource] = useState("ALL");
    const [staff, setStaff] = useState("ALL");
    const [currency, setCurrency] = useState("TRY");

    useEffect(() => {
        const today = new Date();
        const s = new Date();
        const e = new Date();

        if (preset === "today") {
            s.setTime(today.getTime());
        } else if (preset === "7d") {
            s.setDate(today.getDate() - 7);
        } else if (preset === "30d") {
            s.setDate(today.getDate() - 30);
        }

        if (preset !== "custom") {
            const sStr = s.toISOString().split("T")[0];
            const eStr = e.toISOString().split("T")[0];
            setStart(sStr);
            setEnd(eStr);
        }
    }, [preset]);

    useEffect(() => {
        onFilterChange({
            dateRange: { start, end },
            preset,
            compare,
            roomType,
            source,
            staff,
            currency,
        });
    }, [start, end, preset, compare, roomType, source, staff, currency, onFilterChange]);

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                {/* Date Presets */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(["today", "7d", "30d", "custom"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPreset(p)}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${preset === p ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {p === "today" ? "Bugün" : p === "7d" ? "7 Gün" : p === "30d" ? "30 Gün" : "Özel"}
                        </button>
                    ))}
                </div>

                {/* Custom Date Inputs */}
                {preset === "custom" && (
                    <div className="flex items-center gap-2">
                        <PremiumDatePicker value={start} onChange={setStart} compact className="w-40" />
                        <span className="text-slate-400">→</span>
                        <PremiumDatePicker value={end} onChange={setEnd} compact className="w-40" />
                    </div>
                )}

                {/* Compare Toggle */}
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div
                        onClick={() => setCompare(!compare)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${compare ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${compare ? "translate-x-5" : ""
                                }`}
                        />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        Önceki Dönemle Karşılaştır
                    </span>
                </label>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="flex flex-wrap items-center gap-3">
                {/* Room Type Filter */}
                <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                    <option value="ALL">Tüm Oda Tipleri</option>
                    {roomTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                {/* Source Filter */}
                <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                    <option value="ALL">Tüm Rezervasyon Kaynakları</option>
                    {sources.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {/* Staff Filter */}
                <select
                    value={staff}
                    onChange={(e) => setStaff(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                    <option value="ALL">Tüm Personel</option>
                    {staffList.map((s) => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                </select>

                {/* Currency Selector */}
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                    <option value="TRY">₺ TRY</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                </select>

                <div className="flex-1" />

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 bg-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 bg-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
