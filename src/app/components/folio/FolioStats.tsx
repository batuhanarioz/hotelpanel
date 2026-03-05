import React from "react";

interface FolioStatsProps {
    stats: {
        totalRevenue: number;
        outstandingBalance: number;
        depositsCollected: number;
        refundAmount: number;
        transactionsCount: number;
        pendingApprovalSum: number;
        pendingApprovalCount: number;
    };
}

export function FolioStats({ stats }: FolioStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard
                label="Toplam Tutar"
                value={stats.totalRevenue}
                color="text-slate-900"
                bg="from-emerald-500 to-teal-500"
                icon={<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
            />
            <StatCard
                label="Bekleyen Bakiye"
                value={stats.outstandingBalance}
                color="text-amber-700"
                bg="from-amber-400 to-orange-500"
                icon={<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
            />
            <StatCard
                label="Alınan Avans/Tahsilat"
                value={stats.depositsCollected}
                color="text-emerald-700"
                bg="from-emerald-400 to-green-500"
                icon={<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="m4.5 12.75 6 6 9-13.5" /></svg>}
            />
            <StatCard
                label="İade Tutarı"
                value={stats.refundAmount}
                color="text-rose-700"
                bg="from-rose-400 to-red-500"
                icon={<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>}
            />
            <StatCard
                label="Onay Bekleyen"
                value={stats.pendingApprovalSum}
                subValue={`${stats.pendingApprovalCount} işlem`}
                color="text-amber-800"
                bg="from-amber-400 to-amber-600"
                icon={<svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>}
            />
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number;
    color: string;
    bg: string;
    icon: React.ReactNode;
    isNumber?: boolean;
    subValue?: string;
}

function StatCard({ label, value, color, bg, icon, isNumber, subValue }: StatCardProps) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ${bg}`}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{label}</p>
                    <p className={`text-base sm:text-lg font-bold ${color} truncate`}>
                        {(value ?? 0).toLocaleString("tr-TR")} {!isNumber && <span className="text-sm font-semibold">₺</span>}
                    </p>
                    {subValue && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{subValue}</p>}
                </div>
            </div>
        </div>
    );
}
