import { useState, useEffect, useMemo, useCallback } from "react";
import { parseISO } from "date-fns";
import * as Sentry from "@sentry/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { localDateStr } from "@/lib/dateUtils";
import { DayOfWeek, ReservationChannel, ReservationStatus } from "@/types/database";
import { useHotel } from "@/app/context/HotelContext";
import { CHANNEL_LABEL_MAP } from "@/constants/dashboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getReservationsForDate, getStaff, getRooms } from "@/lib/api";
import { guestSchema } from "@/lib/validations/guest";
import { internalReservationSchema } from "@/lib/validations/reservation";

export type CalendarReservation = {
    id: string;
    date: string;
    startHour: number;
    startMinute: number;
    durationMinutes: number;
    guestName: string;
    phone: string;
    email: string;
    birthDate?: string;
    assignedStaff: string;
    assignedStaffId: string | null;
    channel: string;
    boardType: string;
    status: ReservationStatus;
    dbStatus: ReservationStatus;
    guestNote?: string;
    internalNote?: string;
    roomNumber?: string;
    reservationNumber?: string;
    guestPreferences?: string | null;
    guestPassport?: string | null;

    tags?: string[];
    sourceConversationId?: string;
    sourceMessageId?: string;
    estimatedAmount?: string;
    roomId?: string | null;
    checkInDate?: string;
    checkOutDate?: string;
    guestId: string;
    adults_count?: number;
    children_count?: number;
    infants_count?: number;
    payment_status?: string;
    nightly_rate?: number;
    deposit_amount?: number;
    total_amount?: number;
    currency?: string;
    additional_guests?: { fullName: string; identityNo: string; birthDate: string; identityPhotoUrl: string; phone: string; storagePath?: string }[];
    identityPhotoUrl?: string | null;
    noShowCandidate?: boolean;
    noShowCandidateAt?: string;
    updated_at?: string;
};

export interface ReservationFormState {
    guestName: string;
    phone: string;
    email: string;
    birthDate: string;
    identityNo: string;
    assignedStaff: string;
    channel: string;
    nightsCount: number;
    boardType: string;
    status: ReservationStatus;
    guestNote: string;
    roomNumber: string;
    roomId: string;
    statusResult?: string;
    preferences: string;
    passport: string;
    tags: string;
    conversationId: string;
    messageId: string;
    estimatedAmount: string;
    result: string;
    internalNote: string;
    adultsCount: number;
    childrenCount: number;
    infantsCount: number;
    additionalGuests: { fullName: string; identityNo: string; birthDate: string; identityPhotoUrl: string; phone: string; storagePath?: string }[];
    nightlyRate: number;
    totalAmount: number;
    depositAmount: number;
    paymentStatus: string;
    currency: string;
    identityPhotoUrl: string;
    storagePath?: string;
}

export interface GuestSearchResult {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    birth_date: string | null;
    preferences_note: string | null;
    passport_number: string | null;
}

