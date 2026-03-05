"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface RoomStatusData {
    name: string;
    value: number;
    color: string;
}

interface StaffPerformance {
    name: string;
    checkins: number;
}

interface Props {
    roomStatusSummary: RoomStatusData[];
    staffPerformance: StaffPerformance[];
    avgCheckinTime?: number;
}

export function OperationalAnalytics({ roomStatusSummary, staffPerformance, avgCheckinTime }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Status Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Oda Durum Özeti</h3>
                <div className="grid grid-cols-2 gap-4">
                    {roomStatusSummary.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl flex flex-col justify-between" style={{ backgroundColor: `${item.color}10` }}>
                            <p className="text-[10px] font-bold uppercase tracking-tight" style={{ color: item.color }}>{item.name}</p>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-2xl font-black text-slate-800">{item.value}</span>
                                <span className="text-[10px] font-medium text-slate-400">Oda</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff Performance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-6">Personel Giriş (Check-in) Performansı</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffPerformance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="checkins" name="Check-in Sayısı" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {avgCheckinTime && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center justify-between">
                        <span className="text-[11px] font-bold text-indigo-700">Ortalama Giriş Süresi</span>
                        <span className="text-xs font-black text-indigo-900">{avgCheckinTime} Dakika</span>
                    </div>
                )}
            </div>
        </div>
    );
}
