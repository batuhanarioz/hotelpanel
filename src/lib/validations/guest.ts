import { z } from "zod";

export const guestSchema = z.object({
    full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır"),
    phone: z.string().min(10, "Geçerli bir telefon numarası giriniz").optional().nullable().or(z.literal("")),
    email: z.string().email("Geçersiz e-posta adresi").optional().nullable().or(z.literal("")),
    birth_date: z.string().optional().nullable().or(z.literal("")),
    nationality: z.string().optional().nullable().or(z.literal("")),
    id_type: z.enum(["TC", "PASSPORT"]).optional().nullable().default("TC"),
    identity_no: z.string().optional().nullable().or(z.literal("")),
    passport_number: z.string().optional().nullable().or(z.literal("")),
    is_vip: z.boolean().default(false),
    is_blacklist: z.boolean().default(false),
    blacklist_reason: z.string().optional().nullable().or(z.literal("")),
    marketing_consent: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    preferences_note: z.string().optional().nullable().or(z.literal("")),
    allergies: z.string().optional().nullable().or(z.literal("")),
    identity_photo_url: z.string().url("Geçerli bir URL giriniz").optional().nullable().or(z.literal("")),
});


export const updateGuestSchema = guestSchema.partial();
