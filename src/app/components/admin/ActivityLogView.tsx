import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useHotel } from "@/app/context/HotelContext";
import { UserRole } from "@/types/database";

interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    module: string | null;
    affected_id: string | null;
    details: Record<string, unknown> | null;
    ip_address: string;
    created_at: string;
    users?: {
        full_name: string | null;
        email: string | null;
        role: string;
    };
}

export function ActivityLogView() {
    const hotel = useHotel();
    const isAdmin = hotel.userRole === UserRole.ADMIN || hotel.isSuperAdmin;
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filterModule, setFilterModule] = useState("");
    const [filterUser, setFilterUser] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                setError("Oturumunuzun süresi dolmuş olabilir. Lütfen sayfayı yenileyin.");
                setLoading(false);
                return;
            }

            const params = new URLSearchParams();
            params.append('limit', '50');
            if (filterModule) params.append('module', filterModule);
            if (filterUser) params.append('userId', filterUser);
            if (filterStartDate) params.append('startDate', filterStartDate);
            if (filterEndDate) params.append('endDate', filterEndDate);

            const res = await fetch(`/api/admin/activity-logs?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setLogs(data.logs || []);
                setError(null);
            }
        } catch (err) {
            setError("Loglar yüklenirken teknik bir hata oluştu.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterModule, filterUser, filterStartDate, filterEndDate]);

    if (loading) return (
        <div className="flex items-center justify-center py-20 italic text-slate-400 text-sm">
            Loglar yükleniyor...
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50/50 rounded-2xl border border-rose-100 mx-6 my-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <p className="font-bold">Bir Hata Oluştu</p>
            <p className="max-w-md text-center text-xs opacity-70 px-6">
                {error.includes('relation "activity_logs" does not exist')
                    ? "Aktivite logları tablosu veritabanında bulunamadı. Lütfen SQL scriptini Supabase SQL Editor üzerinden çalıştırdığınızdan emin olun."
                    : `Hata Detayı: ${error}`}
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-2 text-[10px] font-bold text-rose-700 underline uppercase tracking-widest"
            >
                Sayfayı Yenile
            </button>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">
                        {isAdmin ? "Sistem Aktivite Logları" : "Kişisel Aktivite Logları"}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {isAdmin ? "Tüm kullanıcı hareketlerini izleyin" : "Kendi sistem hareketlerinizi izleyin"}
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modül</label>
                    <select
                        value={filterModule}
                        onChange={(e) => setFilterModule(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/20 bg-white min-w-[120px]"
                    >
                        <option value="">Tümü</option>
                        <option value="RESERVATIONS">Rezervasyonlar</option>
                        <option value="FINANCE">Finans</option>
                        <option value="SYSTEM">Sistem</option>
                        <option value="HOUSEKEEPING">Housekeeping</option>
                    </select>
                </div>
                {isAdmin && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kullanıcı ID</label>
                        <input
                            type="text"
                            value={filterUser}
                            onChange={(e) => setFilterUser(e.target.value)}
                            placeholder="Kullanıcı ID..."
                            className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/20 bg-white min-w-[150px]"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Başlangıç</label>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bitiş</label>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
                    />
                </div>
                <div className="flex flex-col gap-1 lg:ml-auto">
                    <button
                        onClick={() => {
                            setFilterModule("");
                            setFilterUser("");
                            setFilterStartDate("");
                            setFilterEndDate("");
                        }}
                        className="mt-5 text-[10px] font-bold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">İşlem</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modül</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kullanıcı</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP Adresi</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-xs text-slate-400 italic">
                                    Henüz bir aktivite kaydı bulunamadı.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-700">{log.action}</span>
                                            {log.details && (
                                                <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit">
                                                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details).slice(0, 50)}...
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${log.module === 'SYSTEM' ? 'bg-indigo-50 text-indigo-600' :
                                            log.module === 'RESERVATIONS' ? 'bg-teal-50 text-teal-600' :
                                                log.module === 'FINANCE' ? 'bg-emerald-50 text-emerald-600' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {log.module || 'Genel'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {log.users?.full_name?.charAt(0) || "U"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-600">{log.users?.full_name || "Bilinmeyen"}</span>
                                                <span className="text-[10px] text-slate-400">{log.users?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{log.ip_address || "-"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {new Date(log.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
