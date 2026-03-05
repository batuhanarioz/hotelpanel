import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { withAuth } from "@/lib/auth-middleware";

export const GET = withAuth(
    async (req, auth) => {
        const { searchParams } = new URL(req.url);
        let userId = searchParams.get("userId");
        const moduleFilter = searchParams.get("module");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "50");

        // Force self-only logs if not admin
        if (!auth.isAdmin && !auth.isSuperAdmin) {
            userId = auth.user.id;
        }

        let query = supabaseAdmin
            .from("activity_logs")
            .select(`
                id,
                user_id,
                action,
                module,
                affected_id,
                details,
                ip_address,
                created_at,
                users (
                    full_name,
                    email,
                    role
                )
            `)
            .order("created_at", { ascending: false })
            .limit(limit);

        // Multi-tenant Security
        if (!auth.isSuperAdmin) {
            query = query.eq("hotel_id", auth.hotelId);
        }

        if (userId) query = query.eq("user_id", userId);
        if (moduleFilter) query = query.eq("module", moduleFilter);
        if (startDate) query = query.gte("created_at", startDate);
        if (endDate) query = query.lte("created_at", endDate);

        const { data, error } = await query;

        if (error) {
            console.error("Activity Logs fetch error:", error);
            return NextResponse.json({
                error: error.message,
                details: error.details,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ logs: data });
    }
);
