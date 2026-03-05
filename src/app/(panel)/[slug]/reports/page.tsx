"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useHotel } from "@/app/context/HotelContext";
import { GlobalFilterBar } from "@/app/components/reports/GlobalFilterBar";
import { KPICard } from "@/app/components/reports/KPICard";
import { RevenueAnalytics } from "@/app/components/reports/RevenueAnalytics";
import { OccupancyAnalytics } from "@/app/components/reports/OccupancyAnalytics";
import { ReservationAnalytics } from "@/app/components/reports/ReservationAnalytics";
import { ChannelPerformance } from "@/app/components/reports/ChannelAnalytics";
import { GuestAnalytics } from "@/app/components/reports/GuestAnalytics";
import { OperationalAnalytics } from "@/app/components/reports/OperationalAnalytics";

interface RevenueData {
  date: string;
  room: number;
  extra: number;
  total: number;
}

interface OccupancyData {
  date: string;
  rate: number;
  available: number;
  occupied: number;
}

interface ChannelData {
  name: string;
  revenue: number;
  adr: number;
  occupancy: number;
}

interface KPITrends {
  totalRevenue: { value: number; isPositive: boolean };
  adr: { value: number; isPositive: boolean };
  occupancy: { value: number; isPositive: boolean };
}

interface KPIData {
  totalRevenue: number;
  roomRevenue: number;
  extraRevenue: number;
  adr: number;
  revpar: number;
  occupancy: number;
  los: number;
  cancellation: number;
  noShow: number;
  openBalance: number;
  trends: KPITrends;
}

interface GuestAnalyticsData {
  newVsReturning: { name: string; value: number }[];
  nationalities: { country: string; count: number; revenue: number }[];
  avgSpend: number;
  los: number;
}

interface OperationalAnalyticsData {
  roomStatus: { name: string; value: number; color: string }[];
  staffPerf: { name: string; checkins: number }[];
}

