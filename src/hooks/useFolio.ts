import { useState, useEffect, useMemo, useCallback } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { localDateStr } from "@/lib/dateUtils";
import { supabase } from "@/lib/supabaseClient";

export type LedgerItemType = "room_charge" | "service_charge" | "payment" | "refund" | "adjustment" | "tax" | "discount" | "accommodation" | "charge" | "extra";

export type CurrencyType = "TRY" | "EUR" | "USD" | "GBP";

export interface AuditLogEntry {
    id: string;
    action: string;
    actor_id?: string;
    actor_name?: string;
    created_at: string;
    details?: {
        description?: string;
        amount?: number;
        currency?: string;
    };
}

export interface FolioItem {
    id: string;
    amount: number;
    currency: CurrencyType;
    type: LedgerItemType;
    description: string | null;
    source: "system" | "ui" | "integration";
    created_at: string;
    created_by: string;
    metadata?: Record<string, unknown>;
    debit?: number;
    credit?: number;
    runningBalance?: number;
}

export type ReservationFolio = {
    id: string;
    guest_name: string;
    room_number: string;
    check_in_date: string;
    check_out_date: string;
    currency: CurrencyType;
    total_charges: number;
    total_payments: number;
    balance: number;
    payment_status: "paid" | "partial" | "unpaid" | "refunded";
    guest_count: number;
    items: FolioItem[];
};

export const computeFolioFinances = (items: FolioItem[]) => {
    // Sort by created_at ascending for running balance calculation
    const sortedItems = [...items].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let totalCharges = 0;
    let totalPayments = 0;
    let currentBalance = 0;

    const computedItems = sortedItems.map(item => {
        let debit = 0;
        let credit = 0;
        const t = String(item.type).toLowerCase(); // Enum/text veritabanı farklılıklarına karşı garantör

        // Charges increase balance
        if (["room_charge", "service_charge", "tax", "accommodation", "charge", "extra"].includes(t)) {
            debit = Number(item.amount);
            totalCharges += debit;
            currentBalance += debit;
        }
        // Payments decrease balance
        else if (t === "payment" || t === "discount") {
            credit = Number(item.amount);
            totalPayments += credit;
            currentBalance -= credit;
        }
        // Refunds decrease total payments (money going back out to guest)
        else if (t === "refund") {
            credit = -Number(item.amount); // negative credit decreases total credit/payments
            totalPayments += credit;
            currentBalance -= credit; // subtracting negative increases balance
        }
        // Adjustments can be positive or negative
        else if (t === "adjustment") {
            const amt = Number(item.amount);
            if (amt > 0) {
                debit = amt;
                totalCharges += debit;
                currentBalance += debit;
            } else {
                credit = Math.abs(amt);
                totalPayments += credit;
                currentBalance -= credit;
            }
        }

        return { ...item, debit, credit, runningBalance: currentBalance };
    });

    const balance = totalCharges - totalPayments;

    let paymentStatus: "paid" | "partial" | "unpaid" | "refunded" = "unpaid";
    if (balance < 0) paymentStatus = "refunded";
    else if (balance === 0 && totalCharges > 0) paymentStatus = "paid";
    else if (balance === 0 && totalCharges === 0 && totalPayments === 0) paymentStatus = "unpaid";
    else if (balance > 0 && totalPayments > 0) paymentStatus = "partial";
    else if (balance > 0 && totalPayments <= 0) paymentStatus = "unpaid";
    else if (balance === 0) paymentStatus = "paid";

    return {
        total_charges: totalCharges,
        total_payments: totalPayments,
        balance,
        payment_status: paymentStatus,
        items: computedItems.reverse() // Return latest first for UI
    };
};

