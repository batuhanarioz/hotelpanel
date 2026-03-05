import { useState, useMemo } from "react";
import { ReservationStatus, UserRole } from "@/types/database";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
    getHotelSettings,
    getTaskConfigs,
    getFoliosForReservations,
    getReservationsForDate,
    getStaff,
    getRooms,
    getHousekeepingTasks,
    getFinanceSummary,
    getOperationalTasks,
    createOperationalTask,
    updateOperationalTask,
    deleteOperationalTask
} from "@/lib/api";
import { CalendarReservation } from "@/hooks/useReservationManagement";
import { supabase } from "@/lib/supabaseClient";
import { localDateStr } from "@/lib/dateUtils";
import { useHotel } from "@/app/context/HotelContext";

export type DashboardReservation = {
    id: string;
    startsAt: string;
    endsAt: string;
    guestName: string;
    guestPhone: string | null;
    staffName: string;
    staffId: string | null;
    channel: string;
    status: ReservationStatus;
    boardType: string | null;
    estimatedAmount: number | null;
    internalNote?: string;
    roomNumber?: string;
    adultsCount?: number;
    childrenCount?: number;
    noShowCandidate?: boolean;
    noShowCandidateAt?: string;
    reservationNumber?: string;
    updated_at?: string;
};

export type StaffOption = {
    id: string;
    full_name: string;
};

export type ControlItemType = "status" | "approval" | "doctor" | "payment" | "manual";
export type ControlItemTone = "critical" | "high" | "medium" | "low";

export type ControlItem = {
    id: string;
    type: ControlItemType;
    tone: ControlItemTone;
    toneLabel: string;
    reservationId?: string;
    guestName: string;
    timeLabel: string;
    treatmentLabel: string;
    actionLabel: string;
    sortTime: number;
    completed?: boolean;
};

function formatTime(dateString: string) {
    const d = new Date(dateString);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
}

