"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { usePageHeader } from "@/app/components/AppShell";
import { HousekeepingKPIs, Room, RoomStatus, RoomPriority } from '@/app/components/housekeeping/HousekeepingKPIs';
import { HousekeepingFilterBar, FilterState } from '@/app/components/housekeeping/HousekeepingFilterBar';
import { HousekeepingBoard } from '@/app/components/housekeeping/HousekeepingBoard';
import { StaffAssignmentModal } from '@/app/components/housekeeping/StaffAssignmentModal';
import { PerformancePanel } from '@/app/components/housekeeping/PerformancePanel';
import { StaffWorkloadPanel } from '@/app/components/housekeeping/StaffWorkloadPanel';
import { MaintenanceIssueModal } from '@/app/components/housekeeping/MaintenanceIssueModal';
import { useHotel } from "@/app/context/HotelContext";
import { getRooms, getStaff } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function HousekeepingPage() {
    usePageHeader("Kat Hizmetleri (Housekeeping)", "Oda temizlik durumlarını ve görevleri anlık olarak takip edin.");

    const hotelCtx = useHotel();


    // Fetch actual rooms
    const { data: roomsData = [], isLoading: isLoadingRooms } = useQuery({
        queryKey: ["rooms", hotelCtx.hotelId],
        queryFn: () => getRooms(hotelCtx.hotelId || ""),
        enabled: !!hotelCtx.hotelId
    });

    // Fetch actual staff
    const { data: staffData = [] } = useQuery({
        queryKey: ["staff", hotelCtx.hotelId],
        queryFn: () => getStaff(hotelCtx.hotelId || ""),
        enabled: !!hotelCtx.hotelId
    });

    // We will keep local state for rapid UI updates, but sync it when query data changes
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (roomsData.length > 0) {
            // Map API response to our UI Room type
            const mappedRooms: Room[] = roomsData.map((r: { id: string, room_number: string, room_type?: { name?: string }[], floor?: string | number, status?: string }) => ({
                id: r.id,
                room_number: r.room_number,
                room_type: (Array.isArray(r.room_type) ? r.room_type[0]?.name : (r.room_type as unknown as { name?: string })?.name) || "Standart",
                floor: r.floor?.toString() || "1",
                status: (r.status || "TEMİZ") as RoomStatus,
                priority: "NORMAL" as RoomPriority, // TODO: fetch from actual tasks if needed
                est_duration: 30, // Default mock value since it's not in rooms table
                assigned_staff: undefined, // TODO: fetch from current tracking
            }));
            setRooms(mappedRooms);
        }
    }, [roomsData]);

    const staffList = useMemo(() => {
        return staffData.map((s: { id: string, full_name: string }) => ({
            id: s.id,
            name: s.full_name
        }));
    }, [staffData]);

    const [viewMode, setViewMode] = useState<'TABLE' | 'KANBAN'>('TABLE');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const [filters, setFilters] = useState<FilterState>({
        floor: 'ALL',
        status: 'ALL',
        assignedStaff: 'ALL',
        priority: 'ALL',
        onlyDirty: false
    });

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignRoomId, setAssignRoomId] = useState<string | null>(null);

    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [issueRoom, setIssueRoom] = useState<{ id: string; number: string } | null>(null);

    // Filter Logic
    const filteredRooms = useMemo(() => {
        let filtered = rooms.filter(room => {
            if (filters.floor !== 'ALL' && room.floor !== filters.floor) return false;
            if (filters.status !== 'ALL' && room.status !== filters.status) return false;
            if (filters.priority !== 'ALL' && room.priority !== filters.priority) return false;
            if (filters.onlyDirty && room.status !== 'DIRTY' && room.status !== 'CLEANING') return false;
            return true;
        });

        if (filters.assignedStaff !== 'ALL') {
            filtered = filtered.filter(room => {
                if (filters.assignedStaff === 'UNASSIGNED') {
                    return !room.assigned_staff;
                } else {
                    return room.assigned_staff?.id === filters.assignedStaff;
                }
            });
        }

        return filtered;
    }, [rooms, filters]);

    // Async Update Mutations
    const updateRoomStatusMutation = useMutation({
        mutationFn: async ({ roomId, status }: { roomId: string, status: string }) => {
            const { error } = await supabase.from('rooms').update({ status }).eq('id', roomId);
            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate to refetch fresh data optionally
            // queryClient.invalidateQueries({ queryKey: ["rooms", hotelCtx.hotelId] });
        }
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Handlers
    const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
        // Optimistic UI update
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
        updateRoomStatusMutation.mutate({ roomId, status: newStatus });

        if (newStatus === 'READY' || newStatus === 'CLEAN') {
            showToast("Oda başarıyla onaylandı ve kullanıma hazır.", 'success');
            // Also update room's last_cleaned_at if we want (DB trigger does this too)
        } else if (newStatus === 'QC_PENDING' || newStatus === 'INSPECTED') {
            showToast("Temizlik bitti, kontrol listesine eklendi.", 'info');
        } else if (newStatus === 'DIRTY') {
            showToast("Oda tekrar temizlik listesine eklendi.", 'info');
        }
    };

    const handleStartCleaning = (roomId: string) => {
        handleStatusChange(roomId, 'IN_PROGRESS');
        // Update DB with start time
        const now = new Date().toISOString();
        supabase.from('housekeeping_tasks')
            .update({
                status: 'IN_PROGRESS',
                cleaning_started_at: now,
                started_at: now
            })
            .eq('room_id', roomId)
            .eq('status', 'DIRTY')
            .then(({ error }) => {
                if (error) console.error("Error starting cleaning:", error);
            });
    };

    const handleFinishCleaning = (roomId: string) => {
        handleStatusChange(roomId, 'QC_PENDING');
        // Update DB with completion time and calculate duration

        const now = new Date();
        const nowIso = now.toISOString();

        // Find existing task to get start time for duration calculation
        supabase.from('housekeeping_tasks')
            .select('cleaning_started_at, started_at')
            .eq('room_id', roomId)
            .eq('status', 'IN_PROGRESS')
            .single()
            .then(({ data, error }) => {
                let duration = 0;
                if (!error && data) {
                    const start = new Date(data.cleaning_started_at || data.started_at);
                    duration = Math.round((now.getTime() - start.getTime()) / (1000 * 60));
                }

                supabase.from('housekeeping_tasks')
                    .update({
                        status: 'QC_PENDING',
                        cleaning_completed_at: nowIso,
                        completed_at: nowIso,
                        cleaning_duration_minutes: duration > 0 ? duration : null
                    })
                    .eq('room_id', roomId)
                    .eq('status', 'IN_PROGRESS')
                    .then(({ error }) => {
                        if (error) console.error("Error finishing cleaning:", error);
                    });
            });
    };

    const handleActionClick = (roomId: string, action: string) => {
        if (action === 'INSPECTION') {
            handleStatusChange(roomId, 'QC_PENDING');
        } else if (action === 'REPORT_ISSUE') {
            handleReportIssue(roomId);
        } else if (action === 'MORE') {
            alert(`Daha fazla işlem menüsü (Yakında)`);
        }
    };

    const handleAssignStaffClick = (roomId?: string | unknown) => {
        if (typeof roomId === 'string') {
            setAssignRoomId(roomId);
        } else {
            setAssignRoomId(null);
        }
        setIsAssignModalOpen(true);
    };

    const handleAssign = (staffId: string, roomIds: string[]) => {
        const staff = staffList.find(s => s.id === staffId);
        if (!staff) return;

        setRooms(prev => prev.map(r =>
            roomIds.includes(r.id) ? { ...r, assigned_staff: staff } : r
        ));
        // TODO: Save assignment to DB
    };

    // --- Enterprise Logic: Smart Algorithm ---
    const handleSmartAssign = () => {
        if (rooms.length === 0 || staffList.length === 0) return;

        const updatedRooms = [...rooms];
        const dirtyRooms = updatedRooms.filter(r => (r.status === 'DIRTY' || r.status === 'IN_PROGRESS' || r.status === 'CLEANING') && !r.assigned_staff);

        if (dirtyRooms.length === 0) {
            showToast("Atanacak kirli oda bulunamadı.", 'info');
            return;
        }

        // Improved Algorithm: Priority & Floor balance
        const priorityRank: Record<string, number> = {
            'VIP': 5,
            'CHECKIN_TODAY': 4,
            'HIGH_PRIORITY': 3,
            'YÜKSEK': 3,
            'LATE_CHECKOUT': 2,
            'NORMAL': 1
        };

        const sortedRooms = [...dirtyRooms].sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));

        sortedRooms.forEach(room => {
            const staffWorkloads = staffList.map(s => ({
                ...s,
                count: updatedRooms.filter(r => r.assigned_staff?.id === s.id).length,
                onSameFloor: updatedRooms.filter(r => r.assigned_staff?.id === s.id && r.floor === room.floor).length
            }));

            // Sort logic: Floor match first, then lowest workload
            staffWorkloads.sort((a, b) => {
                if (b.onSameFloor !== a.onSameFloor) return b.onSameFloor - a.onSameFloor;
                return a.count - b.count;
            });

            const bestStaff = staffWorkloads[0];
            const roomIndex = updatedRooms.findIndex(r => r.id === room.id);
            if (roomIndex !== -1) {
                updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], assigned_staff: bestStaff };
            }
        });

        setRooms(updatedRooms);
        showToast(`${dirtyRooms.length} oda akıllı algoritmaya göre otomatik atandı.`, 'success');
    };

    const handleReportIssue = (roomId: string) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;
        setIssueRoom({ id: room.id, number: room.room_number });
        setIsIssueModalOpen(true);
    };

    const handleIssueSubmit = async (description: string, priority: string, category: string) => {
        if (!issueRoom) return;

        try {
            const { error } = await supabase.from('maintenance_tickets').insert({
                hotel_id: hotelCtx.hotelId,
                room_id: issueRoom.id,
                description: description,
                status: 'OPEN',
                priority: priority,
                category: category
            });

            if (error) throw error;
            showToast(`${issueRoom.number} nolu oda için [${category}] arıza kaydı oluşturuldu.`, 'success');
        } catch (err) {
            console.error(err);
            showToast("Arıza kaydı oluşturulurken bir hata oluştu.", 'error');
        }
    };

    const floors = Array.from(new Set(rooms.map(r => r.floor))).sort();

    return (
        <div className="max-w-7xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Oda Durumları</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {isLoadingRooms
                            ? "Odalar yükleniyor..."
                            : `${rooms.length} odadan ${filteredRooms.length} oda listeleniyor.`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm mr-2">
                        <button
                            onClick={() => setViewMode('TABLE')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'TABLE' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('KANBAN')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'KANBAN' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Kanban
                        </button>
                    </div>
                    <button
                        onClick={handleSmartAssign}
                        className="bg-white text-teal-600 border border-teal-200 px-6 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-teal-50 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Akıllı Ata
                    </button>
                    <button
                        onClick={() => handleAssignStaffClick()}
                        className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Toplu Görevlendir
                    </button>
                </div>
            </div>

            <HousekeepingKPIs rooms={rooms} />

            <StaffWorkloadPanel rooms={rooms} staffList={staffList} />

            <HousekeepingFilterBar
                filters={filters}
                onFilterChange={setFilters}
                staffList={staffList}
                floors={floors}
            />

            {isLoadingRooms ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent flex-shrink-0 rounded-full animate-spin"></div>
                    <span className="ml-4 font-semibold text-slate-500">Oda verileri yükleniyor...</span>
                </div>
            ) : (
                <HousekeepingBoard
                    rooms={filteredRooms}
                    viewMode={viewMode}
                    onStatusChange={handleStatusChange}
                    onActionClick={handleActionClick}
                    onAssignStaffClick={(id) => handleAssignStaffClick(id)}
                    onStartCleaning={handleStartCleaning}
                    onFinishCleaning={handleFinishCleaning}
                />
            )}

            <PerformancePanel rooms={rooms} staffList={staffList} />

            <StaffAssignmentModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                rooms={rooms}
                staffList={staffList}
                initialRoomId={assignRoomId}
                onAssign={handleAssign}
            />

            <MaintenanceIssueModal
                isOpen={isIssueModalOpen}
                onClose={() => setIsIssueModalOpen(false)}
                roomNumber={issueRoom?.number || ''}
                onSubmit={handleIssueSubmit}
            />

            {/* Toast Notification Overlay */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[320px] ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
                        toast.type === 'error' ? 'bg-rose-500 text-white border-rose-400' :
                            'bg-slate-800 text-white border-slate-700'
                        }`}>
                        {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                        {toast.type === 'info' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
