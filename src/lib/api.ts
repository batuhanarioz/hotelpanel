import { supabase } from "@/lib/supabaseClient";
import { User, ReservationStatus, HousekeepingTask } from "@/types/database";
import { CHANNEL_LABEL_MAP } from "@/constants/dashboard";
import { CalendarReservation } from "@/hooks/useReservationManagement";

interface RawRes {
    id: string;
    check_in_date: string;
    check_out_date: string;
    guest_id: string;
    assigned_staff_id: string;
    channel: string;
    board_type: string;
    status: string;
    guest_note?: string;
    internal_note?: string;
    tags?: string[];
    source_conversation_id?: string;
    source_message_id?: string;
    estimated_amount?: number;
    room_id?: string;
    adults_count?: number;
    children_count?: number;
    infants_count?: number;
    nightly_rate?: number;
    payment_status?: string;
    additional_guests?: { fullName: string; identityNo: string; birthDate: string; identityPhotoUrl: string; phone: string; storagePath?: string }[];
    deposit_amount?: number;
    reservation_number?: string;
    no_show_candidate?: boolean;
    no_show_candidate_at?: string;
    room?: { room_number: string } | { room_number: string }[];
}

export async function getHotelBySlug(slug: string) {
    const { data } = await supabase.from("hotels").select("id, name, slug").eq("slug", slug).maybeSingle();
    return data;
}

export async function getHotelSettings(hotelId: string) {
    const { data } = await supabase.from("hotel_settings").select("*").eq("hotel_id", hotelId).maybeSingle();
    return data;
}

export async function getRooms(hotelId: string) {
    if (!hotelId) return [];
    const { data, error } = await supabase
        .from("rooms")
        .select(`
            id, room_number, floor, status, 
            room_type:room_types(name, base_price)
        `)
        .eq("hotel_id", hotelId)
        .order("room_number", { ascending: true });

    if (error) {
        console.error("getRooms error:", error);
        return [];
    }
    return data;
}

