"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { format, parseISO, addDays } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { ReservationModal } from "@/app/components/reservations/ReservationModal";
import { ReservationDrawer } from "@/app/components/reservations/ReservationDrawer";
import { PremiumDatePicker } from "@/app/components/PremiumDatePicker";
import { useReservationManagement, CalendarReservation } from "@/hooks/useReservationManagement";
import { ACCENT_COLORS } from "@/constants/reservations";
import { ReservationStatus } from "@/types/database";
import { useDebounce } from "@/hooks/useDebounce";
import { Check, Copy, Trash2, Ban } from "lucide-react";
import { DeleteConfirmationModal } from "../modal/DeleteConfirmationModal";

type SortField = 'check_in_date' | 'check_out_date' | 'created_at' | 'estimated_amount';
type SortDirection = 'asc' | 'desc';

interface ExportRow {
    id: string;
    reservation_number: string | null;
    check_in_date: string;
    check_out_date: string;
    estimated_amount: number | null;
    currency: string | null;
    status: string;
    payment_status: string | null;
    no_show_candidate: boolean;
    guests: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
    rooms: { room_number: string; room_types: { name: string } | { name: string }[] | null } | { room_number: string; room_types: { name: string } | { name: string }[] | null }[] | null;
}

export default function ReservationsList() {
    const { hotelId, defaultCurrency, isAdmin } = useHotel();
    const queryClient = useQueryClient();

    // -- Pagination & Sorting --
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [sortBy, setSortBy] = useState<SortField>('check_in_date');
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    // -- Filters --
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce

    // New Filters
    const [quickFilter, setQuickFilter] = useState<string>("all_active");
    const [dateFilterType, setDateFilterType] = useState<string>("check_in_date");

    const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState<string>(format(addDays(new Date(), 365), "yyyy-MM-dd"));
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
    const [roomFilter, setRoomFilter] = useState<string>("all");


    // Bulk Actions
    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleBulkChangeStatus = async (newStatus: string) => {
        if (!newStatus || selectedRowIds.size === 0) return;
        if (!window.confirm(`Seçili ${selectedRowIds.size} kaydın durumunu '${newStatus}' olarak değiştirmek istediğinize emin misiniz?`)) return;
        try {
            const arr = Array.from(selectedRowIds);
            const { error } = await supabase.from('reservations').update({ status: newStatus }).in('id', arr);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
            setSelectedRowIds(new Set());
        } catch (err) {
            console.error("Bulk status change failed", err);
            alert("Durum güncellenirken bir hata oluştu.");
        }
    };

    const handleBulkAssignRoom = async (roomId: string) => {
        if (!roomId || selectedRowIds.size === 0) return;
        if (!window.confirm(`Seçili ${selectedRowIds.size} kayda bu odayı atamak/kaldırmak istediğinize emin misiniz?`)) return;
        try {
            const arr = Array.from(selectedRowIds);
            const updatePayload = roomId === 'unassign' ? { room_id: null } : { room_id: roomId };
            const { error } = await supabase.from('reservations').update(updatePayload).in('id', arr);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
            setSelectedRowIds(new Set());
        } catch (err) {
            console.error("Bulk room assign failed", err);
            alert("Oda atanırken bir hata oluştu.");
        }
    };

    // -- Drawer & Modal States --
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmType, setDeleteConfirmType] = useState<"cancel" | "hard">("cancel");
    const [hardDeleteStep, setHardDeleteStep] = useState(1);

    // Reuse existing hook for modal/actions
    const {
        today, modalOpen, editing,
        formTime, setFormTime, formDate, setFormDate, staffMembers, guestSearch, setGuestSearch, guestSearchResults,
        guestSearchLoading, selectedGuestId, setSelectedGuestId, duplicateGuest, form, setForm,
        guestMatchInfo, isNewGuest, conflictWarning, matchedGuestPreferences, matchedGuestPassport,
        openNew, openEdit, handleSubmit, handleUseDuplicate, closeModal,
        todaySchedule, rooms, isUploading, handleFileUpload,
        handleExtend, handleMove
    } = useReservationManagement({
        reservations: [],
        hotelId: hotelId || "",
        endDate: format(new Date(), "yyyy-MM-dd")
    });

    // 1. Fetch KPI Stats
    const { data: stats } = useQuery({
        queryKey: ["reservations_stats", hotelId],
        queryFn: async () => {
            if (!hotelId) return null;
            const todayStr = format(new Date(), "yyyy-MM-dd");

            // Today In
            const { count: inCount } = await supabase.from('reservations')
                .select('*', { count: 'exact', head: true })
                .eq('hotel_id', hotelId)
                .gte('check_in_date', `${todayStr}T00:00:00`)
                .lte('check_in_date', `${todayStr}T23:59:59`);

            // Today Out
            const { count: outCount } = await supabase.from('reservations')
                .select('*', { count: 'exact', head: true })
                .eq('hotel_id', hotelId)
                .gte('check_out_date', `${todayStr}T00:00:00`)
                .lte('check_out_date', `${todayStr}T23:59:59`);

            // Active Staying (checked_in)
            const { count: activeCount } = await supabase.from('reservations')
                .select('*', { count: 'exact', head: true })
                .eq('hotel_id', hotelId)
                .eq('status', 'checked_in');

            // Pending (confirmed but maybe arriving soon, or draft)
            const { count: pendingCount } = await supabase.from('reservations')
                .select('*', { count: 'exact', head: true })
                .eq('hotel_id', hotelId)
                .eq('status', 'confirmed');

            return {
                arrivals: inCount || 0,
                departures: outCount || 0,
                inHouse: activeCount || 0,
                pending: pendingCount || 0
            };
        },
        enabled: !!hotelId,
        refetchInterval: 30000 // refresh stats every 30s
    });

    // 2. Fetch Paginated Reservations List
    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ["reservations_list", hotelId, page, pageSize, sortBy, sortDir, debouncedSearchTerm, startDate, endDate, quickFilter, dateFilterType, roomTypeFilter, roomFilter],
        queryFn: async () => {
            if (!hotelId) return { reservations: [], totalCount: 0 };

            let query = supabase.from('reservations')
                .select(`
                    *,
                    guests!left(*),
                    rooms!left(room_number, room_types(name))
                `, { count: 'exact' })
                .eq('hotel_id', hotelId);

            // Quick Filters
            const todayStr = format(new Date(), "yyyy-MM-dd");
            if (quickFilter === 'all_active') {
                query = query.in('status', ['confirmed', 'checked_in'])
                    .gte('check_out_date', `${todayStr}T00:00:00`);
            } else if (quickFilter === 'arrivals_today') {
                query = query.in('status', ['confirmed', 'inquiry']).gte('check_in_date', `${todayStr}T00:00:00`).lte('check_in_date', `${todayStr}T23:59:59`);
            } else if (quickFilter === 'departures_today') {
                query = query.in('status', ['checked_in']).gte('check_out_date', `${todayStr}T00:00:00`).lte('check_out_date', `${todayStr}T23:59:59`);
            } else if (quickFilter === 'in_house') {
                query = query.eq('status', 'checked_in');
            } else if (quickFilter === 'future') {
                query = query.in('status', ['confirmed', 'inquiry']).gt('check_in_date', `${todayStr}T23:59:59`);
            } else if (quickFilter === 'cancelled') {
                query = query.eq('status', 'cancelled');
            } else if (quickFilter === 'no_show') {
                query = query.eq('status', 'no_show');
            }

            // Date Filters
            // For 'all_active', we follow the enterprise standard: check_out >= business_date
            // and we don't want to restrict by check_in_date >= today because that would exclude
            // guests who checked in yesterday but are still in-house.
            if (quickFilter !== 'all_active') {
                if (startDate) {
                    if (dateFilterType === 'check_in_date') query = query.gte('check_in_date', `${startDate}T00:00:00`);
                    else if (dateFilterType === 'check_out_date') query = query.gte('check_out_date', `${startDate}T00:00:00`);
                    else if (dateFilterType === 'created_at') query = query.gte('created_at', `${startDate}T00:00:00`);
                    else if (dateFilterType === 'stay_date') query = query.gte('check_out_date', `${startDate}T00:00:00`);
                }
                if (endDate) {
                    if (dateFilterType === 'check_in_date') query = query.lte('check_in_date', `${endDate}T23:59:59`);
                    else if (dateFilterType === 'check_out_date') query = query.lte('check_out_date', `${endDate}T23:59:59`);
                    else if (dateFilterType === 'created_at') query = query.lte('created_at', `${endDate}T23:59:59`);
                    else if (dateFilterType === 'stay_date') query = query.lte('check_in_date', `${endDate}T23:59:59`);
                }
            }

            if (roomFilter !== 'all') {
                query = query.eq('room_id', roomFilter);
            }


            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const safeSearch = `"%${searchLower.replace(/"/g, '""')}%"`;

                // Fetch perfectly matching guests from guests table
                const { data: matchedGuests } = await supabase
                    .from('guests')
                    .select('id')
                    .eq('hotel_id', hotelId)
                    .or(`full_name.ilike.${safeSearch},phone.ilike.${safeSearch}`)
                    .limit(50);

                const guestIds = matchedGuests?.map(g => g.id) || [];

                // Fetch perfectly matching rooms from rooms table
                const { data: matchedRooms } = await supabase
                    .from('rooms')
                    .select('id')
                    .eq('hotel_id', hotelId)
                    .ilike('room_number', safeSearch)
                    .limit(50);

                const roomIds = matchedRooms?.map(r => r.id) || [];

                const orQueries = [`reservation_number.ilike.${safeSearch}`];
                if (guestIds.length > 0) {
                    const idsStr = guestIds.map(id => `"${id}"`).join(',');
                    orQueries.push(`guest_id.in.(${idsStr})`);
                }
                if (roomIds.length > 0) {
                    const idsStr = roomIds.map(id => `"${id}"`).join(',');
                    orQueries.push(`room_id.in.(${idsStr})`);
                }

                query = query.or(orQueries.join(','));
            }

            // Sorting
            query = query.order(sortBy, { ascending: sortDir === 'asc', nullsFirst: false });

            // Pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to);

            const { data, count, error } = await query;
            if (error) {
                console.error("Error fetching list:", error);
                throw error;
            }

            const adapted: CalendarReservation[] = (data || []).map(r => ({
                id: r.id,
                date: format(parseISO(r.check_in_date), "yyyy-MM-dd"),
                startHour: new Date(r.check_in_date).getHours(),
                startMinute: new Date(r.check_in_date).getMinutes(),
                durationMinutes: 60,
                guestName: r.guests?.full_name || 'Bilinmeyen Misafir',
                phone: r.guests?.phone || '',
                email: r.guests?.email || '',
                assignedStaff: '',
                assignedStaffId: r.assigned_staff_id,
                channel: r.channel,
                boardType: r.board_type,
                status: r.status as ReservationStatus,
                dbStatus: r.status as ReservationStatus,
                guestNote: r.guest_note,
                internalNote: r.internal_note,
                roomNumber: r.rooms?.room_number || '',
                reservationNumber: r.reservation_number,
                guestPreferences: r.guests?.preferences_note,
                guestPassport: r.guests?.passport_number,
                estimatedAmount: r.estimated_amount,
                roomId: r.room_id,
                checkInDate: r.check_in_date,
                checkOutDate: r.check_out_date,
                guestId: r.guest_id,
                adults_count: r.adults_count,
                children_count: r.children_count,
                payment_status: r.payment_status,
                total_amount: r.estimated_amount,
                currency: r.currency || defaultCurrency,
                identityPhotoUrl: r.guests?.identity_photo_url,
                roomTypeName: r.rooms?.room_types?.name,
                noShowCandidate: r.no_show_candidate
            }));

            let finalData = adapted;
            const finalCount = count || 0;

            if (roomTypeFilter !== 'all') {
                finalData = finalData.filter((r: CalendarReservation & { roomTypeName?: string }) => r.roomTypeName === roomTypeFilter);
            }

            return { reservations: finalData, totalCount: finalCount };
        },
        enabled: !!hotelId,
        placeholderData: keepPreviousData
    });

    const roomTypes = useMemo(() => {
        const types = new Set<string>();
        rooms.forEach((r: { room_type?: { name?: string }[] }) => {
            const typeName = r.room_type?.[0]?.name;
            if (typeName) types.add(typeName);
        });
        return Array.from(types);
    }, [rooms]);

    // Formatters
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency || "TRY", maximumFractionDigits: 0 }).format(amount || 0);
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200", // Green
            inquiry: "bg-orange-100 text-orange-800 border-orange-200", // Orange
            checked_in: "bg-blue-100 text-blue-800 border-blue-200", // Blue
            checked_out: "bg-indigo-100 text-indigo-800 border-indigo-200", // Indigo
            cancelled: "bg-gray-100 text-gray-800 border-gray-200", // Gray
            no_show: "bg-red-100 text-red-800 border-red-200", // Red
            draft: "bg-slate-100 text-slate-800 border-slate-200"
        };
        const texts = {
            confirmed: "Onaylandı", inquiry: "Beklemede", checked_in: "Konaklıyor", checked_out: "Çıkış Yaptı",
            cancelled: "İptal Edildi", no_show: "No Show", draft: "Taslak"
        };
        const c = colors[status as keyof typeof colors] || "bg-indigo-100 text-indigo-800 border-indigo-200";
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${c}`}>{texts[status as keyof typeof texts] || status}</span>;
    };

    const toggleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortBy !== field) return <svg className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
        return sortDir === 'asc' ? (
            <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
        ) : (
            <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
        );
    };



    const handleNewReservation = () => {
        if (startDate) {
            setFormDate(startDate);
        }
        openNew();
    };

    const handleExportCSV = async () => {
        try {
            if (!hotelId) return;

            const todayStr = format(new Date(), "yyyy-MM-dd");

            // Simple query without pagination limit to get full filtered list
            let query = supabase.from('reservations')
                .select(`
                    id, reservation_number, check_in_date, check_out_date, estimated_amount, currency, status, payment_status, no_show_candidate,
                    guests!left(full_name, phone),
                    rooms!left(room_number, room_types(name))
                `)
                .eq('hotel_id', hotelId);

            if (quickFilter !== 'all_active') {
                if (quickFilter === 'arrivals_today') {
                    query = query.in('status', ['confirmed', 'inquiry']).gte('check_in_date', `${todayStr}T00:00:00`).lte('check_in_date', `${todayStr}T23:59:59`);
                } else if (quickFilter === 'departures_today') {
                    query = query.in('status', ['checked_in']).gte('check_out_date', `${todayStr}T00:00:00`).lte('check_out_date', `${todayStr}T23:59:59`);
                } else if (quickFilter === 'in_house') {
                    query = query.eq('status', 'checked_in');
                } else if (quickFilter === 'future') {
                    query = query.in('status', ['confirmed', 'inquiry']).gt('check_in_date', `${todayStr}T23:59:59`);
                } else if (quickFilter === 'cancelled') {
                    query = query.eq('status', 'cancelled');
                } else if (quickFilter === 'no_show') {
                    query = query.eq('status', 'no_show');
                }
            } else {
                query = query.in('status', ['confirmed', 'inquiry', 'checked_in']);
            }

            if (startDate) {
                if (dateFilterType === 'check_in_date') query = query.gte('check_in_date', `${startDate}T00:00:00`);
                else if (dateFilterType === 'check_out_date') query = query.gte('check_out_date', `${startDate}T00:00:00`);
                else if (dateFilterType === 'created_at') query = query.gte('created_at', `${startDate}T00:00:00`);
            }
            if (endDate) {
                if (dateFilterType === 'check_in_date') query = query.lte('check_in_date', `${endDate}T23:59:59`);
                else if (dateFilterType === 'check_out_date') query = query.lte('check_out_date', `${endDate}T23:59:59`);
                else if (dateFilterType === 'created_at') query = query.lte('created_at', `${endDate}T23:59:59`);
            }

            if (roomFilter !== 'all') query = query.eq('room_id', roomFilter);

            const { data, error } = await query;
            if (error) throw error;

            let finalExport = (data || []) as unknown as ExportRow[];

            // Further client side filtering for guest ID if debouncedSearchTerm exists
            if (debouncedSearchTerm) {
                const nameFilteredData = finalExport.filter((r) => {
                    const guest = Array.isArray(r.guests) ? r.guests[0] : r.guests;
                    return (guest?.full_name?.toLowerCase() || "").includes(debouncedSearchTerm.toLowerCase()) ||
                        (guest?.phone || "").includes(debouncedSearchTerm) ||
                        (r.reservation_number || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                        (r.id || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase());
                });
                finalExport = nameFilteredData;
            }
            if (roomTypeFilter !== 'all') {
                finalExport = finalExport.filter((r) => {
                    const room = Array.isArray(r.rooms) ? r.rooms[0] : r.rooms;
                    const roomType = Array.isArray(room?.room_types) ? room?.room_types[0] : room?.room_types;
                    return roomType?.name === roomTypeFilter;
                });
            }

            // Generate CSV
            const headers = ["Rez Kodu", "Misafir", "Telefon", "Oda No", "Oda Tipi", "Giriş", "Çıkış", "Gece", "Durum", "Tutar", "Döviz", "Ödeme Durumu", "No-Show Adayı"];
            const csvRows = [
                headers.join(","),
                ...finalExport.map((row) => {
                    const guest = Array.isArray(row.guests) ? row.guests[0] : row.guests;
                    const room = Array.isArray(row.rooms) ? row.rooms[0] : row.rooms;
                    const roomType = Array.isArray(room?.room_types) ? room?.room_types[0] : room?.room_types;

                    const cin = parseISO(row.check_in_date || new Date().toISOString());
                    const cout = parseISO(row.check_out_date || new Date().toISOString());
                    const nights = Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)));
                    return [
                        row.reservation_number || `#${row.id.substring(0, 8)}`,
                        `"${guest?.full_name || 'Bilinmeyen'}"`,
                        `"${guest?.phone || ''}"`,
                        room?.room_number || 'Atanmadı',
                        roomType?.name || 'Belirtilmedi',
                        format(cin, "yyyy-MM-dd"),
                        format(cout, "yyyy-MM-dd"),
                        nights,
                        row.status,
                        row.estimated_amount || 0,
                        row.currency || defaultCurrency || 'TRY',
                        row.payment_status || 'bekliyor',
                        row.no_show_candidate ? 'Evet' : 'Hayır'
                    ].join(",");
                })
            ];

            const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM for excel UTF-8
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reservations_export_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Dışa aktarma başarısız:", err);
            alert("Dışa aktarma sırasında bir hata oluştu.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Operations Bar */}
            <div className="bg-slate-900 rounded-xl px-5 py-3 shadow-md flex flex-wrap items-center justify-between text-slate-100 gap-4">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">İŞLEM TARİHİ:</span>
                    <span className="text-sm font-black text-white">{format(new Date(), "dd MMM yyyy", { locale: tr })}</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                        setQuickFilter('arrivals_today');
                        setDateFilterType('check_in_date');
                        setStartDate(format(new Date(), "yyyy-MM-dd"));
                        setEndDate(format(new Date(), "yyyy-MM-dd"));
                        setPage(1);
                    }}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">GİRİŞLER</span>
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md text-sm">{stats?.arrivals || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                        setQuickFilter('departures_today');
                        setDateFilterType('check_out_date');
                        setStartDate(format(new Date(), "yyyy-MM-dd"));
                        setEndDate(format(new Date(), "yyyy-MM-dd"));
                        setPage(1);
                    }}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 group-hover:text-rose-300 transition-colors">ÇIKIŞLAR</span>
                        <span className="bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md text-sm">{stats?.departures || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                        setQuickFilter('in_house');
                        setDateFilterType('stay_date');
                        setStartDate(format(new Date(), "yyyy-MM-dd"));
                        setEndDate(format(new Date(), "yyyy-MM-dd"));
                        setPage(1);
                    }}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 group-hover:text-blue-300 transition-colors">KONAKLAYANLAR</span>
                        <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-md text-sm">{stats?.inHouse || 0}</span>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                        setQuickFilter('all_active');
                        setDateFilterType('check_in_date');
                        setStartDate(format(new Date(), "yyyy-MM-dd"));
                        setEndDate(format(addDays(new Date(), 365), "yyyy-MM-dd"));
                        setPage(1);
                    }}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">BEKLEYENLER</span>
                        <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-md text-sm">{stats?.pending || 0}</span>
                    </div>
                </div>
            </div>

            {/* List & Filter Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header & Quick Filters */}
                <div className="p-4 md:px-6 md:py-4 border-b border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                REZERVASYONLAR
                            </h2>
                            {selectedRowIds.size > 0 && (
                                <div className="hidden lg:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                    <span className="text-xs font-bold text-indigo-700">{selectedRowIds.size} Seçili</span>
                                    <div className="h-4 w-px bg-indigo-200 mx-1"></div>
                                    <select
                                        className="text-[10px] bg-transparent font-black text-indigo-600 uppercase hover:text-indigo-800 tracking-wider px-2 outline-none cursor-pointer appearance-none"
                                        onChange={(e) => { handleBulkAssignRoom(e.target.value); e.target.value = ''; }}
                                        value=""
                                    >
                                        <option value="" disabled>Oda Ata</option>
                                        <option value="unassign">Odayı Kaldır</option>
                                        {rooms.map((room: { id: string, room_number: string }) => (
                                            <option key={room.id} value={room.id}>{room.room_number}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="text-[10px] bg-transparent font-black text-indigo-600 uppercase hover:text-indigo-800 tracking-wider px-2 border-l border-indigo-200 outline-none cursor-pointer appearance-none"
                                        onChange={(e) => { handleBulkChangeStatus(e.target.value); e.target.value = ''; }}
                                        value=""
                                    >
                                        <option value="" disabled>Durum Değiştir</option>
                                        <option value="confirmed">Onaylandı</option>
                                        <option value="checked_in">İçeride</option>
                                        <option value="checked_out">Çıkış Yaptı</option>
                                        <option value="cancelled">İptal</option>
                                        <option value="no_show">No Show</option>
                                    </select>
                                    <button onClick={handleExportCSV} className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-800 tracking-wider px-2 border-l border-indigo-200">CSV İndir</button>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNewReservation}
                                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-4 md:px-5 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                <span className="truncate">YENİ REZERVASYON</span>
                            </button>
                        </div>
                    </div>

                    {/* Quick Filters Chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'all_active', label: 'Tüm Aktifler' },
                            { id: 'arrivals_today', label: 'Bugün Gelecekler' },
                            { id: 'departures_today', label: 'Bugün Çıkacaklar' },
                            { id: 'in_house', label: 'Konaklayanlar' },
                            { id: 'future', label: 'Gelecek Rezervasyonlar' },
                            { id: 'cancelled', label: 'İptal Edildi' },
                            { id: 'no_show', label: 'No Show' }
                        ].map(qf => (
                            <button
                                key={qf.id}
                                onClick={() => {
                                    const todayStr = format(new Date(), "yyyy-MM-dd");
                                    const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
                                    const nextYearStr = format(addDays(new Date(), 365), "yyyy-MM-dd");

                                    setQuickFilter(qf.id);
                                    if (qf.id === 'arrivals_today') {
                                        setDateFilterType('check_in_date');
                                        setStartDate(todayStr); setEndDate(todayStr);
                                    } else if (qf.id === 'departures_today') {
                                        setDateFilterType('check_out_date');
                                        setStartDate(todayStr); setEndDate(todayStr);
                                    } else if (qf.id === 'in_house') {
                                        setDateFilterType('stay_date');
                                        setStartDate(todayStr); setEndDate(todayStr);
                                    } else if (qf.id === 'future') {
                                        setDateFilterType('check_in_date');
                                        setStartDate(tomorrowStr); setEndDate(nextYearStr);
                                    } else if (qf.id === 'all_active') {
                                        setDateFilterType('check_in_date');
                                        setStartDate(todayStr); setEndDate(nextYearStr);
                                    }
                                    setPage(1);
                                }}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors ${quickFilter === qf.id
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {qf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="p-4 md:px-6 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1 lg:max-w-md">
                        <input
                            type="text"
                            placeholder="Misafir adı, rezervasyon kodu, telefon veya oda..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 h-12 lg:h-11 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-1 gap-3">
                        <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm h-12 lg:h-11">
                            <select
                                value={dateFilterType}
                                onChange={(e) => { setDateFilterType(e.target.value); setPage(1); }}
                                className="bg-transparent rounded-l-xl border-r border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider px-3 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="check_in_date">Giriş Tarihi</option>
                                <option value="check_out_date">Çıkış Tarihi</option>
                                <option value="stay_date">Konaklama Tarihi</option>
                                <option value="created_at">Oluşturulma Tarihi</option>
                            </select>
                            <div className="flex-1 w-28">
                                <PremiumDatePicker
                                    value={startDate}
                                    onChange={(v) => { setStartDate(v); setPage(1); }}
                                    compact
                                    placeholder="Başlangıç"
                                    align="left"
                                    className="w-full h-full [&>button]:h-full [&>button]:rounded-none [&>button]:border-transparent [&>button]:shadow-none"
                                />
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div className="flex-1 w-28">
                                <PremiumDatePicker
                                    value={endDate}
                                    onChange={(v) => { setEndDate(v); setPage(1); }}
                                    compact
                                    placeholder="Bitiş"
                                    align="right"
                                    className="w-full h-full [&>button]:h-full [&>button]:rounded-none [&>button]:rounded-r-xl [&>button]:border-transparent [&>button]:shadow-none"
                                />
                            </div>
                        </div>

                        <select
                            value={roomTypeFilter}
                            onChange={(e) => { setRoomTypeFilter(e.target.value); setPage(1); }}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-xl px-3 h-12 lg:h-11 shadow-sm outline-none cursor-pointer hover:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="all">TÜM ODA TİPLERİ</option>
                            {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <select
                            value={roomFilter}
                            onChange={(e) => { setRoomFilter(e.target.value); setPage(1); }}
                            className="flex-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-xl px-3 h-12 lg:h-11 shadow-sm outline-none cursor-pointer hover:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="all">TÜM ODALAR</option>
                            {rooms.map((r: { id: string, room_number: string }) => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                        </select>

                        {(searchTerm || quickFilter !== 'all_active' || roomTypeFilter !== 'all' || roomFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setStartDate(format(new Date(), "yyyy-MM-dd"));
                                    setEndDate(format(addDays(new Date(), 365), "yyyy-MM-dd"));
                                    setQuickFilter("all_active");
                                    setRoomTypeFilter("all");
                                    setRoomFilter("all");
                                    setPage(1);
                                }}
                                className="flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 border border-transparent hover:border-rose-200 h-12 lg:h-11 px-4 lg:px-4 rounded-xl transition-all shrink-0 font-bold text-[10px] uppercase tracking-wider group"
                                title="Filtreleri Sıfırla"
                            >
                                <span className="mr-1.5 whitespace-nowrap">FİLTRELERİ SIFIRLA</span>
                                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200">
                                <th className="px-5 py-4 w-12 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        onChange={(e) => {
                                            const resList = listData?.reservations || [];
                                            if (e.target.checked) {
                                                setSelectedRowIds(new Set(resList.map((r) => r.id)));
                                            } else {
                                                setSelectedRowIds(new Set());
                                            }
                                        }}
                                        checked={(listData?.reservations?.length ?? 0) > 0 && selectedRowIds.size === (listData?.reservations?.length ?? 0)}
                                    />
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => toggleSort('created_at')}>
                                    <div className="flex items-center gap-1">REZ KODU <SortIcon field="created_at" /></div>
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    MİSAFİR
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    ODA
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => toggleSort('check_in_date')}>
                                    <div className="flex items-center gap-1">GİRİŞ <SortIcon field="check_in_date" /></div>
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => toggleSort('check_out_date')}>
                                    <div className="flex items-center gap-1">ÇIKIŞ <SortIcon field="check_out_date" /></div>
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    GECE
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    DURUM
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer group hover:bg-slate-50 transition-colors" onClick={() => toggleSort('estimated_amount')}>
                                    <div className="flex items-center gap-1">TUTAR <SortIcon field="estimated_amount" /></div>
                                </th>
                                <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                                    AKSİYON
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {listLoading ? (
                                <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                                        <svg className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <p className="text-xs font-bold uppercase">Veriler Yükleniyor...</p>
                                    </td>
                                </tr>
                            ) : listData?.reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center text-slate-400">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600 mb-1">Rezervasyon Bulunamadı</p>
                                        <p className="text-xs text-slate-500">Kriterlerinize uygun rezervasyon eşleşmedi.</p>
                                    </td>
                                </tr>
                            ) : (
                                listData?.reservations.map((r: CalendarReservation & { roomTypeName?: string }) => {
                                    const cIn = parseISO(r.checkInDate || new Date().toISOString());
                                    const cOut = parseISO(r.checkOutDate || new Date().toISOString());
                                    const isStaying = r.dbStatus === 'checked_in';
                                    const nightCount = Math.max(1, Math.round((cOut.getTime() - cIn.getTime()) / (1000 * 60 * 60 * 24)));

                                    return (
                                        <tr key={r.id}
                                            onClick={() => { setSelectedReservation(r); setDrawerOpen(true); }}
                                            className={`hover:bg-indigo-50/40 transition-colors cursor-pointer group ${selectedRowIds.has(r.id) ? 'bg-indigo-50/60' : ''}`}
                                        >
                                            <td className="px-5 py-4 align-middle relative text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    checked={selectedRowIds.has(r.id)}
                                                    onChange={(e) => {
                                                        const next = new Set(selectedRowIds);
                                                        if (e.target.checked) next.add(r.id);
                                                        else next.delete(r.id);
                                                        setSelectedRowIds(next);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-5 py-4 align-middle relative">
                                                <div className="flex items-center gap-2">
                                                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${ACCENT_COLORS[r.dbStatus as string] || 'bg-slate-300'}`}></div>
                                                    <div className="flex items-center gap-2 group/copy">
                                                        <code className="text-[11px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover/copy:border-teal-200 group-hover/copy:text-teal-600 transition-colors">
                                                            {r.reservationNumber || r.id.slice(0, 8).toUpperCase()}
                                                        </code>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(r.reservationNumber || r.id);
                                                                setCopiedId(r.id);
                                                                setTimeout(() => setCopiedId(null), 2000);
                                                            }}
                                                            className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-all opacity-0 group-hover/copy:opacity-100"
                                                        >
                                                            {copiedId === r.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-800 tracking-tight">{r.guestName}</span>
                                                        {r.noShowCandidate && r.checkInDate && (() => {
                                                            const checkInTime = new Date(r.checkInDate).getTime();
                                                            const delay = Math.floor((new Date().getTime() - checkInTime) / 60000);
                                                            let colorClass = "bg-amber-100 text-amber-700";
                                                            if (delay >= 240) colorClass = "bg-rose-100 text-rose-700 font-black border border-rose-200 animate-pulse";
                                                            else if (delay >= 120) colorClass = "bg-orange-100 text-orange-700 font-black border border-orange-200";
                                                            return (
                                                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${colorClass}`}>
                                                                    NO-SHOW ADAYI
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                {r.roomNumber ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-black flex items-center justify-center text-xs">
                                                            {r.roomNumber}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{r.roomTypeName || 'STD'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">Atanmadı</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${isStaying ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                        {format(cIn, "dd MMM yyyy", { locale: tr })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">
                                                        {format(cOut, "dd MMM yyyy", { locale: tr })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">{nightCount}</span>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                {getStatusBadge(r.dbStatus)}
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <p className="text-sm font-black text-slate-800">{formatCurrency(Number(r.estimatedAmount) || 0, r.currency || defaultCurrency)}</p>
                                                {r.payment_status === 'paid' && (
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-emerald-100">ÖDENDİ</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedReservation(r); setDrawerOpen(true); }}
                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                                                        title="Görüntüle"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center"
                                                        title="Düzenle"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            setSelectedReservation(r);
                                                            setDeleteConfirmType("cancel");
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center"
                                                        title="İptal Et"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                setSelectedReservation(r);
                                                                setDeleteConfirmType("hard");
                                                                setHardDeleteStep(1);
                                                                setDeleteConfirmOpen(true);
                                                            }}
                                                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-800 hover:bg-red-50 transition-colors flex items-center justify-center"
                                                            title="Kalıcı Sil (Admin)"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg px-2 h-8 outline-none cursor-pointer hover:border-indigo-500 transition-all"
                        >
                            <option value={25}>25 SATIR</option>
                            <option value={50}>50 SATIR</option>
                            <option value={100}>100 SATIR</option>
                        </select>
                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                            TOPLAM: <span className="text-slate-800">{listData?.totalCount || 0}</span> KAYIT
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="px-3 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-black text-slate-800 min-w-[2rem]">
                            {page}
                        </div>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!listData || listData.reservations.length < pageSize}
                            className="px-3 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:pointer-events-none transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            <ReservationDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                reservation={selectedReservation}
                onEdit={(res) => {
                    setDrawerOpen(false);
                    openEdit(res);
                }}
                onStatusChange={async (res, newStatus, note) => {
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

                        queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
                        setDrawerOpen(false);
                    } catch (err: unknown) {
                        alert("Durum güncellenemedi: " + (err as Error).message);
                    }
                }}
                onExtend={handleExtend}
                onMove={handleMove}
                onCancel={(res) => {
                    setSelectedReservation(res);
                    setDeleteConfirmType("cancel");
                    setDeleteConfirmOpen(true);
                }}
            />

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
                        handleSubmit={async (e) => {
                            await handleSubmit(e);
                            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
                            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
                        }}
                        handleCancel={() => {
                            setDeleteConfirmType("cancel");
                            setDeleteConfirmOpen(true);
                        }}
                        handleUseDuplicate={handleUseDuplicate}
                        rooms={rooms}
                        isUploading={isUploading}
                        handleFileUpload={handleFileUpload}
                    />
                )
            }
            <DeleteConfirmationModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setHardDeleteStep(1);
                }}
                title={deleteConfirmType === "cancel" ? "Rezervasyonu İptal Et" : (hardDeleteStep === 1 ? "DİKKAT: Rezervasyonu Kalıcı Sil" : "SON ONAY: Kalıcı Siliniyor")}
                description={
                    deleteConfirmType === "cancel"
                        ? "Bu rezervasyonu iptal etmek istediğinize emin misiniz? Folyolar ve geçmiş kayıtlar korunacaktır."
                        : (hardDeleteStep === 1
                            ? "DİKKAT! Bu işlem rezervasyonu ve ona ait TÜM harcamaları, ödemeleri ve geçmişi kalıcı olarak siler. Bu işlem GERİ ALINAMAZ."
                            : "Bu rezervasyonu ve ilişkili tüm finansal kayıtları veritabanından tamamen silmek istediğinizden EMİN MİSİNİZ? Bu işlem büyük bir risk taşır.")
                }
                confirmText={
                    deleteConfirmType === "cancel"
                        ? "Evet, İptal Et"
                        : (hardDeleteStep === 1 ? "Anlıyorum, Devam Et" : "EVET, KALICI OLARAK SİL")
                }
                onConfirm={async () => {
                    const target = selectedReservation || editing;
                    if (!target?.id) return;

                    if (deleteConfirmType === "cancel") {
                        // cancellation logic
                        try {
                            const { error, data } = await supabase.rpc('change_reservation_status', {
                                p_reservation_id: target.id,
                                p_new_status: 'cancelled',
                                p_hotel_id: hotelId,
                                p_note: 'Silme yerine iptal işlemi (UI List)'
                            });
                            if (error) throw error;
                            if (data && !data.success) throw new Error(data.message);
                            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
                            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
                            setDeleteConfirmOpen(false);
                        } catch (err: unknown) {
                            alert("İptal hatası: " + (err instanceof Error ? err.message : String(err)));
                        }
                    } else {
                        // hard delete with double confirmation
                        if (hardDeleteStep === 1) {
                            setHardDeleteStep(2);
                            // effectively stay in modal but update UI
                        } else {
                            const { error } = await supabase.from("reservations").delete().eq("id", target.id);
                            if (error) {
                                alert("Silme hatası: " + error.message);
                            } else {
                                queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
                                queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
                                queryClient.invalidateQueries({ queryKey: ["reservations"] });
                                closeModal();
                                setDrawerOpen(false);
                                setDeleteConfirmOpen(false);
                                setHardDeleteStep(1);
                            }
                        }
                    }
                }}
                itemName={selectedReservation?.guestName || ""}
                autoClose={false}
            />
        </div>
    );
}
