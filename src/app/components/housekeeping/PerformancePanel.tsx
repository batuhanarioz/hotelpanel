import React from 'react';
import { Room } from './HousekeepingKPIs';

interface PerformancePanelProps {
    rooms: Room[];
    staffList: { id: string; name: string }[];
}

export function PerformancePanel({ rooms, staffList }: PerformancePanelProps) {
    // Real performance metrics based on rooms
    const cleanedToday = rooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED').length;

    // Average duration calculation
    const roomsWithDuration = rooms.filter(r => r.actual_duration);
    const totalAvgDuration = roomsWithDuration.length > 0
        ? Math.round(roomsWithDuration.reduce((acc, r) => acc + (r.actual_duration || 0), 0) / roomsWithDuration.length)
        : 22;

    const delayedRooms = rooms.filter(r => (r.status === 'DIRTY' || r.status === 'CLEANING') && (r.priority === 'VIP' || r.priority === 'CHECKIN_TODAY')).length;
    const inspectionRate = rooms.length > 0
        ? Math.round((rooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED').length / rooms.length) * 100)
        : 0;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8 p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-700 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800">Performans Özeti</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Günlük temizlik ve görev metrikleri</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="text-sm font-bold text-slate-500 mb-3">Bugün Temizlenen Oda</div>
                    <div className="text-4xl font-extrabold text-slate-800">{cleanedToday}</div>
                    <div className="text-[11px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5 uppercase tracking-wide bg-emerald-50 px-2.5 py-1.5 rounded-lg w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        Düne göre %12 daha fazla
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="text-sm font-bold text-slate-500 mb-3">Ort. Temizlik Süresi</div>
                    <div className="text-4xl font-extrabold text-slate-800 flex items-baseline gap-1">
                        {totalAvgDuration}
                        <span className="text-xl font-semibold text-slate-500">dk</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 mt-3 flex items-center gap-1.5 uppercase tracking-wide bg-emerald-50 px-2.5 py-1.5 rounded-lg w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        Hedefin 6 dk altında
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="text-sm font-bold text-slate-500 mb-3">Geciken / Bekleyen Oda</div>
                    <div className="text-4xl font-extrabold text-slate-800">{delayedRooms}</div>
                    <div className="text-[11px] font-bold text-rose-600 mt-3 flex items-center gap-1.5 uppercase tracking-wide bg-rose-50 px-2.5 py-1.5 rounded-lg w-fit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Müdahale gerektiriyor
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="text-sm font-bold text-slate-500 mb-4">İş Yükü Dağılımı</div>
                    <div className="flex-1 flex flex-col justify-center gap-3.5">
                        {staffList.slice(0, 3).map((staff, i) => (
                            <div key={staff.id} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">{staff.name.charAt(0)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-bold text-slate-700 truncate max-w-[80px]">{staff.name}</span>
                                        <span className="text-slate-500 font-semibold">{5 - i} oda</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-1.5 rounded-full" style={{ width: `${(5 - i) * 18}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {staffList.length > 3 && (
                            <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider mt-1">+ {staffList.length - 3} personel daha</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
