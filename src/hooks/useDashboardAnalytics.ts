"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useHotel } from "@/app/context/HotelContext";
import { localDateStr } from "@/lib/dateUtils";

export type DayRevenue = {
    date: string; // "03 Mar"
    revenue: number;
};

export type ChannelEntry = {
    name: string;
    count: number;
    pct: number;
};

export interface DashboardAnalyticsData {
    todayRevenue: number;
    mtdRevenue: number;
    adr: number;
    openBalance: number;
    cancellationRate7d: number; // 0–100
    revenueTrend7d: DayRevenue[];
    topChannels: ChannelEntry[];
    oooCount: number;
    revenueLossEstimate: number; // oooCount * avg nightly rate
    occupiedCount: number;
    totalRooms: number;
    loading: boolean;
}

const CHANNEL_LABELS: Record<string, string> = {
    whatsapp: "WhatsApp",
    web: "Web",
    phone: "Telefon",
    walk_in: "Yüz Yüze",
    booking: "Booking.com",
    expedia: "Expedia",
    direct: "Direkt",
};

function dateRange(daysBack: number): { start: string; end: string } {
    const end = new Date();
    end.setDate(end.getDate() + 1);
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    return { start: localDateStr(start), end: localDateStr(end) };
}

export function useDashboardAnalytics(): DashboardAnalyticsData {
    const { hotelId } = useHotel();
    const [loading, setLoading] = useState(true);

    // Raw data
    const [reservations7d, setReservations7d] = useState<{
        check_in_date: string;
        check_out_date: string;
        status: string;
        channel: string | null;
        room_id: string | null;
    }[]>([]);

    const [folioItems7d, setFolioItems7d] = useState<{
        amount: number;
        reservation_id: string | null;
        created_at: string;
        item_type: string | null;
    }[]>([]);

    const [folioItemsMtd, setFolioItemsMtd] = useState<{
        amount: number;
        base_amount: number;
        reservation_id: string | null;
        item_type: string | null;
        status: string;
    }[]>([]);

    const [unpaidFolios, setUnpaidFolios] = useState<{ balance: number }[]>([]);
    const [oooCount, setOooCount] = useState(0);
    const [totalRooms, setTotalRooms] = useState(0);
    const [occupiedCount, setOccupiedCount] = useState(0);

    useEffect(() => {
        if (!hotelId) return;

        const load = async () => {
            setLoading(true);
            const today = localDateStr();
            const { start: start7d, end: end7d } = dateRange(7);

            // MTD: from 1st of current month
            const now = new Date();
            const mtdStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

            const [resRes, folio7dRes, folioMtdRes, roomsRes, oooRes, folioOpenRes] = await Promise.all([
                // Last 7d reservations
                supabase
                    .from("reservations")
                    .select("check_in_date, check_out_date, status, channel, room_id")
                    .eq("hotel_id", hotelId)
                    .gte("check_in_date", start7d)
                    .lte("check_in_date", end7d),

                // Folio transactions last 7d
                supabase
                    .from("folio_transactions")
                    .select("amount, base_amount, reservation_id, created_at, item_type, status")
                    .eq("hotel_id", hotelId)
                    .eq("status", "posted")
                    .gte("created_at", start7d)
                    .lt("created_at", end7d)
                    .not("item_type", "in", '("cancellation", "payment", "refund", "discount")'),

                // Folio transactions MTD
                supabase
                    .from("folio_transactions")
                    .select("amount, base_amount, reservation_id, item_type, status")
                    .eq("hotel_id", hotelId)
                    .eq("status", "posted")
                    .gte("created_at", mtdStart)
                    .not("item_type", "in", '("cancellation", "payment", "refund", "discount")'),

                // Total rooms
                supabase
                    .from("rooms")
                    .select("id, status")
                    .eq("hotel_id", hotelId),

                // OOO rooms
                supabase
                    .from("rooms")
                    .select("id")
                    .eq("hotel_id", hotelId)
                    .eq("status", "out_of_order"),

                // Open balance: folios where balance > 0
                supabase
                    .from("folios")
                    .select("balance")
                    .eq("hotel_id", hotelId)
                    .gt("balance", 0),
            ]);

            setReservations7d(resRes.data || []);

            interface RawFolioEntry {
                amount: number;
                base_amount?: number;
                reservation_id: string | null;
                created_at: string;
                item_type: string | null;
                status: string;
            }

            setFolioItems7d(
                (folio7dRes.data as unknown as RawFolioEntry[] || []).map((f) => ({
                    amount: Number(f.base_amount || f.amount),
                    reservation_id: f.reservation_id,
                    created_at: f.created_at,
                    item_type: f.item_type
                }))
            );
            setFolioItemsMtd(
                (folioMtdRes.data as unknown as RawFolioEntry[] || []).map((f) => ({
                    amount: Number(f.base_amount || f.amount),
                    base_amount: Number(f.base_amount || f.amount),
                    reservation_id: f.reservation_id,
                    item_type: f.item_type,
                    status: f.status
                }))
            );

            // Rooms
            const allRooms = roomsRes.data || [];
            setTotalRooms(allRooms.length);
            setOooCount((oooRes.data || []).length);
            setUnpaidFolios((folioOpenRes.data || []).map((f) => ({ balance: Number(f.balance) })));

            // Occupied today (checked_in)
            const todayRes = await supabase
                .from("reservations")
                .select("id")
                .eq("hotel_id", hotelId)
                .eq("status", "checked_in")
                .lte("check_in_date", today)
                .gte("check_out_date", today);

            setOccupiedCount((todayRes.data || []).length);
            setLoading(false);
        };

        load();
    }, [hotelId]);

    const computed = useMemo((): Omit<DashboardAnalyticsData, "loading"> => {
        const today = localDateStr();

        // Today revenue
        const todayRevenue = folioItems7d
            .filter((f) => f.created_at?.startsWith(today))
            .reduce((s, f) => s + f.amount, 0);

        // MTD revenue
        const mtdRevenue = folioItemsMtd.reduce((s, f) => s + f.amount, 0);

        // ADR: mtdRevenue / occupied room nights this month (estimate using reservations?)
        const mtdOccupiedNights = reservations7d
            .filter((r) => r.status === "checked_in" || r.status === "checked_out")
            .reduce((s, r) => {
                const ci = new Date(r.check_in_date + "T00:00:00");
                const co = new Date(r.check_out_date + "T00:00:00");
                const nights = Math.max(0, Math.round((co.getTime() - ci.getTime()) / 86400000));
                return s + nights;
            }, 0);

        const adr = mtdOccupiedNights > 0 ? Math.round(mtdRevenue / mtdOccupiedNights) : 0;

        // Open balance
        const openBalance = unpaidFolios.reduce((s, f) => s + f.balance, 0);

        // 7-day cancellation rate
        const total7d = reservations7d.length;
        const cancelled7d = reservations7d.filter(
            (r) => r.status === "cancelled" || r.status === "no_show"
        ).length;
        const cancellationRate7d =
            total7d > 0 ? Math.round((cancelled7d / total7d) * 100) : 0;

        // Revenue trend: last 7 days by date
        const trendMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            trendMap[localDateStr(d)] = 0;
        }
        folioItems7d.forEach((f) => {
            const day = f.created_at?.slice(0, 10);
            if (day && trendMap[day] !== undefined) {
                trendMap[day] += f.amount;
            }
        });

        const revenueTrend7d: DayRevenue[] = Object.entries(trendMap).map(([dateStr, revenue]) => ({
            date: new Date(dateStr + "T00:00:00").toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "short",
            }),
            revenue,
        }));

        // Top channels
        const channelMap: Record<string, number> = {};
        reservations7d.forEach((r) => {
            const ch = r.channel || "direct";
            channelMap[ch] = (channelMap[ch] || 0) + 1;
        });
        const topChannels: ChannelEntry[] = Object.entries(channelMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([ch, count]) => ({
                name: CHANNEL_LABELS[ch] || ch,
                count,
                pct: total7d > 0 ? Math.round((count / total7d) * 100) : 0,
            }));

        // Revenue loss estimate (OOO × ADR)
        const revenueLossEstimate = oooCount * (adr || 0);

        return {
            todayRevenue,
            mtdRevenue,
            adr,
            openBalance,
            cancellationRate7d,
            revenueTrend7d,
            topChannels,
            oooCount,
            revenueLossEstimate,
            occupiedCount,
            totalRooms,
        };
    }, [folioItems7d, folioItemsMtd, reservations7d, unpaidFolios, oooCount, occupiedCount, totalRooms]);

    return { ...computed, loading };
}
