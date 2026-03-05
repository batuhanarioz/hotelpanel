import { useState, useEffect, useMemo, useCallback } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { supabase } from "@/lib/supabaseClient";
import { localDateStr } from "@/lib/dateUtils";

import * as Sentry from "@sentry/nextjs";

export type Guest = { id: string; full_name: string; phone: string | null; };
export type ReservationOption = { id: string; check_in_date: string; board_type: string | null; guest_id: string; guest_full_name: string; guest_phone: string | null; };
export type PaymentRow = { id: string; amount: number; method: string | null; status: string | null; note: string | null; created_at: string | null; guest: { full_name: string | null; phone: string | null; } | null; };

export function usePaymentManagement(reservationIdParam: string | null) {
    const hotelCtx = useHotel();
    const today = useMemo(() => localDateStr(), []);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [listSearch, setListSearch] = useState("");
    const [modalGuestSearch, setModalGuestSearch] = useState("");
    const [modalReservations, setModalReservations] = useState<ReservationOption[]>([]);
    const [modalReservationsLoading, setModalReservationsLoading] = useState(false);
    const [selectedReservationId, setSelectedReservationId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState(today);
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<string>("Nakit");
    const [status, setStatus] = useState<string>("planned");
    const [note, setNote] = useState("");
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
    const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailStatus, setDetailStatus] = useState<string>("planned");
    const [detailAmount, setDetailAmount] = useState<string>("");
    const [detailMethod, setDetailMethod] = useState<string>("Nakit");
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        if (reservationIdParam && !isModalOpen) {
            setSelectedReservationId(reservationIdParam);
            setIsModalOpen(true);
        }
    }, [reservationIdParam, isModalOpen]);

    useEffect(() => {
        if (!hotelCtx.hotelId) return;
        supabase.from("guests").select("id, full_name, phone").eq("hotel_id", hotelCtx.hotelId).order("full_name", { ascending: true })
            .then(({ data }) => setGuests(data as Guest[] || []));
    }, [hotelCtx.hotelId]);

    const loadPayments = useCallback(async (startDate: string, endDate: string) => {
        if (!hotelCtx.hotelId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from("folio_transactions")
            .select(`
                id, amount, base_amount, created_at, item_type, description, status,
                reservation:reservations(
                    id,
                    guest:guests(full_name, phone)
                )
            `)
            .eq("hotel_id", hotelCtx.hotelId)
            .gte("created_at", `${startDate}T00:00:00Z`)
            .lt("created_at", `${endDate}T23:59:59Z`)
            .order("created_at", { ascending: true });

        if (error) {
            setError(error.message);
            Sentry.captureException(error);
        } else {
            interface FolioTransactionRow {
                id: string;
                amount: number;
                base_amount: number | null;
                created_at: string;
                item_type: string | null;
                description: string | null;
                status: string | null;
                reservation: { guest: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null } | { guest: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null }[] | null;
            }

            const mappedData = (data || []).map((res: unknown) => {
                const item = res as FolioTransactionRow;
                const reservation = Array.isArray(item.reservation) ? item.reservation[0] : item.reservation;
                const guest = Array.isArray(reservation?.guest) ? reservation.guest[0] : reservation?.guest;
                return {
                    id: item.id,
                    amount: item.base_amount || item.amount,
                    created_at: item.created_at,
                    method: item.item_type === "payment" ? "Nakit" : "Harcama", // Simplified for now
                    status: item.status || "posted",
                    note: item.description,
                    guest: {
                        full_name: guest?.full_name || "Bilinmeyen Misafir",
                        phone: guest?.phone || null
                    }
                };
            });
            setPayments(mappedData as PaymentRow[]);
        }
        setLoading(false);
    }, [hotelCtx.hotelId]);

    useEffect(() => {
        const baseDate = new Date(selectedDate);
        let start = new Date(baseDate); let end = new Date(baseDate);
        if (viewMode === "day") end.setDate(end.getDate() + 1);
        else if (viewMode === "week") {
            const d = baseDate.getDay(); const diff = (d + 6) % 7;
            start.setDate(start.getDate() - diff); end = new Date(start); end.setDate(end.getDate() + 7);
        } else { start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1); end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1); }
        loadPayments(localDateStr(start), localDateStr(end));
    }, [selectedDate, viewMode, loadPayments]);

    useEffect(() => {
        const term = modalGuestSearch.trim().toLowerCase();
        if (!isModalOpen || !term) { setModalReservations([]); return; }
        const gIds = guests.filter(p => p.full_name?.toLowerCase().includes(term) || p.phone?.includes(term)).map(p => p.id);
        if (gIds.length === 0) { setModalReservations([]); return; }
        setModalReservationsLoading(true);
        supabase.from("reservations").select("id, check_in_date, board_type, guest_id, guests:guest_id(full_name, phone)").in("guest_id", gIds).order("check_in_date", { ascending: true }).limit(30)
            .then(({ data }) => {
                type PaymentModalRow = { id: string; check_in_date: string; board_type: string | null; guest_id: string; guests: { full_name: string; phone: string | null } | null };

                setModalReservations(((data as unknown as PaymentModalRow[]) || []).map((r) => ({
                    id: r.id, check_in_date: r.check_in_date, board_type: r.board_type, guest_id: r.guest_id,
                    guest_full_name: r.guests?.full_name || "Misafir", guest_phone: r.guests?.phone || null
                })));
                setModalReservationsLoading(false);
            });
    }, [modalGuestSearch, isModalOpen, guests]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalGuestSearch("");
        setSelectedReservationId("");
        setAmount("");
        setMethod("Nakit");
        setStatus("planned");
        setNote("");
        setError(null);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReservationId || !amount || !hotelCtx.hotelId) return;
        const appt = modalReservations.find(a => a.id === selectedReservationId);
        if (!appt) return;
        setSaving(true);
        const folioData = {
            hotel_id: hotelCtx.hotelId,
            reservation_id: selectedReservationId,
            amount: Number(amount),
            base_amount: Number(amount),
            currency_code: 'TRY',
            exchange_rate_to_base: 1,
            item_type: "payment",
            description: note.trim() || "Ödeme",
            status: 'posted',
            created_at: selectedDate === today ? new Date().toISOString() : `${selectedDate}T12:00:00Z`
        };

        const { error } = await supabase.from("folio_transactions").insert(folioData);
        if (error) {
            Sentry.captureException(error, { tags: { section: "payments", action: "insert" } });
            setError(error.message);
        }
        else {
            closeModal();
            const baseDate = new Date(selectedDate);
            let start = new Date(baseDate);
            let end = new Date(baseDate);
            if (viewMode === "day") end.setDate(end.getDate() + 1);
            else if (viewMode === "week") {
                const d = baseDate.getDay(); const diff = (d + 6) % 7;
                start.setDate(start.getDate() - diff); end = new Date(start); end.setDate(end.getDate() + 7);
            } else { start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1); end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1); }
            await loadPayments(localDateStr(start), localDateStr(end));
        }
        setSaving(false);
    };

    const handleUpdateStatus = async () => {
        if (!selectedPayment) return;

        const updates = {
            amount: Number(detailAmount),
            base_amount: Number(detailAmount),
            description: detailMethod // Using method as description for now to avoid data loss
        };

        const { error } = await supabase.from("folio_transactions").update(updates).eq("id", selectedPayment.id);
        if (!error) {
            setPayments(prev => prev.map(p => p.id === selectedPayment.id ? { ...p, amount: Number(detailAmount) } : p));
            setIsDetailModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPayment) return;
        const { error } = await supabase.from("folio_transactions").delete().eq("id", selectedPayment.id);
        if (!error) { setPayments(prev => prev.filter(p => p.id !== selectedPayment.id)); setIsDetailModalOpen(false); setIsDeleteConfirmOpen(false); }
    };

    const filteredPayments = useMemo(() => payments.filter(p => {
        const t = listSearch.trim().toLowerCase(); if (!t) return true;
        return p.guest?.full_name?.toLowerCase().includes(t) || p.guest?.phone?.includes(t);
    }), [payments, listSearch]);

    const stats = useMemo(() => {
        const total = filteredPayments.reduce((s, p) => s + p.amount, 0);
        const paid = filteredPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
        const planned = filteredPayments.filter(p => p.status === "planned" || p.status === "partial").reduce((s, p) => s + p.amount, 0);
        return { total, paid, planned, count: filteredPayments.length };
    }, [filteredPayments]);

    const openDetail = (p: PaymentRow) => {
        setSelectedPayment(p); setDetailStatus(p.status || "planned"); setDetailAmount(String(p.amount)); setDetailMethod(p.method || "Nakit"); setIsDetailModalOpen(true);
    };

    return {
        today, guests, listSearch, setListSearch, modalGuestSearch, setModalGuestSearch,
        modalReservations, modalReservationsLoading, selectedReservationId, setSelectedReservationId,
        selectedDate, setSelectedDate, amount, setAmount, method, setMethod, status, setStatus, note, setNote,
        payments, loading, saving, error, isModalOpen, setIsModalOpen, closeModal, currentPage, setCurrentPage,
        viewMode, setViewMode, selectedPayment, isDetailModalOpen, setIsDetailModalOpen,
        detailStatus, setDetailStatus, detailAmount, setDetailAmount, detailMethod, setDetailMethod,
        isDeleteConfirmOpen, setIsDeleteConfirmOpen, filteredPayments, stats,
        handleSave, handleUpdateStatus, handleDelete, openDetail
    };
}
