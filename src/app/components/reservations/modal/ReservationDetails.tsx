import React from "react";
import { CHANNEL_OPTIONS, CURRENCY_OPTIONS } from "@/constants/reservations";
import { ReservationFormState, CalendarReservation } from "@/hooks/useReservationManagement";
import { ReservationStatus } from "@/types/database";

interface ReservationDetailsProps {
    form: ReservationFormState;
    setForm: React.Dispatch<React.SetStateAction<ReservationFormState>>;
    editing: CalendarReservation | null;
    staffMembers: string[];
    today?: string;
}

export function ReservationDetails({
    form, setForm, editing, staffMembers
}: ReservationDetailsProps) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 col-span-2 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 mb-2">
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Gecelik Ücret
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            {CURRENCY_OPTIONS.find(c => c.value === form.currency)?.symbol || "₺"}
                        </span>
                        <input
                            type="number"
                            value={form.nightlyRate}
                            onChange={(e) => {
                                const rate = parseFloat(e.target.value) || 0;
                                setForm(f => ({ ...f, nightlyRate: rate, totalAmount: rate * f.nightsCount }));
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                        Toplam Tutar
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            {CURRENCY_OPTIONS.find(c => c.value === form.currency)?.symbol || "₺"}
                        </span>
                        <input
                            type="number"
                            value={form.totalAmount}
                            onChange={(e) => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm font-black text-emerald-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Alınan Kapora
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                            {CURRENCY_OPTIONS.find(c => c.value === form.currency)?.symbol || "₺"}
                        </span>
                        <input
                            type="number"
                            value={form.depositAmount}
                            onChange={(e) => setForm(f => ({ ...f, depositAmount: parseFloat(e.target.value) || 0 }))}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                        Ödeme Durumu
                    </label>
                    <select
                        value={form.paymentStatus}
                        onChange={(e) => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                    >
                        <option value="unpaid">Ödenmedi</option>
                        <option value="partial">Kısmi Ödeme</option>
                        <option value="paid">Ödendi</option>
                    </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Para Birimi
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {CURRENCY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForm(f => ({ ...f, currency: opt.value }));
                                }}
                                className={`py-2 rounded-xl border text-xs font-black transition-all ${form.currency === opt.value
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50"
                                    }`}
                            >
                                {opt.value}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {editing && (() => {
                const start = new Date(
                    `${editing.date}T${editing.startHour.toString().padStart(2, "0")}:${(editing.startMinute ?? 0).toString().padStart(2, "0")}:00`
                );
                const end = new Date(start.getTime() + editing.durationMinutes * 60000);
                const isPast = end < new Date();
                if (!isPast) return null;
                return (
                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700">
                            Rezervasyon sonucu
                        </label>
                        <select
                            value={form.result}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    result: e.target.value as "" | "GERCEKLESTI" | "IPTAL",
                                }))
                            }
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                        >
                            <option value="">
                                Otomatik (varsayılan: Rezervasyon gerçekleştirildi)
                            </option>
                            <option value="GERCEKLESTI">Rezervasyon gerçekleştirildi</option>
                            <option value="IPTAL">Rezervasyon iptal edildi</option>
                        </select>
                    </div>
                );
            })()}

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Özel İstek (opsiyonel)</label>
                <input
                    type="text"
                    value={form.preferences}
                    onChange={(e) => setForm((f) => ({ ...f, preferences: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="..."
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">Pasaport (opsiyonel)</label>
                <input
                    type="text"
                    value={form.passport}
                    onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="..."
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    E-posta
                </label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    placeholder="ornek@misafir.com"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Personel
                </label>
                <select
                    value={form.assignedStaff}
                    onChange={(e) => setForm((f) => ({ ...f, assignedStaff: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                >
                    {staffMembers.map((d) => (
                        <option key={d} value={d}>{d || "Personel atanmadı"}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Kanal
                </label>
                <select
                    value={form.channel}
                    onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                >
                    {CHANNEL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Durum
                </label>
                <select
                    value={form.status}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            status: e.target.value as ReservationStatus,
                        }))
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                >
                    <option value="confirmed">Planlandı</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                    <option value="no_show">Gelmedi</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Etiketler
                </label>
                <input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    placeholder="Yeni misafir, VIP..."
                />
            </div>
        </>
    );
}
