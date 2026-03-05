import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { localDateStr } from "@/lib/dateUtils";


export type ReservationRow = {
    id: string;
    check_in_date: string;
    check_out_date: string;
    status: string;
    channel: string | null;
    doctor_id: string | null;
    patient_id: string | null;
    board_type: string | null;
};

export type FolioRow = {
    id: string;
    amount: number;
    base_amount: number;
    reservation_id: string | null;
    created_at: string;
    item_type: string | null;
    status: string;
};

export type DoctorRow = { id: string; full_name: string };
export type DatePreset = "today" | "7d" | "30d" | "custom";
export type KPIDetailType = "completed" | "cancelled_noshow" | "unpaid" | null;


import { useHotel } from "@/app/context/HotelContext";

export const CHANNEL_LABELS: Record<string, string> = { whatsapp: "WhatsApp", web: "Web", phone: "Telefon", walk_in: "Yüz yüze" };

export function useReports() {
    const clinic = useHotel();
    const [preset, setPreset] = useState<DatePreset>("30d");
    const todayStr = useMemo(() => localDateStr(), []);
    const [customStart, setCustomStart] = useState(todayStr);
    const [customEnd, setCustomEnd] = useState(todayStr);
    const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
    const [kpiDetail, setKpiDetail] = useState<KPIDetailType>(null);
    const [reservations, setReservations] = useState<ReservationRow[]>([]);
    const [folios, setFolios] = useState<FolioRow[]>([]);
    const [doctors, setDoctors] = useState<DoctorRow[]>([]);
    const [guestFirstDates, setGuestFirstDates] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [guestNames, setGuestNames] = useState<Record<string, string>>({});

    const { rangeStart, rangeEnd, rangeLabel } = useMemo(() => {
        const now = new Date();
        let start: Date;
        let end: Date = new Date(now);
        end.setDate(end.getDate() + 1);

        switch (preset) {
            case "today": start = new Date(now); break;
            case "7d": start = new Date(now); start.setDate(start.getDate() - 6); break;
            case "30d": start = new Date(now); start.setDate(start.getDate() - 29); break;
            case "custom": start = new Date(customStart + "T00:00:00"); end = new Date(customEnd + "T00:00:00"); end.setDate(end.getDate() + 1); break;
            default: start = new Date(now); start.setDate(start.getDate() - 29);
        }
        const labels: Record<DatePreset, string> = { today: "Bugün", "7d": "Son 7 Gün", "30d": "Son 30 Gün", custom: `${new Date(customStart + "T00:00:00").toLocaleDateString("tr-TR")} – ${new Date(customEnd + "T00:00:00").toLocaleDateString("tr-TR")}` };
        return { rangeStart: localDateStr(start), rangeEnd: localDateStr(end), rangeLabel: labels[preset] };
    }, [preset, customStart, customEnd]);

    const loadData = useCallback(async () => {
        if (!clinic.hotelId) return;
        setLoading(true);
        const [resRes, folioRes, docRes] = await Promise.all([
            supabase.from("reservations").select("id, check_in_date, check_out_date, status, channel, doctor_id:assigned_staff_id, patient_id:guest_id, board_type").gte("check_in_date", rangeStart).lt("check_in_date", rangeEnd).order("check_in_date", { ascending: true }),
            supabase.from("folio_transactions").select("id, amount, base_amount, reservation_id, created_at, item_type, status").gte("created_at", rangeStart).lt("created_at", rangeEnd),
            supabase.from("users").select("id, full_name").eq("hotel_id", clinic.hotelId),
        ]);

        const resData = (resRes.data || []).map((r) => ({ ...r })) as unknown as ReservationRow[];
        setReservations(resData);

        const folioData = (folioRes.data || []).map((r: any) => ({ ...r, amount: Number(r.base_amount || r.amount) })) as unknown as FolioRow[];
        setFolios(folioData);
        setDoctors(docRes.data || []);

        const gIds = Array.from(new Set(resData.map((a) => a.patient_id).filter(Boolean))) as string[];
        if (gIds.length > 0) {
            const { data: gData } = await supabase.from("guests").select("id, created_at").in("id", gIds);
            const map: Record<string, string> = {};
            (gData || []).forEach(p => map[p.id] = p.created_at?.slice(0, 10) ?? "");
            setGuestFirstDates(map);
        }
        setLoading(false);
    }, [rangeStart, rangeEnd, clinic.hotelId]);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = useMemo(() => doctorFilter === "ALL" ? reservations : reservations.filter(a => a.doctor_id === doctorFilter), [reservations, doctorFilter]);

    useEffect(() => {
        if (!kpiDetail || Object.keys(guestNames).length > 0) return;
        const ids = Array.from(new Set(filtered.map(a => a.patient_id).filter(Boolean))) as string[];
        if (ids.length === 0) return;
        supabase.from("guests").select("id, full_name").in("id", ids).then(({ data }) => {
            const map: Record<string, string> = {};
            (data || []).forEach(p => map[p.id] = p.full_name);
            setGuestNames(map);
        });
    }, [kpiDetail, filtered, guestNames]);

    const stats = useMemo(() => {
        const total = filtered.length;
        const completed = filtered.filter(a => a.status === "checked_out").length;
        const cancelledNoShow = filtered.filter(a => a.status === "cancelled" || a.status === "no_show").length;
        const uniqueDays = new Set(filtered.map(a => a.check_in_date.slice(0, 10))).size;
        const maxSlots = Math.max(uniqueDays, 1) * 20; // 20 rooms assumed
        const occupancyPct = Math.min(100, Math.round((total / maxSlots) * 100));
        const paidTotal = folios
            .filter(p => p.status === 'posted' && !["payment", "discount", "refund"].includes(p.item_type!))
            .reduce((s, p) => s + p.amount, 0);
        // Simplified: missing payment logic needs adjustment
        const paidResIds = new Set(folios.map(p => p.reservation_id));
        const unpaidCompletedIds = filtered.filter(a => a.status === "checked_out" && !paidResIds.has(a.id)).map(a => a.id);
        return { total, completed, cancelledNoShow, occupancyPct, paidTotal, unpaidCompletedCount: unpaidCompletedIds.length, unpaidCompletedIds, uniqueDays };
    }, [filtered, folios]);

    const chartData = useMemo(() => {
        // Status by day
        const statusMap: Record<string, { day: string; completed: number; confirmed: number; pending: number; cancelled: number; no_show: number }> = {};
        filtered.forEach((a) => {
            const day = a.check_in_date.slice(0, 10);
            if (!statusMap[day]) statusMap[day] = { day, completed: 0, confirmed: 0, pending: 0, cancelled: 0, no_show: 0 };
            const statusKey = a.status === "checked_out" ? "completed" : (a.status as keyof typeof statusMap[string]);
            if (statusMap[day][statusKey] !== undefined) statusMap[day][statusKey]++;
        });
        const statusByDay = Object.values(statusMap).sort((a: { day: string }, b: { day: string }) => a.day.localeCompare(b.day));

        // Channel Performance
        const channelMap: Record<string, number> = {};
        filtered.forEach(a => {
            const ch = a.channel || "web";
            channelMap[ch] = (channelMap[ch] || 0) + 1;
        });
        const channelData = Object.entries(channelMap).map(([name, value]) => ({
            name: CHANNEL_LABELS[name] || name,
            value,
            pct: stats.total > 0 ? Math.round((value / stats.total) * 100) : 0
        })).sort((a, b) => b.value - a.value);

        // Occupancy by day
        const occupancyMap: Record<string, number> = {};
        filtered.forEach(a => {
            const day = a.check_in_date.slice(0, 10);
            occupancyMap[day] = (occupancyMap[day] || 0) + 1;
        });
        const occupancyByDay = Object.entries(occupancyMap).sort((a, b) => a[0].localeCompare(b[0])).map(([day, count]) => ({
            day: new Date(day + "T00:00:00").toLocaleDateString("tr-TR", { day: "2-digit", month: "short" }),
            doluluk: Math.min(100, Math.round((count / 20) * 100)),
            randevu: count
        }));

        // Doctor stats
        const docMap: Record<string, { total: number; completed: number; noShow: number }> = {};
        reservations.forEach(a => {
            const docId = a.doctor_id || "unassigned";
            if (!docMap[docId]) docMap[docId] = { total: 0, completed: 0, noShow: 0 };
            docMap[docId].total++;
            if (a.status === "checked_out") docMap[docId].completed++;
            if (a.status === "no_show") docMap[docId].noShow++;
        });
        const doctorMap = Object.fromEntries(doctors.map(d => [d.id, d.full_name]));
        const doctorStats = Object.entries(docMap).map(([id, s]) => ({
            name: id === "unassigned" ? "Atanmamış" : doctorMap[id] || "Bilinmiyor",
            ...s,
            completePct: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
            noShowPct: s.total > 0 ? Math.round((s.noShow / s.total) * 100) : 0
        })).sort((a, b) => b.total - a.total);

        // Patient breakdown
        let newCount = 0; let existingCount = 0; const seen = new Set();
        filtered.forEach(a => {
            if (!a.patient_id || seen.has(a.patient_id)) return;
            seen.add(a.patient_id);
            if (guestFirstDates[a.patient_id] >= rangeStart) newCount++; else existingCount++;
        });
        const patientBreakdown = [{ name: "Yeni Misafir", value: newCount }, { name: "Mevcut Misafir", value: existingCount }];

        return { statusByDay, channelData, occupancyByDay, doctorStats, patientBreakdown };
    }, [filtered, stats.total, guestFirstDates, rangeStart, reservations, doctors]);

    const downloadReportCsv = () => {
        const sep = ";";
        const lines = [
            "RAPOR ÖZET", `Dönem${sep}${rangeLabel}`,
            `Personel${sep}${doctorFilter === "ALL" ? "Tümü" : doctors.find(d => d.id === doctorFilter)?.full_name ?? ""}`,
            "", "Metrik" + sep + "Değer",
            `Toplam Rezervasyon${sep}${stats.total}`, `Tamamlanan${sep}${stats.completed}`,
            `İptal + Gelmedi${sep}${stats.cancelledNoShow}`, `Ortalama Doluluk %${sep}${stats.occupancyPct}`,
            `Tahsilat (₺)${sep}${stats.paidTotal}`, `Ödemesiz Tamamlanan${sep}${stats.unpaidCompletedCount}`
        ];
        // Add more sections as per existing logic if needed
        const csv = "\uFEFF" + lines.join("\r\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Otel_Raporu.csv`;
        a.click();
    };

    return {
        preset, setPreset, todayStr, customStart, setCustomStart, customEnd, setCustomEnd,
        doctorFilter, setDoctorFilter, kpiDetail, setKpiDetail, doctors, loading,
        rangeLabel, rangeStart, filtered, stats, patientNames: guestNames, patientFirstDates: guestFirstDates, appointments: reservations, payments: folios,
        chartData, downloadReportCsv
    };
}
