import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserRole } from "@/types/database";
import { useHotel } from "@/app/context/HotelContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllGuests, getGuestDetails, mergeGuests as apiMergeGuests, logExport } from "@/lib/api";
import { updateGuestSchema } from "@/lib/validations/guest";
import * as Sentry from "@sentry/nextjs";

export type GuestRow = {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    birth_date: string | null;
    identity_no: string | null;
    masked_identity_no?: string | null;
    passport_number: string | null;
    preferences_note: string | null;
    allergies: string | null;
    created_at: string;
    nationality?: string | null;
    id_type?: 'TC' | 'PASSPORT' | null;
    is_vip?: boolean;
    vip_level?: string | null;
    is_blacklist?: boolean;
    blacklist_reason?: string | null;
    marketing_consent?: boolean;
    marketing_consent_at?: string | null;
    tags?: string[];
    identity_photo_url?: string | null;
    preferences?: Record<string, unknown>;
    reservations?: { id: string, check_in_date: string, check_out_date: string, status: string }[];
};

export type GuestReservation = {
    id: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    board_type: string | null;
    role: string | null;
    room_number: string | null;
    guest_note: string | null | undefined;
    internal_note: string | null | undefined;
};

export type GuestFolio = {
    id: string;
    amount: number;
    base_amount: number;
    description: string | null;
    item_type: string | null;
    status: string | null;
    item_name: string | null;
    created_at: string | null;
    reservation_id: string;
};

export interface AuditLog {
    id: string;
    action: string;
    created_at: string;
    actor?: { full_name: string | null };
}

export interface FinancialSummary {
    total_spent: number;
    open_balance: number;
    last_payment_date: string | null;
}

export interface GuestDetailData {
    reservations: GuestReservation[];
    folios: GuestFolio[];
    auditLogs: AuditLog[];
    financialSummary: FinancialSummary | null;
}

const PAGE_SIZE = 10;

