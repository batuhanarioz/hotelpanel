"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { RoomBlock, Room } from "@/types/database";
import { format } from "date-fns";

export function RoomBlockManagement() {
    const { hotelId } = useHotel();
    const [blocks, setBlocks] = useState<RoomBlock[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form states
    const [roomId, setRoomId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [blockType, setBlockType] = useState<"OOO" | "OOS">("OOO");

    useEffect(() => {
        if (hotelId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [blocksRes, roomsRes] = await Promise.all([
                supabase.from("room_blocks").select("*").eq("hotel_id", hotelId).order("check_in_at", { ascending: false }),
                supabase.from("rooms").select("*").eq("hotel_id", hotelId).order("room_number", { ascending: true })
            ]);
            setBlocks(blocksRes.data || []);
            setRooms(roomsRes.data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from("room_blocks")
                .insert([{
                    hotel_id: hotelId,
                    room_id: roomId,
                    check_in_at: startDate,
                    check_out_at: endDate,
                    reason,
                    block_type: blockType
                }])
                .select()
                .single();

            if (error) throw error;
            setBlocks([data, ...blocks]);
            setModalOpen(false);
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu blokajı kaldırmak istediğinizden emin misiniz?")) return;
        try {
            const { error } = await supabase.from("room_blocks").delete().eq("id", id);
            if (error) throw error;
            setBlocks(blocks.filter(b => b.id !== id));
        } catch (err: unknown) {
            alert("Hata: " + (err as Error).message);
        }
    };

    if (loading && blocks.length === 0) return <div className="p-4 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6 italic-none">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Oda Blokajları (Out-of-Order)</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Bakım veya tadilat nedeniyle envanter dışı odaları yönetin</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg hover:bg-teal-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Yeni Blokaj Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {blocks.length === 0 ? (
                    <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                        <p className="text-sm font-bold text-slate-400">Aktif blokaj bulunmuyor.</p>
                    </div>
                ) : (
                    blocks.map(block => {
                        const room = rooms.find(r => r.id === block.room_id);
                        return (
                            <div key={block.id} className="p-5 rounded-3xl border bg-white shadow-sm flex items-center justify-between group hover:border-teal-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${block.block_type === 'OOO' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {block.block_type}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800">Oda #{room?.room_number || "???"} - {block.reason}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {format(new Date(block.check_in_at), "dd MMM")} - {format(new Date(block.check_out_at), "dd MMM yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(block.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-md overflow-hidden flex flex-col">
                        <div className="bg-rose-700 px-6 py-4">
                            <h3 className="text-white font-black text-lg">Oda Blokajı Tanımla</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Oda Seçin</label>
                                <select required value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white outline-none text-sm font-bold">
                                    <option value="">Oda...</option>
                                    {rooms.map(r => <option key={r.id} value={r.id}>#{r.room_number}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Başlangıç</label>
                                    <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Bitiş</label>
                                    <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Blokaj Tipi</label>
                                <select value={blockType} onChange={(e) => setBlockType(e.target.value as "OOO" | "OOS")} className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold">
                                    <option value="OOO">Out of Order (Satılamaz)</option>
                                    <option value="OOS">Out of Service (Sadece Servis Dışı)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Açıklama / Sebep</label>
                                <input required value={reason} onChange={(e) => setReason(e.target.value)} type="text" placeholder="Örn: Su baskını, Klima arızası" className="w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm font-bold" />
                            </div>
                            <div className="flex justify-end gap-2 pt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">İptal</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-rose-600 text-white text-sm font-black shadow-lg hover:bg-rose-700 transition-all">Blokajı Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
