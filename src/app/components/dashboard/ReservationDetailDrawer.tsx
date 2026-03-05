import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DashboardReservation } from "@/hooks/useDashboard";
import { ReservationDrawer } from "@/app/components/reservations/ReservationDrawer";
import { CalendarReservation } from "@/hooks/useReservationManagement";
import { CHANNEL_LABEL_MAP } from "@/constants/dashboard";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface ReservationDetailDrawerProps {
    reservationId: string | null;
    onClose: () => void;
    onStatusChange: (id: string, status: DashboardReservation["status"], note?: string, expectedUpdatedAt?: string) => void;
    onAssignStaff: (id: string, staffId: string) => void;
    staffMembers: Array<{ id: string; full_name: string }>;
}

export function ReservationDetailDrawer({
    reservationId,
    onClose,
    onStatusChange,
    onAssignStaff,
    staffMembers
}: ReservationDetailDrawerProps) {
    const [reservation, setReservation] = useState<CalendarReservation | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { slug } = useParams();
    const queryClient = useQueryClient();

    const fetchDetail = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const { data: row, error } = await supabase
                .from("reservations")
                .select(`
                    *,
                    guests(*),
                    rooms(room_number, room_types(name)),
                    users!assigned_staff_id(full_name)
                `)
                .eq("id", id)
                .maybeSingle();

            if (!error && row) {
                const guest = row.guests;
                const room = row.rooms;

                // Map to CalendarReservation
                const mapped: CalendarReservation = {
                    id: row.id,
                    date: row.check_in_date.split('T')[0],
                    startHour: new Date(row.check_in_date).getHours(),
                    startMinute: new Date(row.check_in_date).getMinutes(),
                    durationMinutes: Math.round((new Date(row.check_out_date).getTime() - new Date(row.check_in_date).getTime()) / 60000),
                    guestName: guest?.full_name ?? "İsimsiz",
                    phone: guest?.phone ?? "",
                    email: guest?.email ?? "",
                    assignedStaff: row.users?.full_name ?? "",
                    assignedStaffId: row.assigned_staff_id,
                    channel: CHANNEL_LABEL_MAP[row.channel as string] || row.channel,
                    boardType: row.board_type ?? "ROOM_ONLY",
                    status: row.status,
                    dbStatus: row.status,
                    guestNote: row.guest_note,
                    internalNote: row.internal_note,
                    roomNumber: room?.room_number,
                    reservationNumber: row.reservation_number,
                    estimatedAmount: row.estimated_amount?.toString(),
                    guestId: row.guest_id,
                    roomId: row.room_id,
                    checkInDate: row.check_in_date,
                    checkOutDate: row.check_out_date,
                    adults_count: row.adults_count,
                    children_count: row.children_count,
                    infants_count: row.infants_count,
                    payment_status: row.payment_status,
                    nightly_rate: row.nightly_rate,
                    deposit_amount: row.deposit_amount,
                    total_amount: row.estimated_amount,
                    currency: row.currency ?? "TRY",
                    updated_at: row.updated_at,
                    noShowCandidate: row.no_show_candidate,
                    noShowCandidateAt: row.no_show_candidate_at
                };
                setReservation(mapped);
            }
        } catch (err) {
            console.error("Error fetching reservation detail:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (reservationId) {
            fetchDetail(reservationId);
        } else {
            setReservation(null);
        }
    }, [reservationId, fetchDetail]);

    const handleInternalStatusChange = async (res: CalendarReservation, newStatus: string, note?: string) => {
        await onStatusChange(res.id, newStatus as DashboardReservation["status"], note, res.updated_at);
        // Refresh local state
        fetchDetail(res.id);
    };

    const handleEdit = (res: CalendarReservation) => {
        router.push(`/${slug}/reservation-management?id=${res.id}`);
    };

    const handleExtend = async (res: CalendarReservation) => {
        const currentEnd = new Date(res.checkOutDate!);
        const newEnd = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000);

        const { error } = await supabase
            .from("reservations")
            .update({ check_out_date: newEnd.toISOString() })
            .eq("id", res.id);

        if (error) {
            alert("Uzatma işlemi başarısız: " + error.message);
        } else {
            fetchDetail(res.id);
            queryClient.invalidateQueries({ queryKey: ["dashboardReservations"] });
        }
    };

    const handleMove = (res: CalendarReservation) => {
        handleEdit(res);
    };

    return (
        <ReservationDrawer
            isOpen={!!reservationId}
            onClose={onClose}
            reservation={reservation}
            onEdit={handleEdit}
            onStatusChange={handleInternalStatusChange}
            onExtend={handleExtend}
            onMove={handleMove}
        />
    );
}
