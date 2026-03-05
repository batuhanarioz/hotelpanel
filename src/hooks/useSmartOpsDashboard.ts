"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useHotel } from "@/app/context/HotelContext";
import { usePermissions } from "@/hooks/usePermissions";
import { localDateStr } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabaseClient";
import {
    getSmartOpsDashboard,
    SmartOpsDashboardData,
} from "@/lib/api";
import { UserRole } from "@/types/database";

export interface SmartOpsAlerts {
    noShowCount: number;
    dirtyRoomsCount: number;
    unassignedCount: number;
    departuresWithBalance: number;
}

export interface SmartOpsWidgetVisibility {
    metrics: boolean;
    alerts: boolean;
    arrivals: boolean;
    departures: boolean;
    inHouse: boolean;
    noShow: boolean;
    roomStatus: boolean;
    unassigned: boolean;
}

function getWidgetVisibility(role?: string | null, isAdmin?: boolean): SmartOpsWidgetVisibility {
    if (isAdmin || role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN || role === UserRole.MANAGER) {
        return {
            metrics: true,
            alerts: true,
            arrivals: true,
            departures: true,
            inHouse: true,
            noShow: true,
            roomStatus: true,
            unassigned: true,
        };
    }

    if (role === UserRole.RECEPTION) {
        return {
            metrics: true,
            alerts: true,
            arrivals: true,
            departures: true,
            inHouse: true,
            noShow: true,
            roomStatus: true,
            unassigned: true,
        };
    }

    if (role === UserRole.HOUSEKEEPING) {
        return {
            metrics: false,
            alerts: true,
            arrivals: false,
            departures: false,
            inHouse: false,
            noShow: false,
            roomStatus: true,
            unassigned: false,
        };
    }

    if (role === UserRole.FINANCE || role === UserRole.NIGHT_AUDIT) {
        return {
            metrics: true,
            alerts: true,
            arrivals: false,
            departures: true,
            inHouse: true,
            noShow: false,
            roomStatus: false,
            unassigned: false,
        };
    }

    // Default: minimal
    return {
        metrics: false,
        alerts: true,
        arrivals: false,
        departures: false,
        inHouse: false,
        noShow: false,
        roomStatus: false,
        unassigned: false,
    };
}

export function useSmartOpsDashboard() {
    const { hotelId, userRole, isAdmin } = useHotel();
    const { checkPermission } = usePermissions();
    const queryClient = useQueryClient();

    const businessDate = useMemo(() => localDateStr(), []);

    // Primary data fetch — 30s auto-refresh
    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery<SmartOpsDashboardData>({
        queryKey: ["smartOpsDashboard", hotelId, businessDate],
        queryFn: () => getSmartOpsDashboard(hotelId!, businessDate),
        enabled: !!hotelId,
        refetchInterval: 30_000,  // 30 second auto-refresh
        staleTime: 15_000,
    });

    // Widget visibility based on RBAC
    const widgetVisibility = useMemo(
        () => getWidgetVisibility(userRole, isAdmin),
        [userRole, isAdmin]
    );

    // Computed alerts
    const alerts = useMemo<SmartOpsAlerts>(() => {
        if (!data) return { noShowCount: 0, dirtyRoomsCount: 0, unassignedCount: 0, departuresWithBalance: 0 };
        return {
            noShowCount: data.no_show.length,
            dirtyRoomsCount: data.room_status.dirty + data.room_status.cleaning,
            unassignedCount: data.unassigned.length,
            departuresWithBalance: data.departures.filter(d => d.balance_due > 0).length,
        };
    }, [data]);

    const hasAlerts = useMemo(
        () => Object.values(alerts).some(v => v > 0),
        [alerts]
    );

    // Actions
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["smartOpsDashboard", hotelId] });
    };

    // Check-In action
    const checkInMutation = useMutation({
        mutationFn: async (reservationId: string) => {
            const { data: result, error } = await supabase.rpc("change_reservation_status", {
                p_reservation_id: reservationId,
                p_new_status: "checked_in",
                p_hotel_id: hotelId,
                p_note: "Check-in from Smart Operations Dashboard",
                p_expected_updated_at: null,
            });
            if (error) {
                console.error("Check-in error (RPC):", error);
                throw new Error(error.message || "Bilinmeyen veritabanı hatası");
            }
            if (result && !result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: invalidate,
    });

    // Check-Out action
    const checkOutMutation = useMutation({
        mutationFn: async (reservationId: string) => {
            const { data: result, error } = await supabase.rpc("change_reservation_status", {
                p_reservation_id: reservationId,
                p_new_status: "checked_out",
                p_hotel_id: hotelId,
                p_note: "Check-out from Smart Operations Dashboard",
                p_expected_updated_at: null,
            });
            if (error) {
                console.error("Check-out error (RPC):", error);
                throw new Error(error.message || "Bilinmeyen veritabanı hatası");
            }
            if (result && !result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: invalidate,
    });

    // Mark No-Show action
    const markNoShowMutation = useMutation({
        mutationFn: async (reservationId: string) => {
            const { data: result, error } = await supabase.rpc("change_reservation_status", {
                p_reservation_id: reservationId,
                p_new_status: "no_show",
                p_hotel_id: hotelId,
                p_note: "Marked no-show from Smart Operations Dashboard",
                p_expected_updated_at: null,
            });
            if (error) {
                console.error("No-show error (RPC):", error);
                throw new Error(error.message || "Bilinmeyen veritabanı hatası");
            }
            if (result && !result.success) throw new Error(result.message);
            return result;
        },
        onSuccess: invalidate,
    });

    // Auto-Assign Room action
    const autoAssignMutation = useMutation({
        mutationFn: async (reservationId: string) => {
            const { data: result, error } = await supabase.rpc("auto_assign_room", {
                p_reservation_id: reservationId,
                p_hotel_id: hotelId,
            });
            if (error) throw error;
            return result;
        },
        onSuccess: invalidate,
    });

    const handleCheckIn = (reservationId: string) => checkInMutation.mutateAsync(reservationId);
    const handleCheckOut = (reservationId: string) => checkOutMutation.mutateAsync(reservationId);
    const handleMarkNoShow = (reservationId: string) => markNoShowMutation.mutateAsync(reservationId);
    const handleAutoAssign = (reservationId: string) => autoAssignMutation.mutateAsync(reservationId);

    return {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
        businessDate,
        widgetVisibility,
        alerts,
        hasAlerts,
        checkPermission,
        handleCheckIn,
        handleCheckOut,
        handleMarkNoShow,
        handleAutoAssign,
        isCheckingIn: checkInMutation.isPending,
        isCheckingOut: checkOutMutation.isPending,
        isMarkingNoShow: markNoShowMutation.isPending,
        isAutoAssigning: autoAssignMutation.isPending,
    };
}
