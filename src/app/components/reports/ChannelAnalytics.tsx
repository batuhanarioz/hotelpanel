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

interface ChannelData {
    name: string;
    revenue: number;
    adr: number;
    occupancy: number;
}

interface Props {
    data: ChannelData[];
}

export function ChannelPerformance({ data }: Props) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Kanal Performans Karşılaştırması
            </h3>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#4f46e5" }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#10b981" }} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        />
                        <Bar yAxisId="left" dataKey="revenue" name="Gelir" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={25} />
                        <Bar yAxisId="right" dataKey="occupancy" name="Doluluk Katkısı (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
                {data.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.name}</p>
                        <p className="text-base font-black text-slate-800">₺{item.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 mt-1">ADR: ₺{item.adr.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
