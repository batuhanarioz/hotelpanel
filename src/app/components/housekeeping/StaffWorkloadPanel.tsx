import React from 'react';
import { Room } from '@/types/database';

interface StaffWorkloadPanelProps {
    rooms: any[]; // Using any[] temporarily for flexible mapping
    staffList: { id: string; name: string }[];
}

export function StaffWorkloadPanel({ rooms, staffList }: StaffWorkloadPanelProps) {
    const workloadData = staffList.map(staff => {
        const staffRooms = rooms.filter(r => r.assigned_staff?.id === staff.id);
        const cleaningCount = staffRooms.filter(r => r.status === 'CLEANING').length;
        const assignedCount = staffRooms.filter(r => r.status === 'DIRTY').length;
        const completedCount = staffRooms.filter(r => r.status === 'CLEAN' || r.status === 'INSPECTED').length;

        return {
            id: staff.id,
            name: staff.name,
            assigned: assignedCount,
            cleaning: cleaningCount,
            completed: completedCount,
            total: staffRooms.length
        };
    });

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8 p-6 lg:p-4">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Personel İş Yükü</h3>
                    <p className="text-xs text-slate-500 font-medium">Günlük görev dağılımı ve ilerleme</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {workloadData.map(staff => (
                    <div key={staff.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-all flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shadow-sm">
                                    {staff.name.charAt(0)}
                                </div>
                                <span className="font-bold text-sm text-slate-700 truncate max-w-[120px]">{staff.name}</span>
                            </div>
                            <div className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500">
                                {staff.total} Oda
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Atanan</span>
                                <span className="text-sm font-extrabold text-slate-700">{staff.assigned}</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center shadow-sm">
                                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-tighter">Temizlik</span>
                                <span className="text-sm font-extrabold text-teal-600">{staff.cleaning}</span>
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Tamam</span>
                                <span className="text-sm font-extrabold text-emerald-600">{staff.completed}</span>
                            </div>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: staff.total > 0 ? `${(staff.completed / staff.total) * 100}%` : '0%' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
