"use client";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface OccupancyData {
    date: string;
    rate: number;
    available: number;
    occupied: number;
}

interface RoomTypeOccupancy {
    name: string;
    rate: number;
    revenue: number;
}

interface Props {
    occupancyTrend: OccupancyData[];
    roomTypeStats: RoomTypeOccupancy[];
    oooImpact: { name: string; value: number }[];
}

export function OccupancyAnalytics({ occupancyTrend, roomTypeStats, oooImpact }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Doluluk Oranı Trendi (%)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={occupancyTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                                tickFormatter={(val) => `%${val}`}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                formatter={(val: number | string | undefined) => [`%${Number(val || 0).toLocaleString("tr-TR")}`, "Doluluk"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ fill: "#10b981", strokeWidth: 2, r: 4, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Room Type Occupancy */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Oda Tipi Bazlı Doluluk</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roomTypeStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    width={100}
                                />
                                <Tooltip
                                    formatter={(val: number | string | undefined) => [`%${Number(val || 0).toLocaleString("tr-TR")}`, "Doluluk"]}
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Out of Order Impact */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Arızalı Oda (OOO) Etkisi</h3>
                    <div className="space-y-4">
                        {oooImpact.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-slate-700">{item.name}</p>
                                    <p className="text-[10px] text-slate-400">Toplam OOO günü: {item.value}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-rose-500">-{item.value} Gün</p>
                                    <p className="text-[10px] text-slate-400">Kayıp Potansiyel</p>
                                </div>
                            </div>
                        ))}
                        {oooImpact.length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-10 italic">Seçili dönemde arızalı oda kaydı bulunamadı.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
