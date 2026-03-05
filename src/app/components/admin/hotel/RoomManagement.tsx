"use client";

import React, { useState, useEffect } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { Room, RoomType } from "@/types/database";

export function RoomManagement() {
    const { hotelId } = useHotel();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    // Form states
    const [roomNumber, setRoomNumber] = useState("");
    const [roomTypeId, setRoomTypeId] = useState("");
    const [floor, setFloor] = useState("");
    const [paxLimit, setPaxLimit] = useState(2);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (hotelId) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotelId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsRes, typesRes] = await Promise.all([
                supabase.from("rooms").select("*").eq("hotel_id", hotelId).order("room_number", { ascending: true }),
                supabase.from("room_types").select("*").eq("hotel_id", hotelId),
            ]);

            setRooms(roomsRes.data || []);
            setRoomTypes(typesRes.data || []);

            if (typesRes.data?.length) setRoomTypeId(typesRes.data[0].id);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingRoom(null);
        setRoomNumber("");
        setFloor("");
        setNotes("");
        setPaxLimit(2);
        setModalOpen(true);
    };

    const openEdit = (room: Room) => {
        setEditingRoom(room);
        setRoomNumber(room.room_number);
        setRoomTypeId(room.room_type_id);
        setFloor(room.floor || "");
        setPaxLimit(room.pax_limit || 2);
        setNotes(room.notes || "");
        setModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            hotel_id: hotelId,
            room_number: roomNumber,
            room_type_id: roomTypeId,
            floor: floor || null,
            pax_limit: paxLimit,
            notes,
            status: editingRoom?.status || "CLEAN"
        };

        try {
            if (editingRoom) {
                const { error } = await supabase.from("rooms").update(payload).eq("id", editingRoom.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("rooms").insert([payload]);
                if (error) throw error;
            }
            setModalOpen(false);
            fetchData();
        } catch (err: unknown) {
            if (err instanceof Error) {
                alert("Hata: " + err.message);
            } else {
                alert("Beklenmeyen bir hata oluştu.");
            }
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="space-y-6 italic-none">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-800">Odalar</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Otelinizdeki tüm fiziksel odaları yönetin</p>
                </div>
                <button
                    onClick={openCreate}
                    className="h-11 px-6 rounded-xl bg-teal-600 text-white text-xs font-black shadow-lg shadow-teal-100/50 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Yeni Oda Ekle
                </button>
            </div>

            <div className="border rounded-3xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oda No</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kat</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oda Tipi</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasite</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rooms.map((room) => {
                            const type = roomTypes.find(t => t.id === room.room_type_id);
                            return (
                                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-black text-slate-700">#{room.room_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-500">{room.floor || "-"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{type?.name || "Belirsiz"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-600">{room.pax_limit || 2} Pax</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${room.status === 'CLEAN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEdit(room)} className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-md overflow-hidden flex flex-col">
                        <div className="bg-teal-700 px-6 py-4">
                            <h3 className="text-white font-black text-lg">{editingRoom ? "Odayı Düzenle" : "Yeni Oda Tanımla"}</h3>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Oda Numarası</label>
                                <input required value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} type="text" placeholder="Örn: 101" className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all text-sm font-bold" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Bulunduğu Kat</label>
                                <input value={floor} onChange={(e) => setFloor(e.target.value)} type="text" placeholder="Örn: 1. Kat" className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white outline-none text-sm font-bold" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Oda Tipi</label>
                                <select required value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)} className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white outline-none text-sm font-bold appearance-none">
                                    <option value="">Tip Seçin</option>
                                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Maksimum Kapasite (Pax)</label>
                                <input value={paxLimit} onChange={(e) => setPaxLimit(Number(e.target.value))} type="number" min="1" className="w-full h-11 px-4 rounded-xl border bg-slate-50 focus:bg-white outline-none text-sm font-bold" />
                            </div>

                            <div className="flex justify-end gap-2 pt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">İptal</button>
                                <button type="submit" className="px-8 py-2 rounded-xl bg-teal-600 text-white text-sm font-black shadow-lg hover:bg-teal-700 transition-all">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
