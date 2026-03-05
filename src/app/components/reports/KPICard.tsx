"use client";

interface Props {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    suffix?: string;
    prefix?: string;
    isLoading?: boolean;
}

export function KPICard({ label, value, trend, suffix, prefix, isLoading }: Props) {
    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                <div className="h-8 w-32 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-16 bg-slate-50 rounded" />
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-100 transition-colors group">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-indigo-600 transition-colors">
                {label}
            </p>

            <div className="flex items-baseline gap-1">
                {prefix && <span className="text-lg font-bold text-slate-400">{prefix}</span>}
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
                </h3>
                {suffix && <span className="text-sm font-semibold text-slate-500">{suffix}</span>}
            </div>

            {trend && (
                <div className="flex items-center gap-1.5 mt-2">
                    <div
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${trend.isPositive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                    >
                        <svg
                            className={`w-2.5 h-2.5 transition-transform ${trend.isPositive ? "" : "rotate-180"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                        {Math.abs(trend.value)}%
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">vs geçen dönem</span>
                </div>
            )}
        </div>
    );
}
