import { z } from "zod";

export const webAppointmentSchema = z.object({
    clinicSlug: z.string().min(1, "Otel bilgisi zorunludur"),
    fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    phone: z.string().min(1, "Telefon zorunludur"),
    preferredTime: z.string().optional().nullable(),
    notes: z.string().optional(),
});

export const internalReservationSchema = z.object({
    guest_id: z.string().uuid("Geçersiz misafir seçimi"),
    assigned_staff_id: z.string().uuid("Geçersiz personel seçimi").nullable(),
    check_in_date: z.string().min(1, "Başlangıç saati zorunludur"),
    check_out_date: z.string().min(1, "Bitiş saati zorunludur"),
    channel: z.enum(["web", "whatsapp", "phone", "walk_in", "instagram", "other"]),
    status: z.enum(["inquiry", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"]),
    board_type: z.string().min(1, "Konaklama türü zorunludur"),
    guest_note: z.string().optional().nullable(),
    room_number: z.string().optional().nullable(),
    room_id: z.string().uuid().nullable().optional(),
    internal_note: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    estimated_amount: z.number().nonnegative().nullable().optional(),
    adults_count: z.number().min(1).default(1),
    children_count: z.number().default(0),
    infants_count: z.number().default(0),
    nightly_rate: z.number().default(0),
    deposit_amount: z.number().default(0),
    payment_status: z.string().default("unpaid"),
    currency: z.string().default("TRY"),
    additional_guests: z.array(z.any()).default([]),
});

