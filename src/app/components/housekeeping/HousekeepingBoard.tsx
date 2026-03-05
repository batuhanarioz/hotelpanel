import React from 'react';
import { Room, RoomStatus } from './HousekeepingKPIs';

interface HousekeepingBoardProps {
    rooms: Room[];
    viewMode: 'TABLE' | 'KANBAN';
    onStatusChange: (roomId: string, newStatus: RoomStatus) => void;
    onActionClick: (roomId: string, action: string) => void;
    onAssignStaffClick: (roomId: string) => void;
    onStartCleaning: (roomId: string) => void;
    onFinishCleaning: (roomId: string) => void;
}

export function HousekeepingBoard({
    rooms,
    viewMode,
    onStatusChange,
    onActionClick,
    onAssignStaffClick,
    onStartCleaning,
    onFinishCleaning
}: HousekeepingBoardProps) {

    const getStatusBadge = (status: RoomStatus) => {
        switch (status) {
            case "READY":
            case "CLEAN":
                return <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-emerald-200 shadow-sm">HAZIR / TEMİZ</span>;
            case "DIRTY":
                return <span className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-rose-200 shadow-sm">KİRLİ</span>;
            case "IN_PROGRESS":
            case "CLEANING":
                return <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-amber-200 shadow-sm">TEMİZLENİYOR</span>;
            case "QC_PENDING":
            case "INSPECTED":
                return <span className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-indigo-200 shadow-sm">KONTROL BEKLİYOR</span>;
            case "OOO":
                return <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-slate-200 shadow-sm">DEVRE DIŞI (OOO)</span>;
            case "OCCUPIED":
                return <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border border-blue-200 shadow-sm">DOLU</span>;
            default:
                return null;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "VIP":
                return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit border border-purple-200"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> VIP</span>;
            case "YÜKSEK":
            case "HIGH_PRIORITY":
                return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit border border-rose-200">YÜKSEK</span>;
            case "CHECKIN_TODAY":
                return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit border border-blue-200">BUGÜN GİRİŞ</span>;
            case "LATE_CHECKOUT":
                return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md text-[10px] font-bold w-fit border border-amber-200">GEÇ ÇIKIŞ</span>;
            case "NORMAL":
            default:
                return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-medium w-fit border border-slate-200">Normal</span>;
        }
    };

    // Kanban Columns
    const kanbanColumns = [
        { id: 'DIRTY', title: 'Kirli / Bekleyen', color: 'rose', status: 'DIRTY' as RoomStatus },
        { id: 'IN_PROGRESS', title: 'Temizleniyor', color: 'amber', status: 'IN_PROGRESS' as RoomStatus },
        { id: 'QC_PENDING', title: 'Kontrol / Onay', color: 'indigo', status: 'QC_PENDING' as RoomStatus },
        { id: 'READY', title: 'Temiz / Hazır', color: 'emerald', status: 'READY' as RoomStatus },
    ];

    if (viewMode === 'KANBAN') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 h-full min-h-[600px]">
                {kanbanColumns.map(column => (
                    <div key={column.id} className="flex flex-col bg-slate-50/50 rounded-3xl border border-slate-100 p-4 shadow-inner">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full bg-${column.color}-500 shadow-sm shadow-${column.color}-200`}></span>
                                {column.title}
                            </h3>
                            <span className="bg-white px-2.5 py-1 rounded-lg text-xs font-extrabold text-slate-500 border border-slate-200 shadow-sm">
                                {rooms.filter(r => r.status === column.status).length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[800px] pr-1 custom-scrollbar">
                            {/* Grouping by floor for scalability */}
                            {Array.from(new Set(rooms.filter(r => r.status === column.status).map(r => r.floor))).sort().map(floor => (
                                <div key={floor} className="mt-2">
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                        <span>Kat {floor}</span>
                                        <div className="h-px flex-1 bg-slate-200"></div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {rooms.filter(r => r.status === column.status && r.floor === floor).map(room => (
                                            <div key={room.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-slate-200">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="font-extrabold text-slate-800 text-base leading-tight">Oda {room.room_number}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{room.room_type}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1 items-end">
                                                        {getPriorityBadge(room.priority)}
                                                    </div>
                                                </div>

                                                {room.assigned_staff ? (
                                                    <div className="flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-[9px]">
                                                            {room.assigned_staff.name.charAt(0)}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-600 truncate">{room.assigned_staff.name}</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => onAssignStaffClick(room.id)}
                                                        className="w-full text-[10px] font-bold text-teal-600 bg-teal-50/50 hover:bg-teal-50 py-2 rounded-xl border border-dashed border-teal-200 transition-colors mb-3 flex items-center justify-center gap-1.5"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                        Ata
                                                    </button>
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {room.status === 'DIRTY' && (
                                                        <button
                                                            onClick={() => onStartCleaning(room.id)}
                                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-[10px] font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                                            BAŞLAT
                                                        </button>
                                                    )}
                                                    {room.status === 'CLEANING' && (
                                                        <button
                                                            onClick={() => onFinishCleaning(room.id)}
                                                            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            BİTİR
                                                        </button>
                                                    )}
                                                    {room.status === 'INSPECTED' && (
                                                        <button
                                                            onClick={() => onStatusChange(room.id, 'CLEAN')}
                                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-[10px] font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            ONAYLA
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onActionClick(room.id, 'REPORT_ISSUE')}
                                                        className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-200 hover:border-rose-100 shadow-sm"
                                                        title="Sorun Bildir"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Oda / Tip</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Kat</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Durum / Öncelik</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Görevli</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Zaman (Tahmini / Baş-Bit)</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        <p className="text-slate-500 font-medium text-lg">Oda bulunamadı</p>
                                        <p className="text-slate-400 text-sm mt-1">Arama kriterlerinize uygun oda bulunmuyor.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : rooms.map((room) => (
                            <tr key={room.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-extrabold text-slate-800 text-base">{room.room_number}</div>
                                    <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-1 uppercase bg-slate-100 w-fit px-2 py-0.5 rounded-md">{room.room_type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">{room.floor}. Kat</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-2.5 items-start">
                                        {getStatusBadge(room.status)}
                                        {getPriorityBadge(room.priority)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {room.assigned_staff ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                                {room.assigned_staff.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-slate-700">{room.assigned_staff.name}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onAssignStaffClick(room.id)}
                                            className="text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 hover:text-teal-700 px-3 py-2 rounded-xl transition-all border border-teal-100 hover:border-teal-200 active:scale-95 flex items-center gap-1 w-fit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Görevlendir
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="text-sm flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-slate-800 font-bold">{room.est_duration} dk <span className="text-slate-500 font-normal text-xs ml-1">(Tahmini)</span></span>
                                        </div>
                                        {(room.start_time || room.end_time || room.checkout_time) && (
                                            <div className="text-[11px] text-slate-500 flex flex-col gap-1 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                                                {room.checkout_time && <div className="flex items-center gap-1"><span className="text-rose-500 w-9">Çıkış:</span> <span className="text-slate-700">{room.checkout_time}</span></div>}
                                                {room.start_time && <div className="flex items-center gap-1"><span className="text-amber-500 w-9">Baş:</span> <span className="text-slate-700">{room.start_time}</span></div>}
                                                {room.end_time && <div className="flex items-center gap-1"><span className="text-emerald-500 w-9">Bit:</span> <span className="text-slate-700">{room.end_time}</span></div>}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        {room.status === 'DIRTY' && (
                                            <button onClick={() => onStartCleaning(room.id)} className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Başlat
                                            </button>
                                        )}
                                        {room.status === 'CLEANING' && (
                                            <button onClick={() => onFinishCleaning(room.id)} className="px-3.5 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95">
                                                Bitir / Kontrole Ver
                                            </button>
                                        )}
                                        {room.status === 'INSPECTED' && (
                                            <button onClick={() => onStatusChange(room.id, 'CLEAN')} className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95">
                                                Onayla
                                            </button>
                                        )}
                                        {room.status === 'CLEAN' && (
                                            <button onClick={() => onStatusChange(room.id, 'DIRTY')} className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition-all active:scale-95">
                                                Tekrar Temizle
                                            </button>
                                        )}

                                        <button onClick={() => onActionClick(room.id, 'MORE')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors ml-1 border border-transparent hover:border-slate-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
