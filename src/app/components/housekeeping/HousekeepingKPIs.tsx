import React from 'react';

// Shared types for Housekeeping Page
// Shared types for Housekeeping Page
export type RoomStatus = 'CLEAN' | 'READY' | 'DIRTY' | 'CLEANING' | 'IN_PROGRESS' | 'INSPECTED' | 'QC_PENDING' | 'OOO' | 'OCCUPIED';
export type RoomPriority = 'NORMAL' | 'YÜKSEK' | 'VIP' | 'CHECKIN_TODAY' | 'HIGH_PRIORITY' | 'LATE_CHECKOUT';

export interface Room {
    id: string;
    room_number: string;
    room_type: string;
    floor: string;
    status: RoomStatus;
    checkout_time?: string;
    priority: RoomPriority;
    assigned_staff?: {
        id: string;
        name: string;
        avatar?: string;
    };
    est_duration: number; // in mins
    actual_duration?: number;
    start_time?: string;
    end_time?: string;
}

interface HousekeepingKPIsProps {
    rooms: Room[];
}

export function HousekeepingKPIs({ rooms }: HousekeepingKPIsProps) {
    const cleanCount = rooms.filter(r => r.status === 'CLEAN' || r.status === 'READY').length;
    const dirtyCount = rooms.filter(r => r.status === 'DIRTY').length;
    const cleaningCount = rooms.filter(r => r.status === 'CLEANING' || r.status === 'IN_PROGRESS').length;
    const inspectedCount = rooms.filter(r => r.status === 'INSPECTED' || r.status === 'QC_PENDING').length;
    const oosCount = rooms.filter(r => r.status === 'OOO').length;
    const checkoutCount = rooms.filter(r => r.checkout_time).length;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <KPICard title="Temiz (Hazır)" value={cleanCount} color="emerald" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            } />
            <KPICard title="Kirli" value={dirtyCount} color="rose" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            } />
            <KPICard title="Temizleniyor" value={cleaningCount} color="amber" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            } />
            <KPICard title="Kontrol Bekliyor" value={inspectedCount} color="indigo" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            } />
            <KPICard title="Bakımda / OOO" value={oosCount} color="slate" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            } />
            <KPICard title="Bugün Çıkış" value={checkoutCount} color="blue" icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            } />
        </div>
    );
}

function KPICard({ title, value, color, icon }: { title: string, value: number, color: string, icon: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rose: 'bg-rose-50 text-rose-700 border-rose-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };

    const iconColorMap: Record<string, string> = {
        emerald: 'text-emerald-500 bg-emerald-100',
        rose: 'text-rose-500 bg-rose-100',
        amber: 'text-amber-500 bg-amber-100',
        slate: 'text-slate-500 bg-slate-100',
        blue: 'text-blue-500 bg-blue-100',
        purple: 'text-purple-500 bg-purple-100',
        indigo: 'text-indigo-500 bg-indigo-100',
    };


    const bgClass = colorMap[color] || colorMap.slate;
    const iconClass = iconColorMap[color] || iconColorMap.slate;

    return (
        <div className={`p-5 rounded-2xl border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${bgClass}`}>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold opacity-90">{title}</span>
                <div className={`p-2 rounded-xl ${iconClass}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-extrabold">{value}</div>
        </div>
    );
}
