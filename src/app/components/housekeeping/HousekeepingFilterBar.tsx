import React from 'react';
import { RoomStatus, RoomPriority } from './HousekeepingKPIs';

export interface FilterState {
    floor: string;
    status: RoomStatus | 'ALL';
    assignedStaff: string;
    priority: RoomPriority | 'ALL';
    onlyDirty: boolean;
}

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    staffList: { id: string; name: string }[];
    floors: string[];
}

export function HousekeepingFilterBar({ filters, onFilterChange, staffList, floors }: FilterBarProps) {
    const handleChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-8">
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <select
                    value={filters.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none min-w-[140px] transition-colors hover:bg-slate-100"
                >
                    <option value="ALL">Tüm Katlar</option>
                    {floors.map(f => <option key={f} value={f}>{f}. Kat</option>)}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => handleChange('status', e.target.value as RoomStatus | 'ALL')}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none min-w-[150px] transition-colors hover:bg-slate-100"
                >
                    <option value="ALL">Tüm Durumlar</option>
                    <option value="CLEAN">Temiz (Hazır)</option>
                    <option value="DIRTY">Kirli</option>
                    <option value="CLEANING">Temizleniyor</option>
                    <option value="INSPECTED">Kontrol Bekliyor</option>
                    <option value="OOO">Bakımda / OOO</option>
                    <option value="OCCUPIED">Dolu Oda</option>
                </select>

                <select
                    value={filters.assignedStaff}
                    onChange={(e) => handleChange('assignedStaff', e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none min-w-[160px] transition-colors hover:bg-slate-100"
                >
                    <option value="ALL">Tüm Personeller</option>
                    <option value="UNASSIGNED">Atanmamış</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => handleChange('priority', e.target.value as RoomPriority | 'ALL')}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none min-w-[150px] transition-colors hover:bg-slate-100"
                >
                    <option value="ALL">Tüm Öncelikler</option>
                    <option value="NORMAL">Normal</option>
                    <option value="YÜKSEK">Yüksek</option>
                    <option value="VIP">VIP</option>
                </select>
            </div>

            <div className="flex items-center w-full lg:w-auto bg-slate-50 py-2 px-4 rounded-xl border border-slate-200 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={filters.onlyDirty}
                        onChange={(e) => handleChange('onlyDirty', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                    <span className="ml-3 text-sm font-semibold text-slate-700">Sadece Kirli Odalar</span>
                </label>
            </div>
        </div>
    );
}
