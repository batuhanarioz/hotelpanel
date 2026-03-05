import { z } from "zod";
import { UserRole } from "@/types/database";

export const createUserSchema = z.object({
    email: z.string().email("Geçersiz e-posta adresi"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    fullName: z.string().optional().nullable(),
    role: z.nativeEnum(UserRole).default(UserRole.RECEPTION),
    hotelId: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    financialLimit: z.number().optional().nullable().default(0),
    maxRefundAmount: z.number().optional().nullable().default(1000),
    maxDiscountPercentage: z.number().optional().nullable().default(10),
});

export const updateUserSchema = z.object({
    id: z.string().min(1, "ID zorunludur"),
    fullName: z.string().optional(),
    role: z.nativeEnum(UserRole).optional(),
    department: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    financialLimit: z.number().optional().nullable(),
    maxRefundAmount: z.number().optional().nullable(),
    maxDiscountPercentage: z.number().optional().nullable(),
});


export const deleteUserSchema = z.object({
    id: z.string().min(1, "ID zorunludur"),
});

export const resetPasswordSchema = z.object({
    id: z.string().min(1, "ID zorunludur"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});