export function useDashboard() {
    const queryClient = useQueryClient();
    const hotel = useHotel();
    const baseToday = useMemo(() => localDateStr(), []);
    const [viewOffsetReservations, setViewOffsetReservations] = useState<0 | 1>(0);
    const [viewOffsetControls, setViewOffsetControls] = useState<0 | 1>(0);

    const viewDateReservations = useMemo(() => {
        const d = new Date(baseToday + "T00:00:00");
        d.setDate(d.getDate() + viewOffsetReservations);
        return localDateStr(d);
    }, [baseToday, viewOffsetReservations]);

    const viewDateControls = useMemo(() => {
        const d = new Date(baseToday + "T00:00:00");
        d.setDate(d.getDate() + viewOffsetControls);
        return localDateStr(d);
    }, [baseToday, viewOffsetControls]);

    // Fetch Task Configs
    const { data: taskAssignments = {} } = useQuery({
        queryKey: ["taskConfigs", hotel.hotelId],
        queryFn: () => getTaskConfigs(hotel.hotelId!),
        enabled: !!hotel.hotelId,
    });

    const { data: hotelSettings } = useQuery({
        queryKey: ["hotelSettings", hotel.hotelId],
        queryFn: () => getHotelSettings(hotel.hotelId!),
        enabled: !!hotel.hotelId,
    });

    // Fetch Reservations for List
    const { data: rawCalendarReservations = [], isLoading: loading } = useQuery({
        queryKey: ["dashboardReservations", viewDateReservations, hotel.hotelId],
        queryFn: async () => {
            if (!hotel.hotelId) return [];
            const data = await getReservationsForDate(viewDateReservations, hotel.hotelId);
            return data;
        },
        enabled: !!hotel.hotelId,
    });

    // Map calendar reservations to dashboard reservations
    const mapCalendarToDashboard = (ca: CalendarReservation): DashboardReservation => {
        const start = new Date(`${ca.date}T${ca.startHour.toString().padStart(2, "0")}:${ca.startMinute.toString().padStart(2, "0")}:00`);
        const end = new Date(start.getTime() + ca.durationMinutes * 60000);

        return {
            id: ca.id,
            startsAt: start.toISOString(),
            endsAt: end.toISOString(),
            guestName: ca.guestName,
            guestPhone: ca.phone,
            staffName: ca.assignedStaff || "Personel atanmadı",
            staffId: ca.assignedStaffId,
            channel: ca.channel,
            status: ca.dbStatus,
            boardType: ca.boardType,
            estimatedAmount: ca.estimatedAmount ? parseFloat(ca.estimatedAmount) : null,
            internalNote: ca.internalNote,
            roomNumber: ca.roomNumber,
            adultsCount: ca.adults_count,
            childrenCount: ca.children_count,
            noShowCandidate: (ca as any).noShowCandidate,
            noShowCandidateAt: (ca as any).noShowCandidateAt,
            reservationNumber: ca.reservationNumber,
            updated_at: ca.updated_at
        };
    };

    const rawReservations = useMemo(() => {
        return rawCalendarReservations.map(mapCalendarToDashboard);
    }, [rawCalendarReservations]);

    // Fetch Staff
    const { data: staffData = [] } = useQuery({
        queryKey: ["staff", hotel.hotelId],
        queryFn: async () => {
            if (!hotel.hotelId) return [];
            return await getStaff(hotel.hotelId);
        },
        enabled: !!hotel.hotelId,
    });

    const staffMembers = staffData;

    // Filter and sort reservations for the list
    const reservations = useMemo(() => {
        const sorted = [...rawReservations].sort((a, b) => {
            const dateA = new Date(a.startsAt).getTime();
            const dateB = new Date(b.startsAt).getTime();
            const now = new Date().getTime();

            // Checked out reservations always go to the bottom
            if (a.status === "checked_out" && b.status !== "checked_out") return 1;
            if (a.status !== "checked_out" && b.status === "checked_out") return -1;

            // Prioritize upcoming confirmed reservations if it's today
            if (viewOffsetReservations === 0) {
                const isUpcomingA = a.status === "confirmed" && dateA > now;
                const isUpcomingB = b.status === "confirmed" && dateB > now;

                if (isUpcomingA && !isUpcomingB) return -1;
                if (!isUpcomingA && isUpcomingB) return 1;
            }

            return dateA - dateB;
        });

        // Return all reservations including completed ones
        return sorted;
    }, [rawReservations, viewOffsetReservations]);

    const noShowCandidates = useMemo(() => {
        return reservations.filter(r => r.noShowCandidate);
    }, [reservations]);

    // Control Items logic
    const { data: controlCalendarReservations = [] } = useQuery({
        queryKey: ["dashboardReservationsControl", viewDateControls, hotel.hotelId],
        queryFn: () => getReservationsForDate(viewDateControls, hotel.hotelId || ""),
        enabled: !!hotel.hotelId,
    });

    const controlReservations = useMemo(() => {
        return controlCalendarReservations.map(mapCalendarToDashboard);
    }, [controlCalendarReservations]);

    const { data: paymentsMap = {} } = useQuery({
        queryKey: ["foliosForReservations", viewDateControls],
        queryFn: () => getFoliosForReservations(controlReservations.map((a: DashboardReservation) => a.id)),
        enabled: controlReservations.length > 0,
    });

    // Fetch Operational Tasks
    const { data: operationalTasks = [] } = useQuery({
        queryKey: ["operationalTasks", viewDateControls, hotel.hotelId],
        queryFn: () => getOperationalTasks(hotel.hotelId!, viewDateControls),
        enabled: !!hotel.hotelId,
    });

    const addTaskMutation = useMutation({
        mutationFn: createOperationalTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operationalTasks", viewDateControls] }),
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) => updateOperationalTask(id, updates),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operationalTasks", viewDateControls] }),
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteOperationalTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operationalTasks", viewDateControls] }),
    });

    const controlItems = useMemo(() => {
        const now = new Date();
        const controls: ControlItem[] = [];
        const userRole = hotel.userRole || UserRole.SEKRETER;
        const userId = hotel.userId;

        const canShowTask = (code: string, apptStaffId?: string | null) => {
            const config = taskAssignments[code];
            if (!config || !config.enabled) return false;
            if (hotel.isAdmin) return true;
            if (config.role === UserRole.DOKTOR && apptStaffId === userId) return true;
            return config.role === userRole;
        };

        // System Tasks
        controlReservations.forEach((appt: DashboardReservation) => {
            const startDate = new Date(appt.startsAt);
            const endDate = new Date(appt.endsAt);
            const timeLabel = `${formatTime(appt.startsAt)} - ${formatTime(appt.endsAt)}`;
            const treatmentLabel = appt.boardType?.trim() || "Konaklama";

            if (endDate < now && appt.status !== "checked_out" && appt.status !== "cancelled" && appt.status !== "no_show") {
                if (canShowTask("STATUS_UPDATE", appt.staffId)) {
                    controls.push({
                        id: `${appt.id}-status`,
                        type: "status",
                        tone: "critical",
                        toneLabel: "Acil",
                        reservationId: appt.id,
                        guestName: appt.guestName,
                        timeLabel,
                        treatmentLabel,
                        actionLabel: "Durum güncellemesi bekliyor.",
                        sortTime: endDate.getTime(),
                    });
                }
            }

            if (!appt.staffId) {
                if (canShowTask("MISSING_DOCTOR", appt.staffId)) {
                    controls.push({
                        id: `${appt.id}-doctor`,
                        type: "doctor",
                        tone: "low",
                        toneLabel: "Personel",
                        reservationId: appt.id,
                        guestName: appt.guestName,
                        timeLabel,
                        treatmentLabel,
                        actionLabel: "Personel ataması bekliyor.",
                        sortTime: startDate.getTime(),
                    });
                }
            }

            if (appt.status === "checked_out" && !paymentsMap[appt.id]) {
                if (canShowTask("MISSING_PAYMENT", appt.staffId)) {
                    controls.push({
                        id: `${appt.id}-payment`,
                        type: "payment",
                        tone: "high",
                        toneLabel: "Ödeme",
                        reservationId: appt.id,
                        guestName: appt.guestName,
                        timeLabel,
                        treatmentLabel,
                        actionLabel: "Ödeme bekliyor.",
                        sortTime: endDate.getTime(),
                    });
                }
            }
        });

        // Manual Operational Tasks
        operationalTasks.forEach((task: { id: string; title: string; due_time?: string; assigned?: { full_name: string }; description?: string; is_completed: boolean; created_at: string }) => {
            controls.push({
                id: task.id,
                type: "manual",
                tone: "medium",
                toneLabel: "Görev",
                guestName: task.title,
                timeLabel: task.due_time ? task.due_time.substring(0, 5) : "Tüm Gün",
                treatmentLabel: task.assigned?.full_name || "Atanmadı",
                actionLabel: task.description || "",
                sortTime: task.due_time ? new Date(`${viewDateControls}T${task.due_time}`).getTime() : new Date(task.created_at).getTime(),
                completed: task.is_completed
            });
        });

        controls.sort((a, b) => b.sortTime - a.sortTime);
        return controls;
    }, [controlReservations, operationalTasks, taskAssignments, hotel.isAdmin, hotel.userId, hotel.userRole, paymentsMap, viewDateControls]);

    // Additional Dashboard Queries
    const { data: rooms = [] } = useQuery({
        queryKey: ["rooms", hotel.hotelId],
        queryFn: () => getRooms(hotel.hotelId!),
        enabled: !!hotel.hotelId,
    });

    const { data: hkTasks = [] } = useQuery({
        queryKey: ["hkTasks", hotel.hotelId],
        queryFn: () => getHousekeepingTasks(hotel.hotelId!),
        enabled: !!hotel.hotelId,
    });

    const { data: finance = { todayRevenue: 0, deposits: 0, outstanding: 0 } } = useQuery({
        queryKey: ["financeSummary", hotel.hotelId],
        queryFn: () => getFinanceSummary(hotel.hotelId!),
        enabled: !!hotel.hotelId,
    });

    // Stats Calculations
    const arrivals = useMemo(() => reservations.filter(r => r.status === "confirmed"), [reservations]);
    const inHouse = useMemo(() => reservations.filter(r => r.status === "checked_in"), [reservations]);
    const departures = useMemo(() => reservations.filter(r => r.status === "checked_out"), [reservations]);

    const occupiedCount = rooms.filter(r => r.status === "occupied").length;
    const totalRooms = rooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    const housekeepingStats = useMemo(() => {
        return {
            dirty: rooms.filter(r => {
                const s = String(r.status).toUpperCase();
                return s === "DIRTY";
            }).length,
            cleaning: rooms.filter(r => {
                const s = String(r.status).toUpperCase();
                return s === "CLEANING" || s === "CLEANING_IN_PROGRESS" || s === "IN_PROGRESS";
            }).length,
            ready: rooms.filter(r => {
                const s = String(r.status).toUpperCase();
                return s === "CLEAN" || s === "READY" || s === "INSPECTED";
            }).length,
            outOfService: rooms.filter(r => {
                const s = String(r.status).toUpperCase();
                return s === "OUT_OF_ORDER" || s === "OOO" || s === "OOS";
            }).length,
        };
    }, [rooms]);

    const handleAssignStaff = async (reservationId: string, staffId: string) => {
        if (!staffId) return;
        await supabase.from("reservations").update({ assigned_staff_id: staffId }).eq("id", reservationId);
        queryClient.invalidateQueries({ queryKey: ["dashboardReservations"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardReservationsControl"] });
    };

    const handleStatusChange = async (
        reservationId: string,
        newStatus: DashboardReservation["status"],
        note?: string,
        expectedUpdatedAt?: string
    ) => {
        try {
            const { error, data } = await supabase.rpc('change_reservation_status', {
                p_reservation_id: reservationId,
                p_new_status: newStatus,
                p_hotel_id: hotel.hotelId,
                p_note: note,
                p_expected_updated_at: expectedUpdatedAt
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.message);

            queryClient.invalidateQueries({ queryKey: ["dashboardReservations"] });
            queryClient.invalidateQueries({ queryKey: ["dashboardReservationsControl"] });
            queryClient.invalidateQueries({ queryKey: ["foliosForReservations"] });
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
        } catch (err: any) {
            console.error("Status update error:", err);
            alert("Durum güncellenemedi: " + err.message);
        }
    };

    const handleAddTask = (title: string, dueTime?: string, description?: string) => {
        addTaskMutation.mutate({
            hotel_id: hotel.hotelId!,
            title,
            due_time: dueTime,
            description,
            task_date: viewDateControls
        });
    };

    const handleToggleTask = (id: string, isCompleted: boolean) => {
        updateTaskMutation.mutate({ id, updates: { is_completed: isCompleted } });
    };

    const handleDeleteTask = (id: string) => {
        deleteTaskMutation.mutate(id);
    };

    return {
        reservations,
        loading,
        staffMembers,
        controlItems,
        viewOffsetReservations,
        setViewOffsetReservations,
        viewOffsetControls,
        setViewOffsetControls,
        handleAssignStaff,
        handleStatusChange,
        handleAddTask,
        handleToggleTask,
        handleDeleteTask,
        stats: {
            occupancyRate,
            occupiedCount,
            totalRooms,
            arrivalsCount: arrivals.length,
            inHouseCount: inHouse.length,
            departuresCount: departures.length,
            pendingCount: controlItems.length,
            candidatesCount: noShowCandidates.length,
            housekeeping: housekeepingStats,
            finance
        },
        arrivals,
        inHouse,
        departures,
        noShowCandidates,
        hotelSettings,
        hkTasks,
        rooms,
        finance
    };
}
