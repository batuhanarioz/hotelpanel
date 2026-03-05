import { supabaseAdmin } from "./supabaseAdminClient";

/**
 * Sistemdeki kritik eylemleri veritabanına loglar.
 * @param hotelId Otel ID'si
 * @param userId Eylemi yapan kullanıcı ID'si
 * @param action Yapılan eylem (örn: "USER_CREATE", "PAYMENT_CANCEL")
 * @param details Eylem detayları (JSON objesi)
 * @param ipAddress Kullanıcının IP adresi
 */
export async function logActivity(
    hotelId: string | null,
    userId: string | null,
    action: string,
    module: string | null = null,
    affectedId: string | null = null,
    details: Record<string, unknown> | null = {},
    ipAddress: string | null = null
) {
    try {
        if (!hotelId) return;

        const { error } = await supabaseAdmin
            .from("activity_logs")
            .insert({
                hotel_id: hotelId,
                user_id: userId,
                action,
                module,
                affected_id: affectedId,
                details,
                ip_address: ipAddress
            });

        if (error) {
            console.error("Logger Error:", error.message);
        }
    } catch (err) {
        console.error("Activity Logger Exception:", err);
    }
}