export function useFolio() {
    const hotelCtx = useHotel();
    const hotelId = hotelCtx.hotelId;
    const today = useMemo(() => localDateStr(), []);

    const [folios, setFolios] = useState<ReservationFolio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error] = useState<string | null>(null);

    const [listSearch, setListSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(today);
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

    // Advanced Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currencyFilter, setCurrencyFilter] = useState<string>("all");
    const [roomSearch, setRoomSearch] = useState("");

    const [selectedFolioId, setSelectedFolioId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const selectedFolio = useMemo(() => folios.find(f => f.id === selectedFolioId) || null, [folios, selectedFolioId]);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalCount, setTotalCount] = useState(0);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentType, setPaymentType] = useState<LedgerItemType>("payment");
    const [savingPayment, setSavingPayment] = useState(false);

    const [paymentCurrency, setPaymentCurrency] = useState<CurrencyType>("TRY");
    const [referenceNo, setReferenceNo] = useState("");
    const [relatedPaymentId, setRelatedPaymentId] = useState("");
    const [paymentExchangeRate, setPaymentExchangeRate] = useState<number>(1);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [itemToCancel, setItemToCancel] = useState<{ folioId: string, item: FolioItem } | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, string>>({});
    const [userRole, setUserRole] = useState<string>("RECEPTION");

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };



    const loadUsers = useCallback(async () => {
        if (!hotelId) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("users")
                .select("id, full_name, role")
                .eq("hotel_id", hotelId);

            if (error) throw error;
            const map: Record<string, string> = {};
            (data || []).forEach((u) => {
                map[u.id] = u.full_name || u.id;
                if (user && u.id === user.id) {
                    setUserRole(u.role);
                }
            });
            setUsersMap(map);
        } catch (err) {
            console.error("loadUsers error:", err);
        }
    }, [hotelId]);

    const loadAuditLogs = useCallback(async () => {
        if (!selectedFolioId || !hotelId) {
            setAuditLogs([]);
            return;
        }
        try {
            const { data, error: fetchError } = await supabase
                .from("folio_audit_logs")
                .select("*")
                .eq("folio_id", selectedFolioId)
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            // Map names manually using usersMap
            const mapped = (data || []).map(log => ({
                ...log,
                actor_name: usersMap[log.actor_id] || log.actor_id || "Sistem"
            }));

            setAuditLogs(mapped);
        } catch (err) {
            console.error("loadAuditLogs error:", err);
        }
    }, [selectedFolioId, hotelId, usersMap]);

    const loadFolios = useCallback(async () => {
        if (!hotelId) return;
        setLoading(true);
        try {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from("reservations")
                .select(`
                    id, check_in_date, check_out_date, status, adults_count, children_count,
                    estimated_amount, currency,
                    guest:guests(full_name, phone),
                    room:rooms(room_number),
                    items:folio_transactions(*)
                `, { count: "exact" })
                .eq("hotel_id", hotelId);

            // Filtering
            const t = listSearch.trim();
            const r = roomSearch.trim();

            if (t) {
                // PostgREST filtering for joined tables
                query = query.filter("guest.full_name", "ilike", `%${t}%`);
            }
            if (r) {
                query = query.filter("room.room_number", "ilike", `%${r}%`);
            }
            if (statusFilter !== "all") {
                // This is tricky since payment_status is computed client-side in the current model
                // For now we keep fetching and let the compute logic handle it, 
                // but pagination is strictly on the base list.
            }

            const { data, count, error: fetchError } = await query
                .order("check_in_date", { ascending: false })
                .range(from, to);

            if (count !== null) setTotalCount(count);

            console.log("loadFolios fetch result:", { dataCount: data?.length, error: fetchError });
            if (fetchError) throw fetchError;

            interface FolioSupabaseRow {
                id: string;
                check_in_date: string;
                check_out_date: string;
                status: string;
                adults_count: number | null;
                children_count: number | null;
                estimated_amount: number | null;
                currency: string | null;
                guest: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null;
                room: { room_number: string | null } | { room_number: string | null }[] | null;
                items: {
                    id: string;
                    amount: number;
                    currency: string | null;
                    item_type: string | null;
                    description: string | null;
                    created_at: string | null;
                    created_by: string | null;
                    source: string | null;
                    metadata: Record<string, unknown> | null;
                }[];
            }

            const mapped = (data || []).map((res: unknown) => {
                const resRow = res as FolioSupabaseRow;
                const items = (resRow.items || []).map((item): FolioItem => ({
                    id: item.id,
                    amount: Number(item.amount) || 0,
                    currency: (item.currency || "TRY") as CurrencyType,
                    type: (item.item_type || "room_charge") as LedgerItemType,
                    description: item.description,
                    created_at: item.created_at || new Date().toISOString(),
                    created_by: item.created_by ? usersMap[item.created_by] || item.created_by : "System",
                    source: (item.source || "ui") as "system" | "ui" | "integration",
                    metadata: item.metadata || {}
                }));

                const hasAccommodation = items.some((i: FolioItem) => i.type === "room_charge" || i.type === "accommodation" || i.type === "charge");
                const resAmount = Number(resRow.estimated_amount || 0);
                if (!hasAccommodation && resAmount > 0) {
                    items.push({
                        id: `virtual-acc-${resRow.id}`,
                        amount: resAmount,
                        currency: (resRow.currency || "TRY") as CurrencyType,
                        type: "accommodation",
                        description: "Konaklama Ücreti (Sistem Beklentisi)",
                        created_at: resRow.check_in_date || new Date().toISOString(),
                        created_by: "Sistem",
                        source: "system",
                        metadata: { virtual: true }
                    });
                }

                const finances = computeFolioFinances(items);
                const guestCount = (resRow.adults_count || 0) + (resRow.children_count || 0);

                const guestInfo = Array.isArray(resRow.guest) ? resRow.guest[0] : resRow.guest;
                const roomInfo = Array.isArray(resRow.room) ? resRow.room[0] : resRow.room;

                return {
                    id: resRow.id,
                    guest_name: guestInfo?.full_name || "İsimsiz",
                    room_number: roomInfo?.room_number || "---",
                    check_in_date: resRow.check_in_date,
                    check_out_date: resRow.check_out_date,
                    currency: "TRY" as CurrencyType,
                    guest_count: guestCount,
                    ...finances
                };
            });

            setFolios(mapped);
        } catch (err: unknown) {
            console.error("loadFolios error string:", String(err));
            console.error("loadFolios error JSON:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
        } finally {
            setLoading(false);
        }
    }, [hotelId, usersMap, page, pageSize, listSearch, roomSearch, statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        loadFolios();
    }, [selectedDate, viewMode, loadFolios, usersMap, page, pageSize, listSearch, roomSearch, statusFilter]);

    useEffect(() => {
        if (isDrawerOpen) {
            loadAuditLogs();
        }
    }, [isDrawerOpen, selectedFolioId, loadAuditLogs]);

    const filteredFolios = useMemo(() => {
        return folios; // Server side filtering preferred, but kept for computed fields if necessary
    }, [folios]);

    const stats = useMemo(() => {
        let totalRev = 0;
        let outBalance = 0;
        let deposits = 0;
        let refunds = 0;
        let txCount = 0;

        filteredFolios.forEach(f => {
            outBalance += f.balance > 0 ? f.balance : 0;
            f.items.forEach(i => {
                txCount++;
                if (i.debit) totalRev += i.debit;
                if (i.type === 'payment' && i.credit) deposits += i.credit;
                if (i.type === 'refund' && i.debit) refunds += i.debit;
            });
        });

        return {
            totalRevenue: totalRev,
            outstandingBalance: outBalance,
            depositsCollected: deposits,
            refundAmount: refunds,
            transactionsCount: txCount,
            pendingApprovalSum: 0,
            pendingApprovalCount: 0,
        };
    }, [filteredFolios]);

    const openDrawer = (folioId: string) => {
        setSelectedFolioId(folioId);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedFolioId(null), 300);
    };

    const handleAddFolioItem = async (guestIdOverride?: string) => {
        const targetFolioId = guestIdOverride || selectedFolioId;
        if (!targetFolioId || !paymentAmount || !hotelId) return;

        // Role Gating
        if (userRole === "RECEPTION" && (paymentType === "refund")) {
            showToast("İade yetkiniz bulunmamaktadır.", "error");
            return;
        }

        setSavingPayment(true);

        const amt = Number(paymentAmount);
        const description = paymentNote || `${paymentType.toUpperCase()} - ${paymentMethod}`;

        try {
            const { error: insertError } = await supabase.from("folio_transactions").insert([{
                hotel_id: hotelId,
                reservation_id: targetFolioId,
                amount: amt,
                currency: paymentCurrency,
                currency_code: paymentCurrency,
                type: paymentType,
                item_type: paymentType,
                description: description,
                source: "ui",
                metadata: {
                    note: paymentNote || null,
                    method: paymentType === "payment" || paymentType === "refund" ? paymentMethod : null,
                    reference_no: referenceNo || null
                }
            }]);

            if (insertError) throw insertError;

            await loadFolios();
            setIsPaymentModalOpen(false);
            setPaymentAmount("");
            setPaymentNote("");
            setReferenceNo("");
            setPaymentType("payment");
            showToast("İşlem başarıyla kaydedildi.", "success");
            showToast("İşlem başarıyla kaydedildi.", "success");
        } catch (err: unknown) {
            const error = err as Error;
            console.error("handleAddFolioItem error:", error.message || err);
            const msg = error.message || (typeof err === "string" ? err : "İşlem kaydedilemedi.");
            showToast(msg, "error");
        } finally {
            setSavingPayment(false);
        }
    };

    const submitGlobalFinanceItem = async (folioId: string, amt: number, pCurrency: CurrencyType, pType: LedgerItemType, pMethod: string, pNote: string, pRef: string) => {
        if (!hotelId) return;
        setSavingPayment(true);
        const description = pNote || `${pType.toUpperCase()} - ${pMethod}`;

        try {
            const { error: insertError } = await supabase.from("folio_transactions").insert([{
                hotel_id: hotelId,
                reservation_id: folioId,
                amount: amt,
                currency: pCurrency,
                currency_code: pCurrency,
                type: pType,
                item_type: pType,
                description: description,
                source: "ui",
                metadata: {
                    note: pNote || null,
                    method: pMethod,
                    ref: pRef || null
                }
            }]);
            if (insertError) throw insertError;
            await loadFolios();
            showToast("İşlem kaydedildi.", "success");
            showToast("İşlem kaydedildi.", "success");
        } catch (err: unknown) {
            const error = err as Error;
            console.error("submitGlobalFinanceItem error:", error.message || err);
            const msg = error.message || "İşlem kaydedilemedi.";
            showToast(msg, "error");
        } finally {
            setSavingPayment(false);
        }
    };

    const requestCancelFolioItem = (folioId: string, item: FolioItem) => {
        setItemToCancel({ folioId, item });
    };

    const confirmCancelFolioItem = async () => {
        if (!hotelId || !itemToCancel) return;
        const { folioId, item } = itemToCancel;

        if (userRole === "RECEPTION") {
            showToast("İptal yetkiniz bulunmamaktadır.", "error");
            setItemToCancel(null);
            return;
        }

        try {
            const isCharge = !["payment", "discount", "refund"].includes(item.type);
            const adjustmentAmount = isCharge ? item.amount : item.amount; // always positive insert
            const adjustmentType = isCharge ? "refund" : "adjustment";

            const { error: insertError } = await supabase.from("folio_transactions").insert([{
                hotel_id: hotelId,
                reservation_id: folioId,
                amount: Math.abs(adjustmentAmount),
                currency: item.currency || "TRY",
                currency_code: item.currency || "TRY",
                type: adjustmentType,
                item_type: adjustmentType,
                description: `İPTAL (Correction): ${item.description}`,
                source: "ui",
                metadata: { corrected_item_id: item.id }
            }]);

            if (insertError) throw insertError;

            await loadFolios();
            showToast("İşlem düzeltme kaydı ile iptal edildi.", "success");
        } catch (err: unknown) {
            console.error("confirmCancelFolioItem error:", (err as Error).message || err);
            const msg = (err as Error).message || "İşlem iptal edilemedi.";
            showToast(msg, "error");
        } finally {
            setItemToCancel(null);
        }
    };

    return {
        today, listSearch, setListSearch, selectedDate, setSelectedDate, viewMode, setViewMode,
        roomSearch, setRoomSearch, statusFilter, setStatusFilter, currencyFilter, setCurrencyFilter,
        folios: filteredFolios, loading, error, stats,
        page, setPage, pageSize, setPageSize, totalCount,
        isDrawerOpen, selectedFolio, openDrawer, closeDrawer,
        isPaymentModalOpen, setIsPaymentModalOpen,
        paymentAmount, setPaymentAmount, paymentMethod, setPaymentMethod,
        paymentNote, setPaymentNote, paymentType, setPaymentType,
        paymentCurrency, setPaymentCurrency,
        paymentExchangeRate, setPaymentExchangeRate,
        referenceNo, setReferenceNo,
        relatedPaymentId, setRelatedPaymentId,
        savingPayment, handleAddFolioItem, submitGlobalFinanceItem,
        toast, itemToCancel, setItemToCancel, requestCancelFolioItem, confirmCancelFolioItem,
        auditLogs, userRole
    };
}
