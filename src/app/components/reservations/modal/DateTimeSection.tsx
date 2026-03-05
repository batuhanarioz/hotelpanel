import React from "react";
import { PremiumDatePicker } from "@/app/components/PremiumDatePicker";
import { BOARD_TYPES } from "@/constants/reservations";
import { ReservationFormState } from "@/hooks/useReservationManagement";
import { addDays, format, parseISO, differenceInDays } from "date-fns";

interface DateTimeSectionProps {
    formDate: string;
    setFormDate: (date: string) => void;
    formTime: string;
    setFormTime: (time: string) => void;
    today: string;
    form: ReservationFormState;
    setForm: React.Dispatch<React.SetStateAction<ReservationFormState>>;
    rooms: { id: string; room_number: string; room_type?: { name: string }[] }[];
}

export function DateTimeSection({
    formDate, setFormDate, formTime, setFormTime, today, form, setForm, rooms
}: DateTimeSectionProps) {
    const checkOutDate = format(addDays(parseISO(formDate), form.nightsCount), "yyyy-MM-dd");

    const handleCheckOutChange = (newDate: string) => {
        const nights = differenceInDays(parseISO(newDate), parseISO(formDate));
        if (nights >= 1) {
            setForm(f => ({ ...f, nightsCount: nights }));
        }
    };

    return (
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 mb-2">
            <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Giriş Tarihi
                </label>
                <PremiumDatePicker
                    value={formDate}
                    onChange={setFormDate}
                    today={today}
                    compact
                />
            </div>

            <div className="flex flex-col items-center justify-center pt-4">
                <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-indigo-100">
                    {form.nightsCount} GECE
                </div>
                <div className="h-px w-full bg-slate-200 -mt-2.5 z-0"></div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                    Çıkış Tarihi
                </label>
                <PremiumDatePicker
                    value={checkOutDate}
                    onChange={handleCheckOutChange}
                    today={formDate}
                    compact
                    align="right"
                />
            </div>

            <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Oda & Konaklama Tipi
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <select
                        value={form.roomId}
                        onChange={(e) => setForm(f => ({ ...f, roomId: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                        required
                    >
                        <option value="">Oda Seçin</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>
                                Oda {room.room_number} — {room.room_type?.[0]?.name || "Standart"}
                            </option>
                        ))}
                    </select>
                    <select
                        value={form.boardType}
                        onChange={(e) => setForm((f) => ({ ...f, boardType: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                    >
                        {BOARD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                    Giriş Saati
                </label>
                <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
            </div>
        </div>
    );
}