export default function ReportsPage() {
  const { hotelId } = useHotel();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<unknown>(null);

  // Data states
  const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; full_name: string }[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [guestData, setGuestData] = useState<GuestAnalyticsData | null>(null);
  const [opsData, setOperationalAnalyticsData] = useState<OperationalAnalyticsData | null>(null);
  const [roomTypeRevenue, setRoomTypeRevenue] = useState<{ name: string; value: number }[]>([]);
  const [roomTypeOccupancy, setRoomTypeOccupancy] = useState<{ name: string; rate: number; revenue: number }[]>([]);
  const [oooImpact, setOooImpact] = useState<{ name: string; value: number }[]>([]);
  const [leadTimeData, setLeadTimeData] = useState<{ range: string; count: number }[]>([]);

  useEffect(() => {
    async function init() {
      if (!hotelId) return;
      const [rt, sl, src] = await Promise.all([
        supabase.from("room_types").select("id, name").eq("hotel_id", hotelId),
        supabase.from("users").select("id, full_name").eq("hotel_id", hotelId),
        supabase.from("reservations").select("channel").eq("hotel_id", hotelId),
      ]);
      setRoomTypes(rt.data || []);
      setStaffList(sl.data || []);
      const uniqueSources = Array.from(new Set((src.data || []).map(s => s.channel).filter(Boolean))) as string[];
      setSources(uniqueSources);
    }
    init();
  }, [hotelId]);

  useEffect(() => {
    async function fetchData() {
      if (!hotelId || !filters) return;
      setLoading(true);

      const f = filters as any;
      const startDate = f.dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
      const endDate = f.dateRange?.end || new Date().toISOString().split('T')[0];

      try {
        // 1. KPI & Financial Metrics
        let metricsQuery = supabase
          .from("financial_metrics_view")
          .select("*")
          .eq("hotel_id", hotelId)
          .gte("report_date", startDate)
          .lte("report_date", endDate);

        const { data: metrics } = await metricsQuery;

        if (metrics && metrics.length > 0) {
          const totalRev = metrics.reduce((sum, m) => sum + Number(m.total_revenue), 0);
          const roomRev = metrics.reduce((sum, m) => sum + Number(m.room_revenue), 0);
          const occupiedRoomsTotal = metrics.reduce((sum, m) => sum + (m.occupied_rooms || 0), 0);
          const availableRoomsTotal = metrics.reduce((sum, m) => sum + (m.available_rooms || 0), 0);

          const avgOccupancy = availableRoomsTotal > 0 ? (occupiedRoomsTotal / availableRoomsTotal) * 100 : 0;
          const avgAdr = occupiedRoomsTotal > 0 ? roomRev / occupiedRoomsTotal : 0;

          setKpis({
            totalRevenue: totalRev,
            roomRevenue: roomRev,
            extraRevenue: totalRev - roomRev,
            adr: Math.round(avgAdr),
            revpar: Math.round(roomRev / (availableRoomsTotal || 1)),
            occupancy: Math.round(avgOccupancy),
            los: 0,
            cancellation: 0,
            noShow: 0,
            openBalance: 0,
            trends: {
              totalRevenue: { value: 0, isPositive: true },
              adr: { value: 0, isPositive: true },
              occupancy: { value: 0, isPositive: true },
            }
          });

          setRevenueData(metrics.map(m => ({
            date: new Date(m.report_date).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' }),
            room: Number(m.room_revenue),
            extra: Number(m.total_revenue) - Number(m.room_revenue),
            total: Number(m.total_revenue)
          })));
        }

        // 2. Specialized Reports (Room Types, Sources, CRM, Operations)
        const [rtRevRes, srcRevRes, rtOccRes, oooRes, natRes, staffRes, leadRes] = await Promise.all([
          supabase.from("room_type_revenue_view").select("room_type_name, revenue").eq("hotel_id", hotelId).gte("report_date", startDate).lte("report_date", endDate),
          supabase.from("source_revenue_view").select("source_name, revenue").eq("hotel_id", hotelId).gte("report_date", startDate).lte("report_date", endDate),
          supabase.from("room_type_occupancy_view").select("room_type_name, occupancy_rate").eq("hotel_id", hotelId).gte("report_date", startDate).lte("report_date", endDate),
          supabase.from("ooo_impact_view").select("room_number, ooo_days").eq("hotel_id", hotelId),
          supabase.from("nationality_revenue_view").select("country, guest_count, revenue").eq("hotel_id", hotelId),
          supabase.from("staff_checkin_performance_view").select("staff_name, checkin_count").eq("hotel_id", hotelId),
          supabase.from("reservation_lead_time_view").select("range, count").eq("hotel_id", hotelId).gte("report_date", startDate).lte("report_date", endDate)
        ]);

        if (leadRes.data) {
          const lMap: Record<string, number> = {};
          leadRes.data.forEach(l => {
            lMap[l.range] = (lMap[l.range] || 0) + Number(l.count);
          });
          setLeadTimeData(Object.entries(lMap).map(([range, count]) => ({ range, count })));
        }

        const rtMap: Record<string, number> = {};
        if (rtRevRes.data) {
          rtRevRes.data.forEach(r => {
            const name = r.room_type_name || "Bilinmiyor";
            rtMap[name] = (rtMap[name] || 0) + Number(r.revenue);
          });
          setRoomTypeRevenue(Object.entries(rtMap).map(([name, value]) => ({ name, value })));
        }

        // Mapping Room Type Occupancy with correct revenue sync
        if (rtOccRes.data) {
          const occMap: Record<string, { total: number; count: number }> = {};
          rtOccRes.data.forEach(o => {
            if (!occMap[o.room_type_name]) occMap[o.room_type_name] = { total: 0, count: 0 };
            occMap[o.room_type_name].total += Number(o.occupancy_rate);
            occMap[o.room_type_name].count++;
          });
          setRoomTypeOccupancy(Object.entries(occMap).map(([name, s]) => ({
            name,
            rate: Math.round(s.total / s.count),
            revenue: rtMap[name] || 0
          })));
        }

        if (oooRes.data) {
          setOooImpact(oooRes.data.map(o => ({ name: `Oda ${o.room_number}`, value: o.ooo_days })));
        }

        if (srcRevRes.data) {
          const srcMap: Record<string, number> = {};
          srcRevRes.data.forEach(s => {
            const name = s.source_name || "Direct";
            srcMap[name] = (srcMap[name] || 0) + Number(s.revenue);
          });
          setChannelData(Object.entries(srcMap).map(([name, revenue]) => ({
            name,
            revenue,
            adr: 0,
            occupancy: 0
          })));
        }

        // 3. Occupancy Data
        const { data: occData } = await supabase
          .from("occupancy_view")
          .select("*")
          .eq("hotel_id", hotelId)
          .gte("report_date", startDate)
          .lte("report_date", endDate);

        if (occData) {
          setOccupancyData(occData.map(o => ({
            date: new Date(o.report_date).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' }),
            rate: Math.round(o.occupancy_rate),
            available: o.available_rooms,
            occupied: o.occupied_rooms
          })));
        }

        // 4. Channel & Reservation Performance
        const { data: perfData } = await supabase
          .from("reservation_performance_view")
          .select("*")
          .eq("hotel_id", hotelId)
          .gte("booking_date", startDate)
          .lte("booking_date", endDate);

        if (perfData) {
          const totalNights = perfData.reduce((sum, p) => sum + Number(p.total_nights), 0);
          const totalRes = perfData.reduce((sum, p) => sum + Number(p.total_reservations), 0);
          const totalCancels = perfData.reduce((sum, p) => sum + Number(p.cancellations), 0);
          const totalNoShows = perfData.reduce((sum, p) => sum + Number(p.no_shows), 0);

          setKpis(prev => prev ? {
            ...prev,
            los: totalRes > 0 ? Number((totalNights / totalRes).toFixed(1)) : 0,
            cancellation: totalRes > 0 ? Number(((totalCancels / totalRes) * 100).toFixed(1)) : 0,
            noShow: totalRes > 0 ? Number(((totalNoShows / totalRes) * 100).toFixed(1)) : 0,
          } : null);

          const volumeMap: Record<string, number> = {};
          perfData.forEach(p => {
            const date = new Date(p.booking_date).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short' });
            volumeMap[date] = (volumeMap[date] || 0) + Number(p.total_reservations);
          });

          setRevenueData(prev => prev.map(d => ({
            ...d,
            reservationCount: volumeMap[d.date] || 0
          })));
        }

        // 5. Guest Data (CRM)
        const { data: gData } = await supabase.from("guest_metrics_view").select("*").eq("hotel_id", hotelId).maybeSingle();
        if (gData || natRes.data) {
          setGuestData({
            newVsReturning: gData ? [
              { name: "Yeni Misafir", value: gData.new_guests },
              { name: "Mevcut Misafir", value: gData.returning_guests },
            ] : [],
            nationalities: natRes.data?.map(n => ({ country: n.country, count: n.guest_count, revenue: Number(n.revenue) })) || [],
            avgSpend: 0,
            los: 0
          });
        }

        // 6. Operations & Staff Data
        const { data: rooms } = await supabase.from("rooms").select("status").eq("hotel_id", hotelId);
        if (rooms || staffRes.data) {
          const counts = (rooms || []).reduce((acc: Record<string, number>, r) => {
            const s = String(r.status).toUpperCase();
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          }, {});

          setOperationalAnalyticsData({
            roomStatus: [
              { name: "Temiz", value: counts.CLEAN || 0, color: "#10b981" },
              { name: "Kirli", value: counts.DIRTY || 0, color: "#f59e0b" },
              { name: "Arızalı", value: counts.OOO || counts.OUT_OF_ORDER || 0, color: "#ef4444" },
              { name: "Dolu", value: counts.OCCUPIED || counts.OCC || 0, color: "#4f46e5" },
            ],
            staffPerf: staffRes.data?.map(s => ({ name: s.staff_name || "Bilinmiyor", checkins: s.checkin_count })) || []
          });
        }

      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [hotelId, filters]);

  return (
    <div className="max-w-[1400px] mx-auto p-2 sm:p-6 space-y-8 pb-20">
      <header className="flex justify-end">
        <div className="h-10 px-4 flex items-center bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
          Son Güncelleme: {new Date().toLocaleTimeString()}
        </div>
      </header>

      <GlobalFilterBar
        onFilterChange={setFilters}
        roomTypes={roomTypes}
        sources={sources}
        staffList={staffList}
      />

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-600 rounded-full" />
          Yönetici Özeti (KPI)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard label="Toplam Gelir" value={kpis?.totalRevenue || 0} prefix="₺" trend={kpis?.trends.totalRevenue} isLoading={loading} />
          <KPICard label="Oda Geliri" value={kpis?.roomRevenue || 0} prefix="₺" isLoading={loading} />
          <KPICard label="Ekstra Gelir" value={kpis?.extraRevenue || 0} prefix="₺" isLoading={loading} />
          <KPICard label="ADR" value={kpis?.adr || 0} prefix="₺" trend={kpis?.trends.adr} isLoading={loading} />
          <KPICard label="RevPAR" value={kpis?.revpar || 0} prefix="₺" isLoading={loading} />
          <KPICard label="Doluluk Oranı" value={kpis?.occupancy || 0} suffix="%" trend={kpis?.trends.occupancy} isLoading={loading} />
          <KPICard label="Ort. Geceleme (LOS)" value={kpis?.los || 0} suffix=" Gece" isLoading={loading} />
          <KPICard label="İptal Oranı" value={kpis?.cancellation || 0} suffix="%" isLoading={loading} />
          <KPICard label="No-Show Oranı" value={kpis?.noShow || 0} suffix="%" isLoading={loading} />
          <KPICard label="Açık Bakiye" value={kpis?.openBalance || 0} prefix="₺" isLoading={loading} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 mt-12">
        <section id="revenue">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 text-sm font-bold">01</span>
            Gelir & Finansal Analitik
          </h2>
          <RevenueAnalytics
            trendData={revenueData}
            typeBreakdown={roomTypeRevenue}
            sourceBreakdown={channelData.map(c => ({ name: c.name, value: c.revenue }))}
            paymentStatus={[{ name: "Tahsil Edildi", value: 100 }]} // Placeholder
          />
        </section>

        <section id="occupancy">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 text-sm font-bold">02</span>
            Doluluk & Oda Performansı
          </h2>
          <OccupancyAnalytics
            occupancyTrend={occupancyData}
            roomTypeStats={roomTypeOccupancy}
            oooImpact={oooImpact}
          />
        </section>

        <section id="reservations">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 text-sm font-bold">03</span>
            Rezervasyon Performansı
          </h2>
          <ReservationAnalytics
            volumeTrend={revenueData.map(d => ({ date: d.date, count: (d as any).reservationCount || 0 }))}
            leadTimeData={leadTimeData}
            pickupReport={revenueData.map(d => ({ date: d.date, count: (d as any).reservationCount || 0 }))}
          />
        </section>

        <section id="channels">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 text-sm font-bold">04</span>
            Kanal Performansı
          </h2>
          <ChannelPerformance data={channelData} />
        </section>

        <section id="guests">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 text-sm font-bold">05</span>
            Misafir Analitiği (CRM)
          </h2>
          <GuestAnalytics
            newVsReturning={guestData?.newVsReturning || []}
            nationalityDistribution={guestData?.nationalities?.sort((a, b) => b.revenue - a.revenue).slice(0, 5) || []}
            avgSpendPerGuest={Math.round(kpis?.totalRevenue ? kpis.totalRevenue / Math.max(1, guestData?.newVsReturning.reduce((s, g) => s + g.value, 0) || 0) : 0)}
            avgNightsPerGuest={kpis?.los || 0}
          />
        </section>

        <section id="operations">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold">06</span>
            Operasyonel Analitik
          </h2>
          <OperationalAnalytics
            roomStatusSummary={opsData?.roomStatus || []}
            staffPerformance={opsData?.staffPerf || []}
            avgCheckinTime={14}
          />
        </section>
      </div>
    </div>
  );
}
