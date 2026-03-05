"use client";

import React, { useState, useMemo } from "react";
import { PremiumDatePicker } from "@/app/components/PremiumDatePicker";
import { format, addDays, eachDayOfInterval, isToday, parseISO, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { usePageHeader } from "@/app/components/AppShell";
import { useHotel } from "@/app/context/HotelContext";
import { useReservationManagement, CalendarReservation } from "@/hooks/useReservationManagement";
import { ReservationModal } from "@/app/components/reservations/ReservationModal";
import { useQueryClient } from "@tanstack/react-query";
import { ReservationDrawer } from "@/app/components/reservations/ReservationDrawer";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import { ACCENT_COLORS } from "@/constants/reservations";
import { DeleteConfirmationModal } from "./modal/DeleteConfirmationModal";

export default function BookingBoard() {
    usePageHeader("Booking Board (Takvim)", "Profesyonel zaman çizelgesi üzerinden rezervasyon yönetimi.");
    const { hotelId, hotelSlug } = useHotel();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [viewMode] = useState<"day" | "week" | "month">("month");
    const [viewDate, setViewDate] = useState(new Date());
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const gridRef = React.useRef<HTMLDivElement>(null);

    // Filters
    const [roomTypeFilter, setRoomTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roomSearch, setRoomSearch] = useState("");
    const [quickFilter, setQuickFilter] = useState<"none" | "arrivals" | "departures" | "cleaning">("none");

    const viewRange = useMemo(() => {
        const start = viewMode === "day" ? viewDate : (viewMode === "week" ? addDays(viewDate, -viewDate.getDay() + 1) : addDays(viewDate, -14));
        const end = addDays(start, viewMode === "week" ? 6 : 45); // Extended range for smoother scrolling
        return {
            start: format(start, "yyyy-MM-dd"),
            end: format(end, "yyyy-MM-dd"),
            days: eachDayOfInterval({ start, end })
        };
    }, [viewDate, viewMode]);

    const {
        today, selectedDate, setSelectedDate, reservations, reservationsLoading, modalOpen, editing,
        formTime, setFormTime, formDate, setFormDate, staffMembers, guestSearch, setGuestSearch, guestSearchResults,
        guestSearchLoading, selectedGuestId, setSelectedGuestId, duplicateGuest, form, setForm,
        guestMatchInfo, isNewGuest, conflictWarning, matchedGuestPreferences, matchedGuestPassport,
        openNew, openEdit, handleSubmit, handleDelete, handleUseDuplicate, closeModal, setEditing,
        todaySchedule, rooms,
        isUploading, handleFileUpload, roomBlocks,
        notification, handleExtend, handleMove,
        isCompact, setIsCompact,
        groupingMode, setGroupingMode,
        collapsedGroups, toggleGroup,
        queryClient
    } = useReservationManagement({
        reservations: [],
        hotelId: hotelId || "",
        slug: hotelSlug || "",
        endDate: viewRange.end
    });

    React.useEffect(() => {
        if (selectedDate !== viewRange.start) {
            setSelectedDate(viewRange.start);
        }
    }, [viewRange.start, selectedDate, setSelectedDate]);

    const timelineDays = viewRange.days;

    // Filter relevant and visible blocks
    const visibleBlocks = useMemo(() => {
        if (!timelineDays.length) return [];
        const start = startOfDay(timelineDays[0]);
        const end = endOfDay(timelineDays[timelineDays.length - 1]);
        return roomBlocks.filter((b: { check_in_at: string; check_out_at: string; room_id: string; reason: string; id: string; }) => {
            if (!b.check_in_at || !b.check_out_at) return false;
            const bStart = new Date(b.check_in_at);
            const bEnd = new Date(b.check_out_at);
            return (bStart <= end && bEnd >= start);
        });
    }, [roomBlocks, timelineDays]);

    React.useEffect(() => {
        const action = searchParams.get("action");
        if (action === "new" && !modalOpen && !reservationsLoading) {
            openNew(new Date().toISOString().split("T")[0], "14:00");
            router.replace(`/${hotelSlug}/reservation-management`);
        }
    }, [searchParams, modalOpen, reservationsLoading, router, hotelSlug, openNew]);

    const dayWidth = isCompact ? 100 : 160;
    const roomHeight = isCompact ? 48 : 72;
    const headerHeight = 64;

    const handlePrev = () => {
        const step = viewMode === "day" ? -7 : viewMode === "month" ? -30 : -7;
        setViewDate((d) => addDays(d, step));
    };

    const handleNext = () => {
        const step = viewMode === "day" ? 7 : viewMode === "month" ? 30 : 7;
        setViewDate((d) => addDays(d, step));
    };

    const handleToday = () => setViewDate(new Date());

    const arrivalsCount = useMemo(() => reservations.filter(r => format(parseISO(r.checkInDate!), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length, [reservations]);
    const departuresCount = useMemo(() => reservations.filter(r => format(parseISO(r.checkOutDate!), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).length, [reservations]);

    const roomTypes = useMemo(() => {
        const types = new Set<string>();
        rooms.forEach((r: { room_type?: { name?: string }[] }) => {
            const typeName = r.room_type?.[0]?.name;
            if (typeName) types.add(typeName);
        });
        return Array.from(types);
    }, [rooms]);

    // Filter relevant rooms
    const filteredRooms = useMemo(() => {
        return rooms.filter((r: { id: string; room_number: string; room_type?: { name?: string }[] }) => {
            if (roomTypeFilter !== "all" && r.room_type?.[0]?.name !== roomTypeFilter) return false;

            if (roomSearch) {
                const searchLower = roomSearch.toLowerCase();
                // Check room number
                const matchesRoomNumber = r.room_number.toLowerCase().includes(searchLower);

                // Check if any reservation in this room matches the search as an ID
                const matchesResId = reservations.some(res =>
                    res.roomId === r.id &&
                    ((res.reservationNumber && res.reservationNumber.toLowerCase().includes(searchLower)) ||
                        res.id.toLowerCase().includes(searchLower))
                );

                if (!matchesRoomNumber && !matchesResId) return false;
            }

            return true;
        });
    }, [rooms, roomTypeFilter, roomSearch, reservations]);

    const unassignedReservations = useMemo(() => {
        return reservations.filter(r => !r.roomId && r.dbStatus === 'confirmed');
    }, [reservations]);

    const visibleReservations = useMemo(() => {
        const start = startOfDay(timelineDays[0]);
        const end = endOfDay(timelineDays[timelineDays.length - 1]);

        return reservations.filter(r => {
            const rStart = parseISO(r.checkInDate!);
            const rEnd = parseISO(r.checkOutDate!);
            const isInView = (rStart <= end && rEnd >= start);
            if (!isInView) return false;

            if (statusFilter !== "all" && r.dbStatus !== statusFilter) return false;

            if (quickFilter === "arrivals") {
                return format(rStart, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            }
            if (quickFilter === "departures") {
                return format(rEnd, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            }

            return true;
        });
    }, [reservations, timelineDays, statusFilter, quickFilter]);

    // Grouped Rooms Logic
    const groupedRooms = useMemo(() => {
        if (groupingMode === 'none') return [{ id: 'all', name: '', rooms: filteredRooms }];

        const groups: Record<string, { id: string; name: string; rooms: typeof filteredRooms }> = {};

        filteredRooms.forEach(room => {
            let groupId = 'other';
            let groupName = 'Diğer';

            if (groupingMode === 'floor') {
                groupId = room.floor || 'no-floor';
                groupName = room.floor ? `${room.floor}. Kat` : 'Kat Belirtilmemiş';
            } else if (groupingMode === 'type') {
                groupId = room.room_type?.[0]?.name || 'no-type';
                groupName = room.room_type?.[0]?.name || 'Tip Belirtilmemiş';
            }

            if (!groups[groupId]) {
                groups[groupId] = { id: groupId, name: groupName, rooms: [] };
            }
            groups[groupId].rooms.push(room);
        });

        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredRooms, groupingMode]);

    const visibleRows = useMemo(() => {
        const rows: { type: 'header' | 'room', id: string, data?: any, groupName?: string }[] = [];
        groupedRooms.forEach(group => {
            if (group.name) {
                rows.push({ type: 'header', id: group.id, groupName: group.name, data: group });
            }
            if (!collapsedGroups.has(group.id)) {
                group.rooms.forEach(room => {
                    rows.push({ type: 'room', id: room.id, data: room });
                });
            }
        });
        return rows;
    }, [groupedRooms, collapsedGroups]);

    const todayPosition = useMemo(() => {
        const start = startOfDay(timelineDays[0]);
        const now = new Date();
        if (now < start || now > endOfDay(timelineDays[timelineDays.length - 1])) return null;

        const diffInMs = now.getTime() - start.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays * dayWidth;
    }, [timelineDays, dayWidth]);

    const todayStartSlotPosition = useMemo(() => {
        const start = startOfDay(timelineDays[0]);
        const todayAtMidnight = startOfDay(new Date());
        if (todayAtMidnight < start || todayAtMidnight > endOfDay(timelineDays[timelineDays.length - 1])) return null;

        const diffInMs = todayAtMidnight.getTime() - start.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays * dayWidth;
    }, [timelineDays, dayWidth]);

    // Initial Scroll to Today
    React.useEffect(() => {
        if (!reservationsLoading && gridRef.current && todayStartSlotPosition !== null) {
            const timer = setTimeout(() => {
                if (gridRef.current) {
                    gridRef.current.scrollLeft = todayStartSlotPosition;
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [reservationsLoading, todayStartSlotPosition]);

    // Handle deep-link to reservation via ?res=ID
    React.useEffect(() => {
        const resId = searchParams.get("res");
        if (resId && !reservationsLoading && reservations.length > 0) {
            const res = reservations.find(r => r.id === resId);
            if (res) {
                setSelectedReservation(res);
                setDrawerOpen(true);
            }
        }
    }, [searchParams, reservations, reservationsLoading]);
    const rowMap = useMemo(() => {
        const map = new Map<string, { top: number, index: number }>();
        let currentTop = 0;
        visibleRows.forEach((row, idx) => {
            if (row.type === 'room') {
                map.set(row.id, { top: currentTop, index: idx });
            }
            currentTop += row.type === 'header' ? 32 : roomHeight;
        });
        return map;
    }, [visibleRows, roomHeight]);

    const getStatusColor = (status: string, res?: CalendarReservation) => {
        const isCheckoutToday = res?.checkOutDate && format(parseISO(res.checkOutDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

        if (isCheckoutToday && status !== 'checked_out' && status !== 'cancelled') return "bg-orange-500 hover:bg-orange-600 border-orange-600";

        switch (status) {
            case "draft":
            case "planned": return "bg-slate-400 hover:bg-slate-500 border-slate-500";
            case "confirmed": return "bg-indigo-600 hover:bg-indigo-700 border-indigo-700";
            case "checked_in": return "bg-emerald-500 hover:bg-emerald-600 border-emerald-600";
            case "checked_out": return "bg-slate-400 hover:bg-slate-500 border-slate-500 opacity-60";
            case "cancelled": return "bg-rose-400 hover:bg-rose-500 border-rose-500 opacity-60";
            case "no_show": return "bg-rose-600 hover:bg-rose-700 border-rose-700";
            case "option": return "bg-slate-500 hover:bg-slate-600 border-slate-600";
            default: return "bg-indigo-600";
        }
    };

    const handleStatusChange = async (res: CalendarReservation, newStatus: string, note?: string) => {
        try {
            const { error, data } = await supabase.rpc('change_reservation_status', {
                p_reservation_id: res.id,
                p_new_status: newStatus,
                p_hotel_id: hotelId,
                p_note: note,
                p_expected_updated_at: res.updated_at
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.message);

            setDrawerOpen(false);
            // Invalidate query
            queryClient.invalidateQueries({ queryKey: ["reservations", selectedDate] });
        } catch (err: any) {
            alert("Durum güncellenemedi: " + err.message);
        }
    };

    if (reservationsLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Odalar ve Rezervasyonlar yükleniyor...</div>;

    return (
        <div className="flex flex-col bg-white lg:rounded-2xl border border-slate-200 shadow-sm max-w-[100vw] [--room-col-width:100px] md:[--room-col-width:256px]">
            {/* Professional PMS Header - Stacked Layout without Scroll */}
            <div className="flex flex-col border-b border-slate-200 bg-white flex-shrink-0 relative z-[60]">
                {/* Row 1 & 2: Navigation, Stats, and Key Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-2 md:px-4 md:py-3 gap-3 border-b border-slate-100">
                    {/* Navigation Group */}
                    <div className="flex flex-wrap items-center justify-between md:justify-start gap-4">
                        <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-sm shrink-0">
                            <button onClick={handlePrev} className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button
                                onClick={handleToday}
                                className="px-4 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-800 border-x border-slate-200/50 flex flex-col items-center justify-center leading-none min-w-[110px]"
                            >
                                {format(viewDate, "yyyy-MM") !== format(new Date(), "yyyy-MM") ? (
                                    <span className="text-[7px] text-indigo-500 mb-0.5 font-black">BUGÜNE GİT</span>
                                ) : (
                                    <span className="text-[7px] text-slate-400 mb-0.5 font-black opacity-0">GÜNCEL</span>
                                )}
                                {format(viewDate, "MMMM yyyy", { locale: tr })}
                            </button>
                            <button onClick={handleNext} className="p-1 px-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex flex-col items-center">
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Giriş</span>
                                <span className="text-xs font-black text-emerald-600 leading-none">{arrivalsCount}</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="flex flex-col items-center">
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Çıkış</span>
                                <span className="text-xs font-black text-rose-600 leading-none">{departuresCount}</span>
                            </div>
                        </div>

                        {/* Unassigned Panel Trigger */}
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${unassignedReservations.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <span className="text-[10px] font-black uppercase tracking-tight">{unassignedReservations.length} ATANMAMIŞ</span>
                            </div>
                            {unassignedReservations.length > 0 && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm(`${unassignedReservations.length} rezervasyon için otomatik oda ataması başlatılsın mı?`)) {
                                            try {
                                                const { data, error } = await supabase.rpc('bulk_auto_assign', {
                                                    p_hotel_id: hotelId,
                                                    p_date_from: viewRange.start + 'T00:00:00Z',
                                                    p_date_to: viewRange.end + 'T23:59:59Z'
                                                });
                                                if (error) throw error;
                                                alert(`${data.assigned_count} oda başarıyla atandı. ${data.failed_count} hata.`);
                                                queryClient.invalidateQueries({ queryKey: ["reservations"] });
                                            } catch (err: any) {
                                                alert("Hata: " + err.message);
                                            }
                                        }
                                    }}
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm transition-all active:scale-95"
                                >
                                    TOPLU ATA
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => openNew()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn w-full md:w-auto"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="text-xs">YENİ REZERVASYON</span>
                    </button>
                </div>

                {/* Row 3: Date, Search & Basic Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-2 md:px-4 md:py-2 bg-slate-50/50">
                    <div className="w-full">
                        <PremiumDatePicker
                            value={format(viewDate, "yyyy-MM-dd")}
                            onChange={(s) => setViewDate(new Date(s + "T12:00:00"))}
                            today={today}
                            compact
                        />
                    </div>

                    <div className="relative group w-full">
                        <input
                            type="text"
                            placeholder="ODA NO VEYA REZ ID ARA..."
                            value={roomSearch}
                            onChange={(e) => setRoomSearch(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 h-10 text-[10px] font-black uppercase tracking-wider text-slate-600 w-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                        <button onClick={() => setIsCompact(false)} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${!isCompact ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>Normal</button>
                        <button onClick={() => setIsCompact(true)} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${isCompact ? 'bg-indigo-50 text-indigo-700 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}>Kompakt</button>
                    </div>

                    <div className="flex gap-2">
                        <select value={groupingMode} onChange={(e) => setGroupingMode(e.target.value as any)} className="flex-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl px-3 h-10 shadow-sm outline-none cursor-pointer hover:border-indigo-500 transition-all text-center">
                            <option value="none">GRUP: YOK</option>
                            <option value="floor">KAT</option>
                            <option value="type">TİP</option>
                        </select>
                        <select value={roomTypeFilter} onChange={(e) => setRoomTypeFilter(e.target.value)} className="flex-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl px-3 h-10 shadow-sm outline-none cursor-pointer hover:border-indigo-500 transition-all text-center">
                            <option value="all">TÜM TİPLER</option>
                            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* Row 4: Status Quick Filters */}
                <div className="flex items-center justify-between p-2 md:px-4 md:py-2 border-t border-slate-100 bg-white">
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1 w-full sm:w-auto">
                        {[{ id: "all", label: "TÜMÜ" }, { id: "confirmed", label: "ONAYLI" }, { id: "checked_in", label: "GİRİŞ" }].map((s) => (
                            <button key={s.id} onClick={() => setStatusFilter(s.id as any)} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex-1 sm:flex-none ${statusFilter === s.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{s.label}</button>
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                        <button onClick={() => setQuickFilter(prev => prev === "arrivals" ? "none" : "arrivals")} className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${quickFilter === "arrivals" ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50"}`}>BUGÜN GELEN</button>
                        <button onClick={() => setQuickFilter(prev => prev === "departures" ? "none" : "departures")} className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${quickFilter === "departures" ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-100" : "bg-white border-slate-200 text-rose-600 hover:bg-rose-50"}`}>BUGÜN GİDEN</button>
                    </div>
                </div>
            </div>

            {/* PMS Board Grid Area */}
            <div
                ref={gridRef}
                className="flex-1 overflow-x-auto overflow-y-visible custom-scrollbar no-scrollbar bg-slate-50/30 relative"
                id="pms-grid-scroll"
            >
                <div className="flex flex-col min-w-max relative">
                    <div className="flex sticky top-0 z-40 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <div className="h-10 md:h-14 border-r border-b border-slate-200 bg-slate-50/90 backdrop-blur-md flex items-center px-3 md:px-4 sticky left-0 z-50 w-[var(--room-col-width)]">
                            <span className="text-[9px] md:text-[11px] font-black uppercase text-slate-500 tracking-wider">Odalar & Durum</span>
                        </div>

                        {/* Dates Header - Sticky Top */}
                        <div className="flex h-10 md:h-14 bg-white/90 backdrop-blur-md border-b border-slate-200">
                            {timelineDays.map((day, dIdx) => (
                                <div key={dIdx} style={{ width: dayWidth }} className={`border-r border-slate-100 flex flex-col items-center justify-center relative ${isToday(day) ? 'bg-indigo-50/30' : ''}`}>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isToday(day) ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {format(day, "EEEE", { locale: tr })}
                                    </span>
                                    <span className={`text-sm font-black ${isToday(day) ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {format(day, "d MMMM", { locale: tr })}
                                    </span>
                                    {isToday(day) && (
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Content */}
                    <div className="relative">
                        {visibleRows.map((row) => {
                            if (row.type === 'header') {
                                return (
                                    <div
                                        key={row.id}
                                        className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-4 sticky left-0 z-40 cursor-pointer hover:bg-slate-100 transition-colors"
                                        style={{ height: 32 }}
                                        onClick={() => toggleGroup(row.id)}
                                    >
                                        <span className={`transform transition-transform ${collapsedGroups.has(row.id) ? '-rotate-90' : ''}`}>
                                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="m19 9-7 7-7-7" /></svg>
                                        </span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.groupName}</span>
                                        <span className="text-[10px] font-bold text-slate-300">({(row.data as { rooms: any[] }).rooms.length} Oda)</span>
                                    </div>
                                );
                            }

                            const room = row.data as typeof rooms[0];
                            const roomStatus = (room.status || 'clean').toLowerCase() as 'clean' | 'dirty' | 'ooo';
                            const statusConfigMap: Record<'clean' | 'dirty' | 'ooo', { label: string, color: string, text: string, bg: string }> = {
                                clean: { label: 'Temiz', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                                dirty: { label: 'Kirli', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                                ooo: { label: 'OOO', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' }
                            };
                            const statusConfig = statusConfigMap[roomStatus] || statusConfigMap.clean;

                            return (
                                <div key={room.id} style={{ height: roomHeight }} className="flex group/row transition-colors">
                                    {/* Sticky Room Column Headers */}
                                    <div
                                        style={{ height: roomHeight }}
                                        className="w-[var(--room-col-width)] border-r border-b border-slate-100 bg-white sticky left-0 z-30 flex items-center px-2 md:px-4 hover:bg-slate-50 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]"
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex flex-col flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-black text-slate-800`}>#{room.room_number}</span>
                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tight border ${statusConfig.bg} ${statusConfig.text} border-current/20`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                {!isCompact && (
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none">{room.room_type?.[0]?.name || "STD"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day Cells */}
                                    {timelineDays.map((day, dIdx) => (
                                        <div
                                            key={dIdx}
                                            onClick={() => openNew(format(day, "yyyy-MM-dd"), "12:00", room.id, room.room_number)}
                                            style={{ width: dayWidth, height: roomHeight }}
                                            className={`border-r border-b border-slate-50 h-full transition-colors hover:bg-slate-100/40 cursor-cell relative ${isToday(day) ? 'bg-indigo-50/10' : 'bg-white'}`}
                                        >
                                            {/* Quarter lines */}
                                            {!isCompact && <div className="absolute inset-y-0 left-1/2 border-l border-slate-100/10 border-dashed"></div>}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                        {/* Reservations Overlay */}
                        <div className="absolute top-0 left-[var(--room-col-width)] pointer-events-none w-full h-full">
                            {/* Today Line Indicator */}
                            {todayPosition !== null && (
                                <div
                                    className="absolute top-0 bottom-0 z-20 pointer-events-none"
                                    style={{ left: todayPosition, width: 2 }}
                                >
                                    <div className="h-full w-px bg-red-400/50 border-l border-red-400/50 border-dashed"></div>
                                    <div className="absolute top-0 left-0 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50 hidden md:block"></div>
                                </div>
                            )}

                            {visibleReservations.map((res) => {
                                const rowInfo = rowMap.get(res.roomId!);
                                if (!rowInfo) return null;
                                const roomTop = rowInfo.top;

                                const checkIn = parseISO(res.checkInDate!);
                                const checkOut = parseISO(res.checkOutDate!);
                                const gridStart = startOfDay(timelineDays[0]);

                                const diffInDays = (checkIn.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24);
                                const durationInDays = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

                                const left = diffInDays * dayWidth;
                                const width = durationInDays * dayWidth;

                                const occupancyStr = `${res.adults_count || 2}A${res.children_count ? ` + ${res.children_count}C` : ''}`;

                                return (
                                    <div
                                        key={res.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedReservation(res);
                                            setDrawerOpen(true);
                                        }}
                                        className={`group/res absolute rounded-xl border-2 shadow-sm flex flex-col justify-between ${isCompact ? 'py-1 px-2' : 'py-2 px-3'} z-10 cursor-pointer pointer-events-auto transition-all hover:scale-[1.01] hover:shadow-xl hover:z-50 overflow-visible ${getStatusColor(res.dbStatus, res)} ${res.noShowCandidate ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-white/30'}`}
                                        style={{
                                            left: `${left + 4}px`,
                                            top: `${roomTop + (isCompact ? 4 : 6)}px`,
                                            width: `${width - 8}px`,
                                            height: `${roomHeight - (isCompact ? 8 : 12)}px`,
                                            minWidth: '40px',
                                            borderLeftWidth: '3px',
                                            borderLeftColor: res.noShowCandidate ? 'rgb(251 191 36)' : 'rgba(255,255,255,0.4)'
                                        }}
                                    >
                                        {/* Status Accent Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${ACCENT_COLORS[res.dbStatus] || 'bg-blue-400'}`}></div>

                                        {res.noShowCandidate && (
                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white ring-2 ring-white z-20 animate-bounce">
                                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                                            </div>
                                        )}

                                        <div className="flex flex-col h-full justify-between overflow-hidden relative pl-2">
                                            {/* Drag Handle - Visible on hover */}
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/res:opacity-100 transition-opacity text-white/40 pointer-events-none">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" /></svg>
                                            </div>

                                            <div className="flex items-start justify-between gap-1 overflow-hidden min-w-0">
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <span className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-black text-white truncate uppercase leading-tight`}>
                                                            {res.guestName}
                                                        </span>
                                                        {/* Status Chips */}
                                                        {res.noShowCandidate && width > 100 && (
                                                            <span className="flex-shrink-0 text-[7px] font-black bg-amber-400 text-amber-950 px-1 py-0.5 rounded uppercase tracking-tighter leading-none animate-pulse">NO-SHOW ADAY</span>
                                                        )}
                                                        {format(checkIn, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && width > 120 && !res.noShowCandidate && (
                                                            <span className="flex-shrink-0 text-[7px] font-black bg-emerald-500 text-white px-1 py-0.5 rounded uppercase tracking-tighter leading-none">CHECK-IN</span>
                                                        )}
                                                        {format(checkOut, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && width > 120 && (
                                                            <span className="flex-shrink-0 text-[7px] font-black bg-rose-500 text-white px-1 py-0.5 rounded uppercase tracking-tighter leading-none">CHECK-OUT</span>
                                                        )}
                                                    </div>
                                                    {!isCompact && width > 80 && (
                                                        <span className="text-[9px] font-bold text-white/90 whitespace-nowrap mt-0.5 truncate leading-tight">
                                                            {occupancyStr} • {res.boardType || 'BB'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between mt-0.5 min-h-[14px]">
                                                <div className="flex gap-1 items-center">
                                                    {res.payment_status === 'paid' ? (
                                                        <div className="w-3 h-3 flex-shrink-0 rounded-full bg-emerald-400 flex items-center justify-center shadow-sm" title="Paid">
                                                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                                        </div>
                                                    ) : (
                                                        <div className="w-3 h-3 flex-shrink-0 rounded-full bg-amber-400 flex items-center justify-center shadow-sm" title="Pending">
                                                            <span className="text-[7px] font-black text-amber-900 leading-none">!</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {!isCompact && width > 100 && (
                                                    <span className="text-[9px] font-black text-white/90 whitespace-nowrap leading-none mb-0.5">
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: res.currency || 'TRY', maximumFractionDigits: 0 }).format(res.total_amount || Number(res.estimatedAmount) || 0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hover Preview Tooltip */}
                                        <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 translate-y-full w-56 bg-slate-900 text-white p-3 rounded-xl shadow-2xl opacity-0 group-hover/res:opacity-100 pointer-events-none transition-all z-[100] scale-95 group-hover/res:scale-100 backdrop-blur-md bg-slate-900/95 border border-white/10">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest truncate">
                                                            {res.reservationNumber ? `${res.reservationNumber} • ` : ''}{res.dbStatus}
                                                        </span>
                                                        <span className="text-xs font-black truncate">{res.guestName}</span>
                                                    </div>
                                                    <span className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded font-black text-white/60 uppercase tracking-tighter">
                                                        {res.channel}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/40 uppercase">Giriş</span>
                                                        <span className="text-[10px] font-bold">{format(checkIn, "d MMM", { locale: tr })}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-white/40 uppercase">Çıkış</span>
                                                        <span className="text-[10px] font-bold">{format(checkOut, "d MMM", { locale: tr })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                                                    <span className="text-[8px] font-black text-white/40 uppercase">Bakiye</span>
                                                    <span className={`text-xs font-black ${res.payment_status === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: res.currency || 'TRY', maximumFractionDigits: 0 }).format(res.total_amount || Number(res.estimatedAmount) || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900/95"></div>
                                        </div>
                                    </div>
                                );
                            })}

                            {visibleBlocks.map((block) => {
                                const rowInfo = rowMap.get(block.room_id);
                                if (!rowInfo) return null;

                                const start = new Date(block.check_in_at);
                                const end = new Date(block.check_out_at);

                                const gridStart = startOfDay(timelineDays[0]);
                                const diffInDays = (start.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24);
                                const durationInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

                                const left = diffInDays * dayWidth;
                                const width = durationInDays * dayWidth;
                                const top = rowInfo.top;

                                const isMaintenance = ['maintenance', 'out_of_service', 'OOO'].includes(block.block_type || '');
                                const blockColorClass = isMaintenance ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-slate-500/10 border-slate-500/20 text-slate-600';

                                return (
                                    <div
                                        key={block.id}
                                        className={`absolute border-2 border-dashed rounded-xl z-0 flex flex-col items-center justify-center overflow-hidden pointer-events-none ${blockColorClass}`}
                                        style={{
                                            left: `${left + 2}px`,
                                            top: `${top + 4}px`,
                                            width: `${width - 4}px`,
                                            height: `${roomHeight - 8}px`,
                                        }}
                                    >
                                        <div className="flex flex-col items-center text-center px-4">
                                            {isMaintenance && (
                                                <svg className="w-3 h-3 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                {isMaintenance ? 'DEVRE DIŞI (OOO)' : 'MANUEL BLOK'}
                                            </span>
                                            <div className="mt-1 flex flex-col gap-0.5">
                                                <span className="text-[9px] font-extrabold uppercase opacity-60">{block.reason || (isMaintenance ? 'Bakım' : 'Blok')}</span>
                                                <span className="text-[8px] font-bold opacity-50">
                                                    {format(start, "d MMM")} - {format(end, "d MMM")}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(45deg, currentColor, currentColor 10px, transparent 10px, transparent 20px)` }}></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer Integration */}
            <ReservationDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                reservation={selectedReservation}
                onEdit={(res) => {
                    setDrawerOpen(false);
                    openEdit(res);
                }}
                onStatusChange={handleStatusChange}
                onExtend={handleExtend}
                onMove={handleMove}
                onDelete={(res) => {
                    setSelectedReservation(res);
                    setEditing(res);
                    setDeleteConfirmOpen(true);
                }}
            />

            {/* Modal Integration */}
            {
                modalOpen && (
                    <ReservationModal
                        isOpen={modalOpen}
                        onClose={closeModal}
                        editing={editing}
                        formDate={formDate}
                        setFormDate={setFormDate}
                        formTime={formTime}
                        setFormTime={setFormTime}
                        today={today}
                        todaySchedule={todaySchedule}
                        form={form}
                        setForm={setForm}
                        staffMembers={staffMembers}
                        guestSearch={guestSearch}
                        setGuestSearch={setGuestSearch}
                        guestSearchResults={guestSearchResults}
                        guestSearchLoading={guestSearchLoading}
                        selectedGuestId={selectedGuestId}
                        setSelectedGuestId={setSelectedGuestId}
                        duplicateGuest={duplicateGuest}
                        isNewGuest={isNewGuest}
                        guestMatchInfo={guestMatchInfo}
                        matchedGuestPreferences={matchedGuestPreferences}
                        matchedGuestPassport={matchedGuestPassport}
                        conflictWarning={conflictWarning}
                        handleSubmit={handleSubmit}
                        handleDelete={() => setDeleteConfirmOpen(true)}
                        handleUseDuplicate={handleUseDuplicate}
                        rooms={rooms}
                        isUploading={isUploading}
                        handleFileUpload={handleFileUpload}
                    />
                )
            }

            {/* Notification Toast */}
            {
                notification && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${notification.type === 'success'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-rose-600 border-rose-500 text-white'
                            }`}>
                            {notification.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            )}
                            <span className="text-sm font-black uppercase tracking-tight">{notification.message}</span>
                        </div>
                    </div>
                )
            }

            <DeleteConfirmationModal
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                itemName={editing?.guestName}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                #pms-grid-scroll { scroll-behavior: smooth; }
            `}</style>
        </div >
    );
}
