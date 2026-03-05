"use client";

import React from "react";
import {
    CheckCircle2,
    Circle,
    Clock,
    Trash2,

    AlertCircle,
    Info,
    AlertTriangle,
    ChevronRight,
    CalendarCheck2
} from "lucide-react";
import { ControlItem } from "@/hooks/useDashboard";
import { useDashboard } from "@/hooks/useDashboard";

interface ControlListSectionProps {
    isToday: boolean;
    controlItems: ControlItem[];
    onOffsetChange: () => void;
    onItemClick: (item: ControlItem) => void;
}

const toneStyles: Record<string, { container: string; badge: string; icon: React.ElementType }> = {
    critical: { container: "border-l-red-500 bg-red-50/30 hover:bg-red-50/50", badge: "bg-red-100 text-red-700", icon: AlertCircle },
    high: { container: "border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50", badge: "bg-orange-100 text-orange-700", icon: AlertTriangle },
    medium: { container: "border-l-blue-500 bg-blue-50/30 hover:bg-blue-50/50", badge: "bg-blue-100 text-blue-700", icon: Info },
    low: { container: "border-l-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/50", badge: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export function ControlListSection({
    isToday,
    controlItems,
    onOffsetChange,
    onItemClick
}: ControlListSectionProps) {
    const { handleToggleTask, handleDeleteTask } = useDashboard();


    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-end">
                <button
                    onClick={onOffsetChange}
                    className="text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2"
                >
                    {isToday ? "Yarınki Görevler" : "Bugünkü Görevler"}
                    <ChevronRight size={14} className={isToday ? "" : "rotate-180"} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">


                {controlItems.length === 0 ? (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                        <div className="p-5 bg-gray-50 rounded-full mb-4">
                            <CalendarCheck2 className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-400 font-bold tracking-tight">Kontrol listesi şimdilik temiz.</p>
                        <p className="text-xs text-gray-300 mt-1 uppercase font-black tracking-widest">Tüm operasyonlar yolunda.</p>
                    </div>
                ) : (
                    controlItems.map((item) => {
                        const style = toneStyles[item.tone] || toneStyles.low;
                        const Icon = style.icon;

                        return (
                            <div
                                key={item.id}
                                className={`group relative border-l-4 rounded-2xl p-4 transition-all ${style.container} border border-gray-100 flex items-start gap-3`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {item.type === 'manual' ? (
                                        <button
                                            onClick={() => handleToggleTask(item.id, !item.completed)}
                                            className={`transition-colors ${item.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-blue-500'}`}
                                        >
                                            {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                        </button>
                                    ) : (
                                        <div className={style.badge.split(' ')[1]}>
                                            <Icon size={20} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => item.type !== 'manual' && onItemClick(item)}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${style.badge.split(' ')[1]}`}>
                                            {item.toneLabel}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {item.timeLabel}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-black text-gray-900 truncate tracking-tight ${item.completed ? 'line-through opacity-50' : ''}`}>
                                        {item.guestName}
                                    </h4>
                                    <p className={`text-[11px] font-bold text-gray-500 mt-1 leading-relaxed ${item.completed ? 'opacity-50' : ''}`}>
                                        {item.actionLabel || item.treatmentLabel}
                                    </p>
                                </div>

                                {item.type === 'manual' && (
                                    <button
                                        onClick={() => handleDeleteTask(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