export async function getReservationsForDate(
    date: string,
    hotelId: string,
    endDate?: string
): Promise<CalendarReservation[]> {
    if (!hotelId) return [];

    let query = supabase
        .from("reservations")
        .select(`
            id, check_in_date, check_out_date, guest_id, assigned_staff_id, channel, board_type, status, 
            guest_note, internal_note, tags, source_conversation_id, 
            source_message_id, estimated_amount, room_id,
            adults_count, children_count, infants_count, nightly_rate, payment_status, additional_guests, deposit_amount, reservation_number,
            no_show_candidate, no_show_candidate_at,
            room:rooms(room_number)
        `)
        .eq("hotel_id", hotelId);

    if (endDate) {
        // Range overlap: reservation_check_in < view_end AND reservation_check_out > view_start
        query = query
            .lt("check_in_date", `${endDate}T23:59:59+03:00`)
            .gt("check_out_date", `${date}T00:00:00+03:00`);
    } else {
        query = query
            .gte("check_in_date", `${date}T00:00:00+03:00`)
            .lte("check_in_date", `${date}T23:59:59+03:00`);
    }

    const { data, error } = await query.order("check_in_date", { ascending: true });

    if (error || !data) {
        console.error("getReservationsForDate error:", error);
        return [];
    }

    const guestIds = Array.from(new Set(data.map((a) => a.guest_id).filter(Boolean))) as string[];
    const staffIds = Array.from(new Set(data.map((a) => a.assigned_staff_id).filter(Boolean))) as string[];

    const [guestsRes, staffRes] = await Promise.all([
        guestIds.length ? supabase.from("guests").select("*").eq("hotel_id", hotelId).in("id", guestIds) : Promise.resolve({ data: [], error: null }),
        staffIds.length ? supabase.from("users").select("id, full_name").eq("hotel_id", hotelId).in("id", staffIds) : Promise.resolve({ data: [], error: null }),
    ]);

    interface Guest {
        id: string;
        full_name: string;
        phone: string;
        email: string;
        birth_date: string;
        preferences_note?: string;
        passport_number?: string;
        identity_photo_url?: string;
    }

    const guestsMap = Object.fromEntries((guestsRes.data || []).map((p) => [p.id, p as Guest]));
    const staffMap = Object.fromEntries((staffRes.data || []).map((d: { id: string, full_name: string }) => [d.id, d.full_name]));

    // ... map logic follows but maps to existing structures ...
    const mapped: CalendarReservation[] = (data || []).map((row: RawRes) => {
        const startDate = new Date(row.check_in_date);
        const endDate = new Date(row.check_out_date);
        const durationMinutes = Math.max(10, Math.round((endDate.getTime() - startDate.getTime()) / 60000) || 30);
        const guest = guestsMap[row.guest_id] as Guest | undefined;

        const trTime = new Intl.DateTimeFormat('tr-TR', {
            timeZone: 'Asia/Istanbul',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        }).formatToParts(startDate);

        const hour = parseInt(trTime.find(p => p.type === 'hour')?.value || '0');
        const minute = parseInt(trTime.find(p => p.type === 'minute')?.value || '0');

        const localDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(startDate);

        return {
            id: row.id,
            date: localDate,
            startHour: hour,
            startMinute: minute,
            durationMinutes,
            guestName: guest?.full_name ?? "İsimsiz",
            phone: guest?.phone ?? "",
            email: guest?.email ?? "",
            birthDate: guest?.birth_date ?? "",
            assignedStaff: row.assigned_staff_id ? staffMap[row.assigned_staff_id] : "",
            assignedStaffId: row.assigned_staff_id,
            channel: CHANNEL_LABEL_MAP[row.channel as string] || row.channel,
            boardType: row.board_type ?? "ROOM_ONLY",
            status: row.status as ReservationStatus,
            dbStatus: row.status as ReservationStatus,
            guestNote: row.guest_note || undefined,
            internalNote: row.internal_note || undefined,
            roomNumber: (Array.isArray(row.room) ? row.room[0]?.room_number : row.room?.room_number) || undefined,
            reservationNumber: row.reservation_number || undefined,
            guestPreferences: guest?.preferences_note,
            guestPassport: guest?.passport_number,
            tags: row.tags || [],
            sourceConversationId: row.source_conversation_id || undefined,
            sourceMessageId: row.source_message_id || undefined,
            estimatedAmount: row.estimated_amount?.toString(),
            guestId: row.guest_id,
            roomId: row.room_id,
            checkInDate: row.check_in_date,
            checkOutDate: row.check_out_date,
            adults_count: row.adults_count,
            children_count: row.children_count,
            infants_count: row.infants_count,
            nightly_rate: row.nightly_rate,
            payment_status: row.payment_status,
            additional_guests: row.additional_guests,
            deposit_amount: row.deposit_amount,
            identityPhotoUrl: guest?.identity_photo_url,
            noShowCandidate: row.no_show_candidate,
            noShowCandidateAt: row.no_show_candidate_at,
        };
    });

    return mapped;
}

export async function getStaff(hotelId: string) {
    if (!hotelId) return [];
    const { data } = await supabase.from("users").select("id, full_name").eq("hotel_id", hotelId);
    return data || [];
}