const JS_DAY_TO_KEY: DayOfWeek[] = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export function useReservationManagement(initialData?: {
    reservations: CalendarReservation[];
    hotelId?: string;
    slug?: string;
    endDate?: string;
}) {
    const hotelCtx = useHotel();
    const queryClient = useQueryClient();
    const today = useMemo(() => localDateStr(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<CalendarReservation | null>(null);
    const [formTime, setFormTime] = useState<string>("");
    const [formDate, setFormDate] = useState<string>(today);

    // React Query for Reservations
    const effectiveHotelId = initialData?.hotelId || hotelCtx.hotelId;

    const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
        queryKey: ["reservations", selectedDate, initialData?.endDate, effectiveHotelId],
        queryFn: () => getReservationsForDate(selectedDate, effectiveHotelId || "", initialData?.endDate),
        initialData: (selectedDate === today && !initialData?.endDate && initialData?.reservations?.length) ? initialData.reservations : undefined,
        enabled: !!effectiveHotelId,
    });

    const { data: roomsData = [] } = useQuery({
        queryKey: ["rooms", effectiveHotelId],
        queryFn: () => getRooms(effectiveHotelId || ""),
        enabled: !!effectiveHotelId,
    });

    const rooms = roomsData || [];

    // React Query for Staff
    const { data: staffData = [] } = useQuery({
        queryKey: ["staff", effectiveHotelId],
        queryFn: () => getStaff(effectiveHotelId || ""),
        enabled: !!effectiveHotelId,
    });

    const { data: roomBlocks = [] } = useQuery({
        queryKey: ["roomBlocks", effectiveHotelId],
        queryFn: async () => {
            if (!effectiveHotelId) return [];
            const { data } = await supabase.from("room_blocks").select("*").eq("hotel_id", effectiveHotelId);
            return data || [];
        },
        enabled: !!effectiveHotelId,
    });

    const staffMembers = useMemo(() => ["", ...staffData.map((d: { full_name: string | null }) => d.full_name || "")], [staffData]);
    const staffList = staffData as { id: string; full_name: string | null }[];



    const [guestSearch, setGuestSearch] = useState("");
    const [guestSearchResults, setGuestSearchResults] = useState<GuestSearchResult[]>([]);
    const [guestSearchLoading, setGuestSearchLoading] = useState(false);
    const [selectedGuestId, setSelectedGuestId] = useState<string>("");
    const [duplicateGuest, setDuplicateGuest] = useState<GuestSearchResult | null>(null);

    const [form, setForm] = useState<ReservationFormState>({
        guestName: "",
        phone: "",
        email: "",
        birthDate: "",
        identityNo: "",
        assignedStaff: "",
        channel: "web",
        nightsCount: 1,
        boardType: "ROOM_ONLY",
        status: "confirmed" as ReservationStatus,
        guestNote: "",
        roomNumber: "",
        roomId: "",
        preferences: "",
        passport: "",

        tags: "",
        conversationId: "",
        messageId: "",
        estimatedAmount: "",
        result: "" as "" | "CHECKED_IN" | "CANCELLED",
        internalNote: "",
        adultsCount: 1,
        childrenCount: 0,
        infantsCount: 0,
        additionalGuests: [],
        nightlyRate: 0,
        totalAmount: 0,
        depositAmount: 0,
        paymentStatus: "unpaid",
        currency: hotelCtx.defaultCurrency || "TRY",
        identityPhotoUrl: "",
        storagePath: "",
    });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadingGuestIndex, setUploadingGuestIndex] = useState<number | null>(null); // null means main guest

    const [guestMatchInfo, setGuestMatchInfo] = useState<string | null>(null);
    const [isNewGuest, setIsNewGuest] = useState(true);
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);
    const [matchedGuestPreferences, setMatchedGuestPreferences] = useState<string | null>(null);
    const [matchedGuestPassport, setMatchedGuestPassport] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Enterprise States
    const [isCompact, setIsCompact] = useState(false);
    const [groupingMode, setGroupingMode] = useState<'none' | 'floor' | 'type'>('none');
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = useCallback((groupId: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) next.delete(groupId);
            else next.add(groupId);
            return next;
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditing(null);
        setForm({
            guestName: "", phone: "", email: "", birthDate: "", identityNo: "",
            assignedStaff: staffMembers.length > 1 ? staffMembers[1] : "", channel: "web", nightsCount: 1,
            boardType: "ROOM_ONLY", status: "confirmed", guestNote: "", roomNumber: "", roomId: "",
            preferences: "", passport: "", tags: "", conversationId: "", messageId: "",
            estimatedAmount: "", result: "", internalNote: "",
            adultsCount: 1, childrenCount: 0, infantsCount: 0, additionalGuests: [],
            nightlyRate: 0, totalAmount: 0, depositAmount: 0, paymentStatus: "unpaid",
            currency: hotelCtx.defaultCurrency || "TRY",
            identityPhotoUrl: "",
            storagePath: "",
        });
        setGuestSearch("");
        setSelectedGuestId("");
        setDuplicateGuest(null);
        setConflictWarning(null);
        setGuestMatchInfo(null);
        setMatchedGuestPreferences(null);
        setMatchedGuestPassport(null);
    }, [staffMembers, hotelCtx.defaultCurrency]);

    const handleFileUpload = async (file: File, guestIndex?: number) => {
        if (!hotelCtx.hotelId) return null;
        setIsUploading(true);
        if (guestIndex !== undefined) setUploadingGuestIndex(guestIndex);
        else setUploadingGuestIndex(null);

        try {
            // Ensure we have a guest ID for the path
            let currentGuestId = selectedGuestId;
            if (!currentGuestId) {
                currentGuestId = crypto.randomUUID();
                setSelectedGuestId(currentGuestId);
            }

            const fileExt = file.name.split(".").pop();
            const fileUuid = crypto.randomUUID();
            // Format: guest-identities/{hotel_id}/{guest_id}/{uuid}.{ext}
            const fileName = `${hotelCtx.hotelId}/${currentGuestId}/${fileUuid}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("guest-identities")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("guest-identities")
                .getPublicUrl(fileName);

            if (guestIndex !== undefined) {
                setForm(prev => {
                    const newGuests = [...prev.additionalGuests];
                    if (newGuests[guestIndex]) {
                        newGuests[guestIndex] = {
                            ...newGuests[guestIndex],
                            identityPhotoUrl: publicUrl,
                            storagePath: fileName
                        };
                    }
                    return { ...prev, additionalGuests: newGuests };
                });
            } else {
                setForm(prev => ({ ...prev, identityPhotoUrl: publicUrl, storagePath: fileName }));
            }
            return publicUrl;
        } catch (error: unknown) {
            const err = error as Error;
            alert("Dosya yükleme hatası: " + err.message);
            return null;
        } finally {
            setIsUploading(false);
            setUploadingGuestIndex(null);
        }
    };

    useEffect(() => {
        const totalGuests = form.adultsCount + form.childrenCount;
        const requiredAdditional = Math.max(0, totalGuests - 1);

        if (form.additionalGuests.length !== requiredAdditional) {
            setForm(prev => {
                const current = [...prev.additionalGuests];
                if (current.length < requiredAdditional) {
                    // Add more
                    while (current.length < requiredAdditional) {
                        current.push({ fullName: "", identityNo: "", birthDate: "", identityPhotoUrl: "", phone: "", storagePath: "" });
                    }
                } else {
                    // Truncate
                    current.length = requiredAdditional;
                }
                return { ...prev, additionalGuests: current };
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.adultsCount, form.childrenCount]);

    useEffect(() => {
        const searchGuests = async () => {
            if (guestSearch.length < 2) {
                setGuestSearchResults([]);
                return;
            }
            setGuestSearchLoading(true);
            const { data } = await supabase.from("guests").select("id, full_name, phone, email, birth_date, preferences_note, passport_number").or(`full_name.ilike.%${guestSearch}%,phone.ilike.%${guestSearch}%`).limit(10);
            setGuestSearchResults(data || []);
            setGuestSearchLoading(false);
        };
        const timer = setTimeout(searchGuests, 300);
        return () => clearTimeout(timer);
    }, [guestSearch]);

    useEffect(() => {
        const checkDuplicate = async () => {
            const cleanPhone = form.phone.replace(/\D/g, "");
            if (cleanPhone.length >= 10 && !selectedGuestId) {
                const { data } = await supabase
                    .from("guests")
                    .select("id, full_name, phone, email, birth_date, preferences_note, passport_number")
                    .ilike("phone", `%${cleanPhone}%`)
                    .limit(1);
                setDuplicateGuest(data?.[0] || null);
            } else {
                setDuplicateGuest(null);
            }
        };
        const timer = setTimeout(checkDuplicate, 500);
        return () => clearTimeout(timer);
    }, [form.phone, selectedGuestId]);

    const openNew = (date?: string, time?: string, roomId?: string, roomNumber?: string) => {
        setEditing(null);
        setFormDate(date || selectedDate);
        setFormTime(time || "12:00");
        setForm({
            guestName: "", phone: "", email: "", birthDate: "", identityNo: "",
            assignedStaff: staffMembers.length > 1 ? staffMembers[1] : "", channel: "web", nightsCount: 1,
            boardType: "ROOM_ONLY", status: "confirmed", guestNote: "",
            roomNumber: roomNumber || "",
            roomId: roomId || "",
            preferences: "", passport: "", tags: "", conversationId: "", messageId: "",
            estimatedAmount: "", result: "", internalNote: "",
            adultsCount: 1, childrenCount: 0, infantsCount: 0, additionalGuests: [],
            nightlyRate: 0, totalAmount: 0, depositAmount: 0, paymentStatus: "unpaid",
            currency: hotelCtx.defaultCurrency || "TRY",
            identityPhotoUrl: "",
            storagePath: "",
        });
        setSelectedGuestId("");
        setIsNewGuest(true);
        setGuestMatchInfo(null);
        setMatchedGuestPreferences(null);
        setMatchedGuestPassport(null);
        setModalOpen(true);
    };

    const openEdit = (appt: CalendarReservation) => {
        setEditing(appt);
        setFormDate(appt.date);
        setFormTime(`${appt.startHour.toString().padStart(2, "0")}:${appt.startMinute.toString().padStart(2, "0")}`);
        setForm({
            guestName: appt.guestName,
            phone: appt.phone,
            email: appt.email,
            birthDate: appt.birthDate || "",
            identityNo: "",
            assignedStaff: appt.assignedStaff,
            channel: appt.channel,
            nightsCount: appt.checkInDate && appt.checkOutDate
                ? Math.round((new Date(appt.checkOutDate).getTime() - new Date(appt.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                : 1,
            boardType: appt.boardType,
            status: appt.dbStatus,
            guestNote: appt.guestNote || "",
            roomNumber: appt.roomNumber || "",
            roomId: appt.roomId || "",
            preferences: appt.guestPreferences || "",
            passport: appt.guestPassport || "",
            tags: appt.tags?.join(", ") || "",
            conversationId: appt.sourceConversationId || "",
            messageId: appt.sourceMessageId || "",
            estimatedAmount: appt.estimatedAmount?.toString() || "",
            result: "",
            internalNote: appt.internalNote || "",
            adultsCount: (appt as Record<string, unknown>).adults_count as number ?? 1,
            childrenCount: (appt as Record<string, unknown>).children_count as number ?? 0,
            infantsCount: (appt as Record<string, unknown>).infants_count as number ?? 0,
            additionalGuests: (appt as Record<string, unknown>).additional_guests as { fullName: string; identityNo: string; birthDate: string; identityPhotoUrl: string; phone: string }[] ?? [],
            nightlyRate: (appt as Record<string, unknown>).nightly_rate as number ?? 0,
            totalAmount: (appt as Record<string, unknown>).estimated_amount ? Number((appt as Record<string, unknown>).estimated_amount) : 0,
            depositAmount: (appt as Record<string, unknown>).deposit_amount as number ?? 0,
            paymentStatus: (appt as Record<string, unknown>).payment_status as string ?? "unpaid",
            currency: appt.currency || hotelCtx.defaultCurrency || "TRY",
            identityPhotoUrl: appt.identityPhotoUrl || "",
            storagePath: "",
        });
        setSelectedGuestId(appt.guestId);
        setIsNewGuest(false);
        setGuestMatchInfo("Mevcut misafir baz alındı.");
        setMatchedGuestPreferences(appt.guestPreferences || null);
        setMatchedGuestPassport(appt.guestPassport || null);
        setModalOpen(true);
    };

    useEffect(() => {
        const checkAvailability = async () => {
            if (!form.roomId || !formDate || !form.nightsCount || !hotelCtx.hotelId) {
                setConflictWarning(null);
                return;
            }

            const [h, m] = (formTime || "12:00").split(":").map(Number);
            const startStr = `${formDate}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00+03:00`;
            const startDate = new Date(startStr);
            const endDate = new Date(startDate.getTime() + form.nightsCount * 24 * 60 * 60 * 1000);
            const endStr = endDate.toISOString();

            try {
                const { data, error } = await supabase.rpc('check_room_availability', {
                    p_hotel_id: hotelCtx.hotelId,
                    p_room_id: form.roomId,
                    p_check_in_at: startStr,
                    p_check_out_at: endStr,
                    p_exclude_reservation_id: editing?.id || null
                });

                if (error) throw error;

                if (data && !data.available) {
                    if (data.has_critical_block) {
                        setConflictWarning("KRİTİK UYARI: Bu oda seçilen tarihlerde BAKIMDA veya KULLANIM DIŞI!");
                    } else {
                        setConflictWarning("UYARI: Bu oda seçilen tarihlerde başka bir rezervasyonla çakışıyor!");
                    }
                } else if (data && data.conflicts?.length > 0) {
                    // Overbooking allowed but there are conflicts
                    setConflictWarning("BİLGİ: Bu oda çakışıyor ancak overbooking'e izin veriliyor.");
                } else {
                    setConflictWarning(null);
                }
            } catch (err) {
                console.error("Availability check error:", err);
            }
        };
        const timer = setTimeout(checkAvailability, 500);
        return () => clearTimeout(timer);
    }, [form.roomId, formDate, formTime, form.nightsCount, editing, hotelCtx.hotelId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hotelCtx.hotelId) return;

        let guestId = selectedGuestId;
        if (!guestId) {
            // Validation
            const guestValidation = guestSchema.safeParse({
                full_name: form.guestName,
                phone: form.phone,
                email: form.email || null,
                birth_date: form.birthDate || null,
                identity_no: form.identityNo || null,
                preferences_note: form.preferences || null,
                passport_number: form.passport || null,
            });

            if (!guestValidation.success) {
                alert("Misafir bilgileri geçersiz: " + guestValidation.error.issues[0].message);
                return;
            }

            // Fix for duplicate guest issue: Check if guest with same identity_no exists for this hotel
            let existingGuestId: string | null = null;
            if (form.identityNo) {
                const { data: existing } = await supabase
                    .from("guests")
                    .select("id")
                    .eq("hotel_id", hotelCtx.hotelId)
                    .eq("identity_no", form.identityNo)
                    .eq("is_active", true)
                    .maybeSingle();
                if (existing) {
                    existingGuestId = existing.id;
                    // Update existing guest info to latest form data
                    await supabase.from("guests").update({
                        ...guestValidation.data,
                        identity_photo_url: form.identityPhotoUrl || null,
                    }).eq("id", existingGuestId);
                }
            }

            if (existingGuestId) {
                guestId = existingGuestId;
            } else {
                const { data: p, error: pError } = await supabase.from("guests").insert({
                    hotel_id: hotelCtx.hotelId,
                    identity_photo_url: form.identityPhotoUrl || null,
                    ...guestValidation.data
                }).select("id").single();
                if (pError) { alert("Misafir kaydı yapılamadı: " + pError.message); return; }
                guestId = p.id;
            }
        } else {
            // Update guest if info changed
            const guestValidation = guestSchema.partial().safeParse({
                full_name: form.guestName,
                phone: form.phone,
                email: form.email || null,
                birth_date: form.birthDate || null,
                preferences_note: form.preferences || null,
                passport_number: form.passport || null,
            });

            if (!guestValidation.success) {
                alert("Misafir bilgileri geçersiz: " + guestValidation.error.issues[0].message);
                return;
            }

            await supabase.from("guests").update({
                ...guestValidation.data,
                identity_photo_url: form.identityPhotoUrl || null,
            }).eq("id", guestId);
        }

        // Record document in guest_documents
        if (form.storagePath) {
            await supabase.from("guest_documents").insert({
                guest_id: guestId,
                hotel_id: hotelCtx.hotelId,
                document_type: 'ID',
                file_name: `Main Guest ID (${form.guestName})`,
                file_url: form.identityPhotoUrl,
                storage_path: form.storagePath
            });
        }

        // Record additional guests' documents
        if (form.additionalGuests?.length > 0) {
            const docInjections = form.additionalGuests
                .filter(g => g.storagePath)
                .map(g => ({
                    guest_id: guestId, // Linked to primary guest as they don't have separate profiles yet
                    hotel_id: hotelCtx.hotelId,
                    document_type: 'ID',
                    file_name: `Additional Guest ID (${g.fullName})`,
                    file_url: g.identityPhotoUrl,
                    storage_path: g.storagePath
                }));

            if (docInjections.length > 0) {
                await supabase.from("guest_documents").insert(docInjections);
            }
        }

        const [h, m] = (formTime || "12:00").split(":").map(Number);

        // Explicitly use +03:00 offset for Turkey time
        const checkInISO = `${formDate}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00+03:00`;

        const startDate = new Date(`${formDate}T${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`);
        const endDateObj = new Date(startDate.getTime() + form.nightsCount * 24 * 60 * 60 * 1000);

        const endYear = endDateObj.getFullYear();
        const endMonth = (endDateObj.getMonth() + 1).toString().padStart(2, '0');
        const endDay = endDateObj.getDate().toString().padStart(2, '0');
        const endHour = endDateObj.getHours().toString().padStart(2, '0');
        const endMin = endDateObj.getMinutes().toString().padStart(2, '0');
        const checkOutISO = `${endYear}-${endMonth}-${endDay}T${endHour}:${endMin}:00+03:00`;
        const drId = staffList.find(d => d.full_name === form.assignedStaff)?.id || null;

        const reverseChannelMap = Object.fromEntries(
            Object.entries(CHANNEL_LABEL_MAP).map(([k, v]) => [v, k])
        );

        const apptData = {
            guest_id: guestId,
            assigned_staff_id: drId,
            check_in_date: checkInISO,
            check_out_date: checkOutISO,
            channel: (reverseChannelMap[form.channel] || form.channel.toLowerCase()) as ReservationChannel,
            status: form.status as ReservationStatus,
            board_type: form.boardType,
            guest_note: form.guestNote || null,
            room_number: form.roomNumber || null,
            room_id: form.roomId || null,
            internal_note: form.internalNote || null,

            tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
            estimated_amount: form.totalAmount || null,
            adults_count: form.adultsCount,
            children_count: form.childrenCount,
            infants_count: form.infantsCount || 0,
            nightly_rate: form.nightlyRate || 0,
            deposit_amount: form.depositAmount || 0,
            payment_status: form.paymentStatus || "unpaid",
            currency: form.currency || "TRY",
            additional_guests: form.additionalGuests || [],
        };

        if (editing?.id && form.result === "CHECKED_IN") apptData.status = "checked_in" as ReservationStatus;
        if (editing?.id && form.result === "CANCELLED") apptData.status = "cancelled" as ReservationStatus;

        const apptValidation = internalReservationSchema.safeParse(apptData);
        if (!apptValidation.success) {
            setNotification({ message: "Rezervasyon bilgileri geçersiz: " + apptValidation.error.issues[0].message, type: 'error' });
            setTimeout(() => setNotification(null), 4000);
            return;
        }

        const payload = {
            hotel_id: hotelCtx.hotelId,
            ...apptValidation.data
        };

        // remove debug

        try {
            if (editing) {
                // Extract status to ensure it goes through the state machine RPC
                const { status: newStatus, ...updatePayload } = payload;
                const statusChanged = newStatus && newStatus !== editing.dbStatus;

                // 1. Update the generic fields via direct update
                const { error: updateError } = await supabase.from("reservations").update(updatePayload).eq("id", editing.id);
                if (updateError) {
                    console.error("Update error:", updateError);
                    Sentry.captureException(updateError, { tags: { section: "reservations", action: "update" } });
                    setNotification({ message: "Güncelleme hatası: " + updateError.message, type: 'error' });
                    setTimeout(() => setNotification(null), 4000);
                    return; // Don't close modal
                }

                // 2. If status was changed via the form, use the RPC 
                if (statusChanged) {
                    const { error: rpcError, data: rpcData } = await supabase.rpc('change_reservation_status', {
                        p_reservation_id: editing.id,
                        p_new_status: newStatus,
                        p_hotel_id: hotelCtx.hotelId,
                        p_expected_updated_at: editing.updated_at
                    });

                    if (rpcError || (rpcData && !rpcData.success)) {
                        const errMsg = rpcError?.message || rpcData?.message || "Bilinmeyen hata";
                        setNotification({ message: "Bilgiler güncellendi ancak Durum güncellenemedi: " + errMsg, type: 'error' });
                        setTimeout(() => setNotification(null), 5000);
                        return;
                    }
                }

                setNotification({ message: "Rezervasyon başarıyla güncellendi.", type: 'success' });
            } else {
                const { error, data: insertedData } = await supabase.from("reservations").insert(payload).select();
                if (error) {
                    console.error("Insert error:", error);
                    Sentry.captureException(error, { tags: { section: "reservations", action: "insert" } });
                    setNotification({ message: "Kayıt hatası: " + error.message, type: 'error' });
                    setTimeout(() => setNotification(null), 4000);
                    return; // Don't close modal
                }
                console.log("Insertion success result:", insertedData);
                setNotification({ message: "Rezervasyon başarıyla oluşturuldu.", type: 'success' });
            }

            closeModal();
            setTimeout(() => setNotification(null), 3000);
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
        } catch (e: unknown) {
            const error = e as Error;
            console.error("Unexpected error during submission:", error);
            setNotification({ message: "İşlem sırasında bir hata oluştu: " + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleExtend = async (res: CalendarReservation) => {
        // Increment check_out_date by 1 day
        const currentEnd = parseISO(res.checkOutDate!);
        const newEnd = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000);

        const { error } = await supabase
            .from("reservations")
            .update({ check_out_date: newEnd.toISOString() })
            .eq("id", res.id);

        if (error) {
            setNotification({ message: "Uzatma işlemi başarısız: " + error.message, type: 'error' });
        } else {
            setNotification({ message: "Rezervasyon 1 gün uzatıldı.", type: 'success' });
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
        }
        setTimeout(() => setNotification(null), 3000);
    };

    const handleMove = (res: CalendarReservation) => {
        // For now, moving just opens the edit modal so they can change room/date
        openEdit(res);
    };

    const selectedDayOfWeek = useMemo(() => {
        const d = new Date(selectedDate + "T12:00:00");
        return JS_DAY_TO_KEY[d.getDay()];
    }, [selectedDate]);

    const todaySchedule = hotelCtx.workingHours[selectedDayOfWeek];
    const isDayOff = !todaySchedule?.enabled;

    const workingHourSlots = useMemo(() => {
        const slots = new Set<number>();

        // Normal çalışma saatlerini ekle
        if (todaySchedule?.enabled) {
            const openHour = parseInt(todaySchedule.open.split(":")[0], 10);
            const closeHour = parseInt(todaySchedule.close.split(":")[0], 10);
            for (let i = openHour; i <= closeHour; i++) slots.add(i);
        }

        // Eklenenler
        reservations.forEach((a: CalendarReservation) => slots.add(a.startHour));

        // Eğer hiç slot yoksa (kapalı gün ve rezervasyon yok), boş döner
        if (slots.size === 0) return [];

        return Array.from(slots).sort((a, b) => a - b);
    }, [todaySchedule, reservations]);

    const handleCancel = async () => {
        if (!editing) return;
        try {
            const { error, data } = await supabase.rpc('change_reservation_status', {
                p_reservation_id: editing.id,
                p_new_status: 'cancelled',
                p_hotel_id: hotelCtx.hotelId,
                p_note: 'Silme yerine iptal işlemi (UI)'
            });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.message);

            closeModal();
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
        } catch (err: any) {
            console.error("Cancellation error:", err);
            setNotification({ message: "İptal hatası: " + (err.message || err.toString()), type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleHardDelete = async (id?: string) => {
        const targetId = id || editing?.id;
        if (!targetId) return;

        try {
            const { error } = await supabase.from("reservations").delete().eq("id", targetId);
            if (error) throw error;

            closeModal();
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_list"] });
            queryClient.invalidateQueries({ queryKey: ["reservations_stats"] });
        } catch (err: any) {
            console.error("Hard delete error:", err);
            setNotification({ message: "Silme hatası: " + (err.message || err.toString()), type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleUseDuplicate = () => {
        if (!duplicateGuest) return;
        const p = duplicateGuest;

        setSelectedGuestId(p.id);
        setForm(f => ({ ...f, guestName: p.full_name, phone: p.phone || "", email: p.email || "", birthDate: p.birth_date || "", identityPhotoUrl: (p as { identity_photo_url?: string }).identity_photo_url || "" }));

        setIsNewGuest(false);
        setGuestMatchInfo("Kayıtlı misafir eşleştirildi.");
        setMatchedGuestPreferences(p.preferences_note || null);
        setMatchedGuestPassport(p.passport_number || null);
        setDuplicateGuest(null);
    };

    return {
        today, selectedDate, setSelectedDate, reservations, modalOpen, setModalOpen, editing, setEditing,
        formTime, setFormTime, formDate, setFormDate, staffMembers, guestSearch, setGuestSearch, guestSearchResults,
        guestSearchLoading, selectedGuestId, setSelectedGuestId, duplicateGuest, form, setForm,
        guestMatchInfo, isNewGuest, conflictWarning, matchedGuestPreferences, matchedGuestPassport,
        openNew, openEdit, handleSubmit, handleCancel, handleHardDelete, handleUseDuplicate, closeModal,
        todaySchedule, isDayOff, workingHourSlots, reservationsLoading, rooms,
        isUploading, handleFileUpload, uploadingGuestIndex, roomBlocks,
        notification, handleExtend, handleMove,
        isCompact, setIsCompact,
        groupingMode, setGroupingMode,
        collapsedGroups, toggleGroup,
        queryClient
    };
}

