import React, { useEffect, useState } from 'react';
import { Room } from './HousekeepingKPIs';

interface StaffAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    rooms: Room[];
    staffList: { id: string; name: string }[];
    initialRoomId?: string | null;
    onAssign: (staffId: string, roomIds: string[]) => void;
}

export function StaffAssignmentModal({ isOpen, onClose, rooms, staffList, initialRoomId, onAssign }: StaffAssignmentModalProps) {
    const [selectedStaff, setSelectedStaff] = useState<string>('');
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedRooms(initialRoomId ? [initialRoomId] : []);
            setSelectedStaff('');
        }
    }, [isOpen, initialRoomId]);

    if (!isOpen) return null;

    const handleRoomToggle = (roomId: string) => {
        setSelectedRooms(prev =>
            prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
        );
    };

    const handleAssign = () => {
        if (selectedStaff && selectedRooms.length > 0) {
            onAssign(selectedStaff, selectedRooms);
            onClose();
        }
    };

    const unassignedRooms = rooms.filter(r => !r.assigned_staff);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Personel Görevlendir</h3>
                        <p className="text-sm text-slate-500 mt-1">Personel seçerek ilgili odalara atama yapın.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2.5 rounded-xl transition-colors shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">1</div>
                            <label className="block text-sm font-bold text-slate-700">Personel Seçin</label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {staffList.map(staff => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(staff.id)}
                                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedStaff === staff.id ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-500/20' : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 shadow-sm'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${selectedStaff === staff.id ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        {staff.name.charAt(0)}
                                    </div>
                                    <span className={`font-bold text-sm ${selectedStaff === staff.id ? 'text-teal-900' : 'text-slate-700'}`}>{staff.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">2</div>
                                <label className="block text-sm font-bold text-slate-700">Oda Seçin <span className="text-slate-500 font-normal ml-1">({selectedRooms.length} seçili)</span></label>
                            </div>

                            {unassignedRooms.length > 0 && (
                                <button
                                    onClick={() => setSelectedRooms(unassignedRooms.map(r => r.id))}
                                    className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors border border-teal-100"
                                >
                                    Tümünü Seç
                                </button>
                            )}
                        </div>

                        {unassignedRooms.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                <svg className="w-10 h-10 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                                Tüm odalar bir personele atanmış durumda.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {unassignedRooms.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => handleRoomToggle(room.id)}
                                        className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${selectedRooms.includes(room.id) ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-500/20' : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50 shadow-sm'}`}
                                    >
                                        <span className={`text-xl font-extrabold ${selectedRooms.includes(room.id) ? 'text-teal-800' : 'text-slate-700'}`}>{room.room_number}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${selectedRooms.includes(room.id) ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'}`}>{room.room_type}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="text-sm text-slate-500 font-medium">
                        {selectedStaff && selectedRooms.length > 0 ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Onaya hazır
                            </span>
                        ) : (
                            <span>Seçim yapmanız bekleniyor...</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                            İptal
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedStaff || selectedRooms.length === 0}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
                        >
                            Görevlendir
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