export async function getAllGuests(hotelId: string) {
    if (!hotelId) return [];
    console.log("getAllGuests starting for hotelId:", hotelId);
    const { data, error } = await supabase.from("vw_guests_enterprise")
        .select(`
            *,
            reservations(id, check_in_date, check_out_date, status)
        `)
        .eq("hotel_id", hotelId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("getAllGuests error JSON:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return [];
    }
    return data || [];
}


export async function getDashboardData(date: string, hotelId: string) {
    if (!hotelId) return [];
    const { data, error } = await supabase
        .from("reservations")
        .select("id, starts_at:check_in_date, ends_at:check_out_date, guest_id:guest_id, assigned_staff_id, channel, status, board_type:board_type, estimated_amount")
        .eq("hotel_id", hotelId)
        .gte("check_in_date", `${date}T00:00:00+03:00`)
        .lte("check_in_date", `${date}T23:59:59+03:00`)
        .order("check_in_date", { ascending: true });

    if (error || !data) {
        console.error("getDashboardData error:", error);
        return [];
    }

    const guestIds = Array.from(new Set(data.map((a) => a.guest_id).filter(Boolean))) as string[];
    const staffIds = Array.from(new Set(data.map((a) => a.assigned_staff_id).filter(Boolean))) as string[];

    const [guestsRes, staffRes] = await Promise.all([
        guestIds.length ? supabase.from("guests").select("id, full_name, phone").eq("hotel_id", hotelId).in("id", guestIds) : Promise.resolve({ data: [] }),
        staffIds.length ? supabase.from("users").select("id, full_name").eq("hotel_id", hotelId).in("id", staffIds) : Promise.resolve({ data: [] })
    ]);

    const guestsMap = Object.fromEntries((guestsRes.data || []).map((p: { id: string, full_name?: string, phone?: string }) => [p.id, p]));
    const staffMap = Object.fromEntries((staffRes.data || []).map((d: Partial<User>) => [d.id, d.full_name || ""]));

    return (data || []).map((row: { id: string, starts_at: string, ends_at: string, guest_id: string, assigned_staff_id: string, channel: string, status: string, board_type: string, estimated_amount: number | null }) => {
        return {
            id: row.id,
            startsAt: row.starts_at,
            endsAt: row.ends_at,
            guestName: guestsMap[row.guest_id]?.full_name ?? "İsimsiz Misafir",
            guestPhone: guestsMap[row.guest_id]?.phone ?? null,
            staffName: staffMap[row.assigned_staff_id] ?? "Personel atanmadı",
            assignedStaffId: row.assigned_staff_id ?? null,
            channel: row.channel,
            status: row.status,
            boardType: row.board_type ?? null,
            estimatedAmount: row.estimated_amount !== null ? Number(row.estimated_amount) : null,
        };
    });
}

export async function getTaskConfigs(hotelId: string) {
    const { data: defs } = await supabase.from("dashboard_task_definitions").select("*");
    const { data: configs } = await supabase.from("hotel_task_configs").select("*").eq("hotel_id", hotelId);

    const mapping: Record<string, { role: string; enabled: boolean }> = {};
    defs?.forEach((d: { id: string; code: string; default_role: string }) => {
        const config = configs?.find((c: { task_definition_id: string; assigned_role: string; is_enabled: boolean }) => c.task_definition_id === d.id);
        mapping[d.code] = {
            role: config ? config.assigned_role : d.default_role,
            enabled: config ? config.is_enabled : true,
        };
    });
    return mapping;
}

export async function getFoliosForReservations(reservationIds: string[]) {
    if (!reservationIds.length) return {};
    const { data } = await supabase.from("folio_transactions").select("id, reservation_id").in("reservation_id", reservationIds);
    return Object.fromEntries((data || []).map((p: { reservation_id: string }) => [p.reservation_id, true]));
}

export async function getGuestDetails(guestId: string) {
    const { data: reservations, error: resError } = await supabase
        .from("reservations")
        .select("id, check_in_date, check_out_date, status, assigned_staff_id, guest_note, internal_note, board_type, room:rooms(room_number)")
        .eq("guest_id", guestId)
        .order("check_in_date", { ascending: false });

    if (resError) {
        console.error("getGuestDetails reservations error:", resError);
    }

    const reservationIds = (reservations || []).map(r => r.id);
    const { data: folios, error: folioError } = reservationIds.length
        ? await supabase
            .from("folio_transactions")
            .select("id, amount, base_amount, description, item_type, created_at, status, reservation_id")
            .in("reservation_id", reservationIds)
            .order("created_at", { ascending: false })
        : { data: [], error: null };

    if (folioError) {
        console.error("getGuestDetails folios error:", folioError);
    }

    // Fetch Audit Logs
    const { data: auditLogs } = await supabase
        .from("guest_audit_logs")
        .select(`
            *,
            actor:users(full_name)
        `)
        .eq("guest_id", guestId)
        .order("created_at", { ascending: false });

    // Fetch Financial Summary
    const { data: financialSummary } = await supabase
        .from("guest_financial_summary")
        .select("*")
        .eq("guest_id", guestId)
        .single();

    const staffIds = Array.from(new Set((reservations || []).map((r: { assigned_staff_id: string }) => r.assigned_staff_id).filter(Boolean))) as string[];
    const { data: staffData } = staffIds.length ? await supabase.from("users").select("id, full_name").in("id", staffIds) : { data: [] };
    const staffMap = Object.fromEntries((staffData || []).map((s: { id: string, full_name: string }) => [s.id, s.full_name]));

    interface ReservationRow {
        id: string;
        check_in_date: string;
        check_out_date: string;
        status: string;
        room: { room_number: string | null } | { room_number: string | null }[] | null;
        guest_note: string | null;
        internal_note: string | null;
        board_type: string | null;
        assigned_staff_id: string | null;
    }

    return {
        reservations: (reservations || []).map((row: unknown) => {
            const r = row as ReservationRow;
            const roomNumber = Array.isArray(r.room) ? r.room[0]?.room_number : r.room?.room_number;
            return {
                id: r.id,
                check_in_date: r.check_in_date,
                check_out_date: r.check_out_date,
                status: r.status,
                room_number: roomNumber || null,
                guest_note: r.guest_note || null,
                internal_note: r.internal_note || null,
                board_type: r.board_type || null,
                role: r.assigned_staff_id ? staffMap[r.assigned_staff_id] : null,
            };
        }),
        folios: (folios || []).map((row: Record<string, unknown>) => {
            return {
                id: row.id as string,
                amount: Number(row.amount),
                base_amount: Number(row.base_amount || row.amount),
                description: (row.description as string) || null,
                item_type: (row.item_type as string) || null,
                item_name: (row.description as string) || (row.item_type as string) || "Hizmet",
                status: (row.status as string) || "posted",
                created_at: (row.created_at as string) || null,
                reservation_id: row.reservation_id as string,
            };
        }),
        auditLogs: auditLogs || [],
        financialSummary: financialSummary || null
    };
}

export async function mergeGuests(hotelId: string, parentGuestId: string, childGuestId: string) {
    const { data, error } = await supabase.rpc('fn_merge_guests', {
        p_hotel_id: hotelId,
        p_parent_guest_id: parentGuestId,
        p_child_guest_id: childGuestId,
        p_actor_id: (await supabase.auth.getUser()).data.user?.id
    });
    if (error) throw error;
    return data;
}

export async function logExport(hotelId: string, entityType: string, recordCount: number, filters: Record<string, unknown> = {}) {
    const { error } = await supabase.rpc('log_export', {
        p_hotel_id: hotelId,
        p_entity_type: entityType,
        p_record_count: recordCount,
        p_filters: filters
    });
    if (error) console.error("logExport error:", error);
}
export async function getHousekeepingTasks(hotelId: string): Promise<(HousekeepingTask & { room_number?: string; staff_name?: string })[]> {
    if (!hotelId) return [];
    const { data } = await supabase
        .from("housekeeping_tasks")
        .select(`
            id, task_type, status, priority, room_id, hotel_id, created_at,
            room:rooms(room_number),
            assigned:users(full_name)
        `)
        .eq("hotel_id", hotelId)
        .neq("status", "completed")
        .order("priority", { ascending: false })
        .limit(5);

    const tasks = (data || []) as unknown as (HousekeepingTask & { room?: { room_number?: string }, assigned?: { full_name?: string } })[];
    return tasks.map((t) => {
        return {
            ...t,
            room_number: t.room?.room_number,
            staff_name: t.assigned?.full_name
        };
    });
}

export async function getFinanceSummary(hotelId: string): Promise<{ todayRevenue: number; deposits: number; outstanding: number }> {
    if (!hotelId) return { todayRevenue: 0, deposits: 0, outstanding: 0 };

    const today = new Date().toISOString().split("T")[0];
    const { data: folios } = await supabase.from("folio_transactions")
        .select("base_amount, item_type, status")
        .eq("hotel_id", hotelId)
        .eq("status", "posted")
        .gte("created_at", `${today}T00:00:00+03:00`);

    const revenue = folios?.filter(f => !["payment", "discount", "refund"].includes(f.item_type!)).reduce((sum, f) => sum + Number(f.base_amount), 0) || 0;
    const deposits = folios?.filter(f => f.item_type === "payment").reduce((sum, f) => sum + Number(f.base_amount), 0) || 0;

    return { todayRevenue: revenue, deposits, outstanding: revenue - deposits };
}

export async function getOperationalTasks(hotelId: string, date: string) {
    if (!hotelId || !date) return [];

    const { data, error } = await supabase
        .from("operational_tasks")
        .select(`
            *,
            assigned:assigned_to (
                full_name
            )
        `)
        .eq("hotel_id", hotelId)
        .eq("task_date", date)
        .order("created_at", { ascending: true });

    if (error) {
        // Table does not exist yet (PGRST205)
        if (error.code === 'PGRST205') {
            return [];
        }
        console.error("getOperationalTasks error:", error);
        return [];
    }
    return data;
}

export async function createOperationalTask(task: { hotel_id: string; title: string; task_date: string; due_time?: string; description?: string }) {
    const { data, error } = await supabase.from("operational_tasks").insert(task).select().single();
    if (error) throw error;
    return data;
}

export async function updateOperationalTask(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase.from("operational_tasks").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteOperationalTask(id: string) {
    const { error } = await supabase.from("operational_tasks").delete().eq("id", id);
    if (error) throw error;
}

// ─── Smart Operations Dashboard ──────────────────────────────────────────────

export interface SmartOpsMetrics {
    occupancy_rate: number;
    adr: number;
    revpar: number;
    revenue_today: number;
    rooms_available: number;
    rooms_sold: number;
}

export interface SmartOpsArrival {
    id: string;
    reservation_number: string | null;
    guest_name: string;
    guest_id: string;
    room_type: string | null;
    room_type_id: string | null;
    assigned_room: string | null;
    room_id: string | null;
    arrival_time: string;
    check_in_date: string;
    check_out_date: string;
    adults_count: number;
    board_type: string | null;
}

export interface SmartOpsDeparture {
    id: string;
    reservation_number: string | null;
    guest_name: string;
    guest_id: string;
    room_number: string | null;
    room_id: string | null;
    check_out_date: string;
    balance_due: number;
    folio_id: string | null;
}

export interface SmartOpsInHouse {
    id: string;
    reservation_number: string | null;
    guest_name: string;
    guest_id: string;
    room_number: string | null;
    room_id: string | null;
    check_in_date: string;
    check_out_date: string;
    nights_remaining: number;
    balance_due: number;
}

export interface SmartOpsNoShow {
    id: string;
    reservation_number: string | null;
    guest_name: string;
    guest_id: string;
    check_in_date: string;
    no_show_candidate_at: string;
    delay_minutes: number;
}

export interface SmartOpsUnassigned {
    id: string;
    reservation_number: string | null;
    guest_name: string;
    guest_id: string;
    room_type: string | null;
    room_type_id: string | null;
    check_in_date: string;
    check_out_date: string;
    adults_count: number;
}

export interface SmartOpsRoomStatus {
    clean: number;
    dirty: number;
    occupied: number;
    cleaning: number;
    out_of_service: number;
    total: number;
}

export interface SmartOpsDashboardData {
    metrics: SmartOpsMetrics;
    arrivals: SmartOpsArrival[];
    departures: SmartOpsDeparture[];
    in_house: SmartOpsInHouse[];
    no_show: SmartOpsNoShow[];
    unassigned: SmartOpsUnassigned[];
    room_status: SmartOpsRoomStatus;
    business_date: string;
}

const EMPTY_SMART_OPS: SmartOpsDashboardData = {
    metrics: { occupancy_rate: 0, adr: 0, revpar: 0, revenue_today: 0, rooms_available: 0, rooms_sold: 0 },
    arrivals: [],
    departures: [],
    in_house: [],
    no_show: [],
    unassigned: [],
    room_status: { clean: 0, dirty: 0, occupied: 0, cleaning: 0, out_of_service: 0, total: 0 },
    business_date: new Date().toISOString().slice(0, 10),
};

export async function getSmartOpsDashboard(
    hotelId: string,
    businessDate?: string
): Promise<SmartOpsDashboardData> {
    if (!hotelId) return EMPTY_SMART_OPS;

    const date = businessDate || new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase.rpc("get_smart_ops_dashboard", {
        p_hotel_id: hotelId,
        p_business_date: date,
    });

    if (error) {
        console.error("getSmartOpsDashboard error:", error);
        return EMPTY_SMART_OPS;
    }

    return (data as SmartOpsDashboardData) || EMPTY_SMART_OPS;
}