export function useGuests() {
    const queryClient = useQueryClient();
    const hotelCtx = useHotel();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Fetch All Guests
    const { data: guests = [], isLoading: loading, error: queryError } = useQuery({
        queryKey: ["guests", hotelCtx.hotelId],
        queryFn: () => getAllGuests(hotelCtx.hotelId || ""),
        enabled: !!hotelCtx.hotelId,
    });

    const error = queryError ? (queryError as Error).message : null;

    // Fetch Guest Details
    const { data: detailData, isLoading: reservationsLoading } = useQuery({
        queryKey: ["guestDetails", selectedGuestId],
        queryFn: () => getGuestDetails(selectedGuestId!),
        enabled: !!selectedGuestId,
    });

    const reservations = detailData?.reservations || [];
    const folios = detailData?.folios || [];
    const auditLogs = detailData?.auditLogs || [];
    const financialSummary = detailData?.financialSummary || null;

    const selectedGuest = useMemo(() => {
        if (!selectedGuestId) return null;
        return guests.find((g: GuestRow) => g.id === selectedGuestId) || null;
    }, [guests, selectedGuestId]);

    const filteredGuests = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return guests;
        return guests.filter((g: GuestRow) => {
            const name = g.full_name?.toLowerCase() ?? "";
            const phone = g.phone?.replace(/\s+/g, "") ?? "";
            return name.includes(term) || phone.includes(term.replace(/\s+/g, "")) || phone.includes(term);
        });
    }, [guests, search]);

    const totalPages = Math.max(1, Math.ceil(filteredGuests.length / PAGE_SIZE));
    const currentPageGuests = filteredGuests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleSelectGuest = (guest: GuestRow) => {
        setSelectedGuestId(guest.id);
        setDetailOpen(true);
    };

    const downloadGuestsCsv = async () => {
        if (!hotelCtx.hotelId) return;
        const escape = (v: string | null | undefined) => {
            if (v == null) return "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n\r]/.test(s) ? `"${s}"` : s;
        };
        const rows = [
            ["Ad Soyad", "Telefon", "E-posta", "Doğum Tarihi", "TC Kimlik No", "Pasaport No", "Alerjiler", "Özel İstekler", "Kayıt Tarihi"],
            ...filteredGuests.map((g: GuestRow) => [
                escape(g.full_name), escape(g.phone), escape(g.email),
                escape(g.birth_date ? g.birth_date.slice(0, 10) : null),
                escape(g.masked_identity_no || g.identity_no), escape(g.passport_number), escape(g.allergies), escape(g.preferences_note),
                escape(g.created_at ? g.created_at.slice(0, 10) : null),
            ]),
        ];
        const csv = rows.map((r) => r.join(";")).join("\r\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(hotelCtx.hotelName || "Otel").replace(/\s+/g, "_")}_Misafirler.csv`;
        a.click();
        URL.revokeObjectURL(url);

        // Enterprise: Log Export
        await logExport(hotelCtx.hotelId, 'guests', filteredGuests.length, { search, filter: 'all' });
    };

    const deleteGuest = async (id: string) => {
        const { error } = await supabase.from("guests").delete().eq("id", id);
        if (error) {
            Sentry.captureException(error, { tags: { section: "guests", action: "delete" } });
            alert(error.message);
            return false;
        }
        queryClient.invalidateQueries({ queryKey: ["guests"] });
        setDetailOpen(false);
        return true;
    };

    const updateGuest = async (id: string, updates: Partial<GuestRow>) => {
        const validation = updateGuestSchema.safeParse(updates);
        if (!validation.success) {
            alert("Yeni bilgiler geçersiz: " + validation.error.issues[0].message);
            return false;
        }

        const payload: Partial<GuestRow> & { marketing_consent_at?: string } = { ...validation.data };

        // Enterprise: Handle Marketing Consent Timestamp
        if (payload.marketing_consent === true && selectedGuest?.marketing_consent !== true) {
            payload.marketing_consent_at = new Date().toISOString();
        }

        // Normalization
        if (payload.phone) payload.phone = payload.phone.replace(/\s+/g, "");
        if (payload.email) payload.email = payload.email.toLowerCase().trim();

        const { error } = await supabase.from("guests").update(payload).eq("id", id);
        if (error) {
            Sentry.captureException(error, { tags: { section: "guests", action: "update" } });
            alert(error.message);
            return false;
        }
        queryClient.invalidateQueries({ queryKey: ["guests"] });
        queryClient.invalidateQueries({ queryKey: ["guestDetails", id] });
        return true;
    };

    const checkDuplicateGuest = async (data: {
        phone?: string,
        email?: string,
        identity_no?: string,
        full_name?: string,
        birth_date?: string
    }) => {
        if (!hotelCtx.hotelId) return null;

        const exactQueries = [];
        if (data.phone) exactQueries.push(`phone.eq.${data.phone}`);
        if (data.email) exactQueries.push(`email.eq.${data.email}`);
        if (data.identity_no) exactQueries.push(`identity_no.eq.${data.identity_no}`);

        let existing = [];

        // 1. Check Exact Matches
        if (exactQueries.length > 0) {
            const { data: exactData } = await supabase
                .from("guests")
                .select("*")
                .eq("hotel_id", hotelCtx.hotelId)
                .or(exactQueries.join(","));
            if (exactData && exactData.length > 0) existing = exactData;
        }

        // 2. Check Fuzzy Match (Full Name + Birth Date)
        if (existing.length === 0 && data.full_name && data.birth_date) {
            const { data: fuzzyData } = await supabase
                .from("guests")
                .select("*")
                .eq("hotel_id", hotelCtx.hotelId)
                .eq("full_name", data.full_name)
                .eq("birth_date", data.birth_date);
            if (fuzzyData && fuzzyData.length > 0) existing = fuzzyData;
        }

        return existing.length > 0 ? existing[0] : null;
    };

    const mergeGuests = async (existingId: string, newData: Partial<GuestRow>) => {
        if (!hotelCtx.hotelId) return false;
        try {
            await apiMergeGuests(hotelCtx.hotelId, existingId, newData.id!);
            queryClient.invalidateQueries({ queryKey: ["guests"] });
            queryClient.invalidateQueries({ queryKey: ["guestDetails", existingId] });
            return true;
        } catch (err: unknown) {
            const error = err as Error;
            Sentry.captureException(error, { tags: { section: "guests", action: "merge" } });
            alert(error.message);
            return false;
        }
    };

    const createGuest = async (data: Partial<GuestRow>) => {
        if (!hotelCtx.hotelId) return null;

        const payload: Partial<GuestRow> & { hotel_id: string; marketing_consent_at?: string | null } = { ...data, hotel_id: hotelCtx.hotelId };

        // Normalization
        if (payload.phone) payload.phone = payload.phone.replace(/\s+/g, "");
        if (payload.email) payload.email = payload.email.toLowerCase().trim();

        // Marketing Consent
        if (payload.marketing_consent === true) {
            payload.marketing_consent_at = new Date().toISOString();
        }

        const { error, data: newGuest } = await supabase
            .from("guests")
            .insert([payload])
            .select()
            .single();

        if (error) {
            Sentry.captureException(error, { tags: { section: "guests", action: "create" } });
            alert(error.message);
            return null;
        }
        queryClient.invalidateQueries({ queryKey: ["guests"] });
        return newGuest;
    };

    return {
        loading, error, search, setSearch, currentPage, setCurrentPage, selectedGuest,
        reservations, folios, auditLogs, financialSummary, reservationsLoading, detailOpen, setDetailOpen,
        guests, filteredGuests, totalPages, currentPageGuests, handleSelectGuest,
        downloadGuestsCsv, deleteGuest, updateGuest, createGuest, checkDuplicateGuest, mergeGuests,
        isAdmin: hotelCtx.userRole === UserRole.ADMIN || hotelCtx.userRole === UserRole.SUPER_ADMIN,
        isManager: hotelCtx.userRole === UserRole.MANAGER || hotelCtx.userRole === UserRole.ADMIN || hotelCtx.userRole === UserRole.SUPER_ADMIN
    };
}
