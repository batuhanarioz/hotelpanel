"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

interface GuestData {
    name: string;
    value: number;
}

interface NationalityData {
    country: string;
    count: number;
    revenue: number;
}

interface Props {
    newVsReturning: GuestData[];
    nationalityDistribution: NationalityData[];
    avgSpendPerGuest: number;
    avgNightsPerGuest: number;
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export function GuestAnalytics({ newVsReturning, nationalityDistribution, avgSpendPerGuest, avgNightsPerGuest }: Props) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* New vs Returning */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">Yeni vs Gelen Misafir Dağılımı</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={newVsReturning}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {newVsReturning.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Nationalities */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6">En Çok Gelen Uyruklar</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nationalityDistribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="country"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: "#64748b" }}
                                    width={80}
                                />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-indigo-100 text-xs font-bold uppercase mb-1">Misafir Başı Ortalama Harcama</p>
                    <h4 className="text-3xl font-black">₺{avgSpendPerGuest.toLocaleString()}</h4>
                    <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Önceki döneme göre %12 artış</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Misafir Başı Ortalama Geceleme (LOS)</p>
                    <h4 className="text-3xl font-black">{avgNightsPerGuest.toFixed(1)} Gece</h4>
                    <div className="mt-4 flex items-center gap-2 text-[10px] bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                        </svg>
                        <span>Önceki döneme göre %5 azalış</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
