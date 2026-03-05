import React from "react";

import { ReservationFormState } from "@/hooks/useReservationManagement";

interface GuestNotesProps {
    form: ReservationFormState;
    setForm: React.Dispatch<React.SetStateAction<ReservationFormState>>;
}

export function GuestNotes({ form, setForm }: GuestNotesProps) {
    return (
        <>

            <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    Rezervasyon öncesi not / Misafir ile ilgili ön bilgiler
                </label>
                <textarea
                    value={form.guestNote}
                    onChange={(e) => setForm((f) => ({ ...f, guestNote: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    rows={2}
                    placeholder="Misafirin talebi veya rezervasyon öncesi notlar..."
                />
            </div>
            <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                    İşlem sonrası not (Personel/Oda)
                </label>
                <textarea
                    value={form.internalNote}
                    onChange={(e) => setForm((f) => ({ ...f, internalNote: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                    rows={2}
                    placeholder="Rezervasyon sonrası personel tarafından doldurulur..."
                />
            </div>
            {(form.channel === "WhatsApp" || form.channel === "whatsapp") && (
                <>
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                            Kaynak conversation_id
                        </label>
                        <input
                            value={form.conversationId}
                            onChange={(e) => setForm((f) => ({ ...f, conversationId: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                            placeholder="Opsiyonel"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">
                            Kaynak message_id
                        </label>
                        <input
                            value={form.messageId}
                            onChange={(e) => setForm((f) => ({ ...f, messageId: e.target.value }))}
                            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                            placeholder="Opsiyonel"
                        />
                    </div>
                </>
            )}
        </>
    );
}
