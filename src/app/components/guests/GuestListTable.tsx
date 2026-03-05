import React from "react";
import { GuestRow } from "@/hooks/useGuests";

interface GuestListTableProps {
    guests: GuestRow[];
    loading: boolean;
    onSelectGuest: (guest: GuestRow) => void;
}

export function GuestListTable({ guests, loading, onSelectGuest }: GuestListTableProps) {
    const getGuestStatus = (p: GuestRow) => {
        if (p.is_blacklist) return { label: "KARA LİSTE", color: "bg-rose-100 text-rose-700 border-rose-200" };

        const res = p.reservations || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const inHouse = res.find(r => r.status === 'checked_in');
        if (inHouse) return { label: "KONAKLIYOR", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };

        const upcoming = res.find(r => r.status === 'confirmed' && new Date(r.check_in_date) > today);
        if (upcoming) return { label: "YAKLAŞAN", color: "bg-blue-100 text-blue-700 border-blue-200" };

        const noShow = res.find(r => r.status === 'no_show');
        if (noShow) return { label: "GELMEDİ", color: "bg-amber-100 text-amber-700 border-amber-200" };

        const past = res.find(r => new Date(r.check_out_date) < today);
        if (past) return { label: "GEÇMİŞ", color: "bg-slate-100 text-slate-600 border-slate-200" };

        return { label: "KAYITLI", color: "bg-slate-50 text-slate-400 border-slate-100" };
    };

    const getGuestSummary = (p: GuestRow) => {
        const res = p.reservations || [];
        const stays = res.filter(r => r.status !== 'cancelled').length;
        const nights = res.reduce((sum, r) => {
            if (r.status === 'cancelled') return sum;
            const start = new Date(r.check_in_date);
            const end = new Date(r.check_out_date);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + (diff > 0 ? diff : 0);
        }, 0);

        const lastStay = res.length > 0
            ? new Date(Math.max(...res.map(r => new Date(r.check_out_date).getTime()))).toLocaleDateString("tr-TR")
            : "-";

        return { stays, nights, lastStay };
    };

    return (
        <div className="italic-none">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-6 py-4">Misafir</th>
                            <th className="px-6 py-4">İletişim</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-center">Konaklama Özeti</th>
                            <th className="px-6 py-4">Etiketler</th>
                            <th className="px-6 py-4 text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 rounded-xl"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 w-32 bg-slate-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-100 rounded-lg mx-auto"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-md"></div></td>
                                    <td className="px-6 py-4"><div className="h-10 w-24 bg-slate-100 rounded-xl float-right"></div></td>
                                </tr>
                            ))
                        ) : guests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Misafir bulunamadı</p>
                                    </div>
                                </td>
                            </tr>
                        ) : guests.map((p) => {
                            const status = getGuestStatus(p);
                            const summary = getGuestSummary(p);
                            return (
                                <tr key={p.id} className="group transition-colors hover:bg-slate-50/80">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-xs font-black text-white shadow-sm shadow-emerald-100 uppercase">
                                                {p.full_name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                                                    {p.full_name}
                                                    {p.is_vip && (
                                                        <span className={`ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter shadow-sm border ${p.vip_level === 'platinum' ? 'bg-slate-900 text-white border-slate-800' :
                                                                p.vip_level === 'gold' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}>
                                                            {p.vip_level || 'VIP'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <span>{p.birth_date ? new Date(p.birth_date).toLocaleDateString("tr-TR") : "Doğum tarihi yok"}</span>
                                                    {p.masked_identity_no && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-indigo-400">{p.masked_identity_no}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                                </svg>
                                                {p.phone || "-"}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                                <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                </svg>
                                                {p.email || "-"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter border ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center">
                                        <div className="text-[11px] font-black text-slate-900 tracking-tight">
                                            {summary.stays} Konaklama · {summary.nights} Gece
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                            Son: {summary.lastStay}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {p.tags?.length ? p.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                                                    {tag}
                                                </span>
                                            )) : <span className="text-[10px] font-bold text-slate-300">-</span>}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <button
                                            onClick={() => onSelectGuest(p)}
                                            className="rounded-xl border-2 border-slate-100 bg-white px-5 py-2 text-xs font-black text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 active:scale-95"
                                        >
                                            Profili Gör
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div >

            {/* Mobile Card View */}
            < div className="lg:hidden divide-y divide-slate-100" >
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 bg-white space-y-3 animate-pulse">
                            <div className="h-6 w-1/2 bg-slate-100 rounded-lg"></div>
                            <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
                            <div className="flex justify-between">
                                <div className="h-8 w-24 bg-slate-100 rounded-xl"></div>
                                <div className="h-8 w-24 bg-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    ))
                ) : guests.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center opacity-40">
                        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                        </div>
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Misafir bulunamadı</p>
                    </div>
                ) : guests.map((p) => {
                    const status = getGuestStatus(p);
                    const summary = getGuestSummary(p);
                    return (
                        <button
                            key={p.id}
                            onClick={() => onSelectGuest(p)}
                            className="w-full p-4 bg-white hover:bg-slate-50 transition-colors text-left flex flex-col gap-3 relative"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-xs font-black text-white uppercase italic">
                                    {p.full_name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                                        {p.full_name}
                                        {p.is_vip && (
                                            <span className={`ml-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter border ${p.vip_level === 'platinum' ? 'bg-slate-900 text-white border-slate-800' :
                                                    p.vip_level === 'gold' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                        'bg-slate-100 text-slate-700 border-slate-200'
                                                }`}>
                                                {p.vip_level || 'VIP'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                        {p.phone || p.masked_identity_no || "-"}
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Konaklama Özeti</span>
                                    <span className="text-[11px] font-bold text-slate-700 mt-1">{summary.stays} Konaklama · {summary.nights} Gece</span>
                                </div>
                                <div className="text-right flex flex-col">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Son Ziyaret</span>
                                    <span className="text-[11px] font-bold text-slate-700 mt-1">{summary.lastStay}</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div >
        </div >
    );
}
