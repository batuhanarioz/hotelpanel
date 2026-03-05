"use client";

import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

interface RevenueData {
    date: string;
    room: number;
    extra: number;
    total: number;
}

interface BreakdownData {
    name: string;
    value: number;
}

interface Props {
    trendData: RevenueData[];
    typeBreakdown: BreakdownData[];
    sourceBreakdown: BreakdownData[];
    paymentStatus: BreakdownData[];
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function RevenueAnalytics({ trendData, typeBreakdown, sourceBreakdown, paymentStatus }: Props) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Gelir Trendi (Oda vs Ekstra)
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorRoom" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExtra" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(val: number | string | undefined) => `₺${Number(val || 0).toLocaleString("tr-TR")}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                formatter={(val: number | string | undefined) => `₺${Number(val || 0).toLocaleString("tr-TR")}`}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingBottom: "20px" }} />
                            <Area type="monotone" dataKey="room" name="Oda Geliri" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRoom)" />
                            <Area type="monotone" dataKey="extra" name="Ekstra Gelir" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorExtra)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breakdown by Room Type */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Oda Tipi Dağılımı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeBreakdown}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {typeBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Breakdown by Source */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Rezervasyon Kaynağı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceBreakdown} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Ödeme Durumu</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""} ${(Number(percent || 0) * 100).toFixed(0)}%`}
                                >
                                    <Cell key="cell-paid" fill="#10b981" />
                                    <Cell key="cell-pending" fill="#f59e0b" />
                                    <Cell key="cell-cancelled" fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
