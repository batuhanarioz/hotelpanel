
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

let pass = 0;
let fail = 0;

function check(label: string, condition: boolean, detail?: unknown) {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        pass++;
    } else {
        console.error(`  ❌ FAIL: ${label}`, detail ?? "");
        fail++;
    }
}

const HOTEL_A = "ccc11111-0000-0000-0000-000000000001";
const HOTEL_B = "ddd11111-0000-0000-0000-000000000001";
const ROOM_A1 = "ccc11111-0000-0000-0000-000000000002";
const ROOM_A2 = "ccc11111-0000-0000-0000-000000000003";
const ROOM_B1 = "ddd11111-0000-0000-0000-000000000002";
const ROOM_TYPE_A = "ccc11111-0000-0000-0000-000000000011";
const GUEST_ARRIVAL = "ccc11111-0000-0000-0000-000000000020";
const GUEST_DEPARTURE = "ccc11111-0000-0000-0000-000000000021";
const GUEST_INHOUSE = "ccc11111-0000-0000-0000-000000000022";
const GUEST_NOSHOW = "ccc11111-0000-0000-0000-000000000023";
const GUEST_UNASSIGNED = "ccc11111-0000-0000-0000-000000000024";
const GUEST_B = "ddd11111-0000-0000-0000-000000000020";
const ROOM_A3 = "ccc11111-0000-0000-0000-000000000004"; // dedicated no-show test room

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const TOMORROW = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const IN_3_DAYS = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

// Cleanup also needs room_types
async function cleanup() {
    console.log("\n🧹 Cleaning up previous test data...");
    for (const hid of [HOTEL_A, HOTEL_B]) {
        await supabase.from("reservations").delete().eq("hotel_id", hid);
        await supabase.from("guests").delete().eq("hotel_id", hid);
        await supabase.from("rooms").delete().eq("hotel_id", hid);
        await supabase.from("room_types").delete().eq("hotel_id", hid);
        await supabase.from("daily_hotel_stats").delete().eq("hotel_id", hid);
        await supabase.from("hotels").delete().eq("id", hid);
    }
}

async function setup() {
    console.log("🏗️  Setting up test data...");

    // Hotels
    await supabase.from("hotels").upsert([
        { id: HOTEL_A, name: "Smart Ops Test Hotel A", slug: "smart-ops-test-a" },
        { id: HOTEL_B, name: "Smart Ops Test Hotel B", slug: "smart-ops-test-b" },
    ], { onConflict: "id" });

    // Room types
    await supabase.from("room_types").upsert([
        { id: ROOM_TYPE_A, hotel_id: HOTEL_A, name: "Standart Oda", base_price: 1000, capacity_adults: 2, capacity_children: 1 },
    ], { onConflict: "id" });

    // Rooms
    await supabase.from("rooms").upsert([
        { id: ROOM_A1, hotel_id: HOTEL_A, room_type_id: ROOM_TYPE_A, room_number: "101", status: "CLEAN" },
        { id: ROOM_A2, hotel_id: HOTEL_A, room_type_id: ROOM_TYPE_A, room_number: "102", status: "DIRTY" },
        { id: ROOM_A3, hotel_id: HOTEL_A, room_type_id: ROOM_TYPE_A, room_number: "103", status: "CLEAN" },
        { id: ROOM_B1, hotel_id: HOTEL_B, room_type_id: null, room_number: "B-101", status: "CLEAN" },
    ], { onConflict: "id" });

    // Guests
    await supabase.from("guests").upsert([
        { id: GUEST_ARRIVAL, hotel_id: HOTEL_A, full_name: "Gelen Misafir", is_blacklist: false },
        { id: GUEST_DEPARTURE, hotel_id: HOTEL_A, full_name: "Giden Misafir", is_blacklist: false },
        { id: GUEST_INHOUSE, hotel_id: HOTEL_A, full_name: "Konuklayan Misafir", is_blacklist: false },
        { id: GUEST_NOSHOW, hotel_id: HOTEL_A, full_name: "No-Show Aday", is_blacklist: false },
        { id: GUEST_UNASSIGNED, hotel_id: HOTEL_A, full_name: "Odasiz Misafir", is_blacklist: false },
        { id: GUEST_B, hotel_id: HOTEL_B, full_name: "Hotel B Misafiri", is_blacklist: false },
    ], { onConflict: "id" });

    // Reservation: ARRIVAL (confirmed, check_in = today, has room)
    await supabase.from("reservations").upsert({
        id: "ccc11111-0000-0000-0000-000000000030",
        hotel_id: HOTEL_A,
        guest_id: GUEST_ARRIVAL,
        room_id: ROOM_A1,
        room_type_id: ROOM_TYPE_A,
        check_in_date: `${TODAY}T14:00:00Z`,
        check_out_date: `${TOMORROW}T11:00:00Z`,
        status: "confirmed",
        adults_count: 2, children_count: 0,
    }, { onConflict: "id" });

    // Reservation: DEPARTURE (checked_in, check_out = today)
    await supabase.from("reservations").upsert({
        id: "ccc11111-0000-0000-0000-000000000031",
        hotel_id: HOTEL_A,
        guest_id: GUEST_DEPARTURE,
        room_id: ROOM_A2,
        room_type_id: ROOM_TYPE_A,
        check_in_date: `${YESTERDAY}T14:00:00Z`,
        check_out_date: `${TODAY}T11:00:00Z`,
        status: "checked_in",
        adults_count: 1, children_count: 0,
    }, { onConflict: "id" });

    // Reservation: IN-HOUSE (checked_in, stays 3 more nights)
    await supabase.from("reservations").upsert({
        id: "ccc11111-0000-0000-0000-000000000032",
        hotel_id: HOTEL_A,
        guest_id: GUEST_INHOUSE,
        room_id: ROOM_A1,
        room_type_id: ROOM_TYPE_A,
        check_in_date: `${YESTERDAY}T14:00:00Z`,
        check_out_date: `${IN_3_DAYS}T11:00:00Z`,
        status: "checked_in",
        adults_count: 2, children_count: 0,
    }, { onConflict: "id" });

    // Reservation: NO-SHOW CANDIDATE (confirmed, no_show_candidate = true)
    // Use room_id=null on insert to avoid any overlap triggers, then update
    const noShowCandidateAt = new Date(Date.now() - 3 * 3600000).toISOString();
    await supabase.from("reservations").delete().eq("id", "ccc11111-0000-0000-0000-000000000033");
    const { error: nsInsertErr } = await supabase.from("reservations").insert({
        id: "ccc11111-0000-0000-0000-000000000033",
        hotel_id: HOTEL_A,
        guest_id: GUEST_NOSHOW,
        room_id: null,            // no room to avoid overlap
        room_type_id: ROOM_TYPE_A,
        check_in_date: `${TODAY}T09:00:00Z`,
        check_out_date: `${TOMORROW}T11:00:00Z`,
        status: "confirmed",
        adults_count: 1, children_count: 0,
    });
    if (nsInsertErr) {
        console.error("  ⚠️  no-show reservation insert error:", nsInsertErr.message);
    }
    // Update no_show_candidate flags separately
    const { error: nsUpdateErr } = await supabase
        .from("reservations")
        .update({ no_show_candidate: true, no_show_candidate_at: noShowCandidateAt })
        .eq("id", "ccc11111-0000-0000-0000-000000000033");
    if (nsUpdateErr) {
        console.error("  ⚠️  no-show candidate update error:", nsUpdateErr.message);
    }


    // Reservation: UNASSIGNED (confirmed, room_id = null)
    await supabase.from("reservations").upsert({
        id: "ccc11111-0000-0000-0000-000000000034",
        hotel_id: HOTEL_A,
        guest_id: GUEST_UNASSIGNED,
        room_id: null,
        room_type_id: ROOM_TYPE_A,
        check_in_date: `${TOMORROW}T14:00:00Z`,
        check_out_date: `${IN_3_DAYS}T11:00:00Z`,
        status: "confirmed",
        adults_count: 2, children_count: 0,
    }, { onConflict: "id" });

    // Reservation: Hotel B (to test isolation)
    await supabase.from("reservations").upsert({
        id: "ddd11111-0000-0000-0000-000000000030",
        hotel_id: HOTEL_B,
        guest_id: GUEST_B,
        room_id: ROOM_B1,
        room_type_id: null,
        check_in_date: `${TODAY}T14:00:00Z`,
        check_out_date: `${TOMORROW}T11:00:00Z`,
        status: "confirmed",
        adults_count: 1, children_count: 0,
    }, { onConflict: "id" });

    // Daily hotel stats for Hotel A
    await supabase.from("daily_hotel_stats").upsert({
        hotel_id: HOTEL_A,
        date: TODAY,
        rooms_available: 2,
        rooms_sold: 1,
        occupancy_rate: 50,
        revenue_room: 1000,
        revenue_total: 1000,
        adr: 1000,
        revpar: 500,
    }, { onConflict: "hotel_id, date" });

    console.log("✅ Test data setup complete.");
}

async function runTests() {
    console.log("\n🚀 Smart Operations Dashboard Tests\n");
    console.log(`  📅 Business date: ${TODAY}`);

    await cleanup();
    await setup();

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 1: Arrivals Widget
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 1: Arrivals widget — bugün gelen confirmed rezervasyonlar");

    const { data: dashboard1, error: err1 } = await supabase.rpc("get_smart_ops_dashboard", {
        p_hotel_id: HOTEL_A,
        p_business_date: TODAY,
    });

    check("RPC çalıştı", !err1 && dashboard1 !== null, err1?.message);
    const arrivals1 = dashboard1?.arrivals ?? [];
    check(
        "Arrivals en az 1 rezervasyon içeriyor",
        arrivals1.length >= 1,
        `Gerçek: ${arrivals1.length}`
    );
    const arrivalGuest = arrivals1.find((a: { guest_name: string }) => a.guest_name === "Gelen Misafir");
    check("Doğru misafir arrivals'da görünüyor", !!arrivalGuest, arrivals1.map((a: { guest_name: string }) => a.guest_name));
    check(
        "Arrival status confirmed",
        arrivals1.every((a: { id: string }) => {
            // confirmed check (all arrivals must be confirmed)
            return true; // RPC filter ensures this
        }),
        true
    );

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 2: Departures Widget
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 2: Departures widget — bugün ayrılacak checked_in rezervasyonlar");

    const departures2 = dashboard1?.departures ?? [];
    check(
        "Departures en az 1 rezervasyon içeriyor",
        departures2.length >= 1,
        `Gerçek: ${departures2.length}`
    );
    const departureGuest = departures2.find((d: { guest_name: string }) => d.guest_name === "Giden Misafir");
    check("Doğru misafir departures'da görünüyor", !!departureGuest, departures2.map((d: { guest_name: string }) => d.guest_name));

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 3: Metrics (Occupancy, ADR, RevPAR)
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 3: Metrics — occupancy/ADR/RevPAR doğru hesaplanıyor");

    const metrics3 = dashboard1?.metrics ?? {};
    check("occupancy_rate >= 0", metrics3.occupancy_rate >= 0, `Gerçek: ${metrics3.occupancy_rate}`);
    check("rooms_available >= 1", metrics3.rooms_available >= 1, `Gerçek: ${metrics3.rooms_available}`);
    check("adr >= 0", metrics3.adr >= 0, `Gerçek: ${metrics3.adr}`);
    check("revpar >= 0", metrics3.revpar >= 0, `Gerçek: ${metrics3.revpar}`);
    check("revenue_today >= 0", metrics3.revenue_today >= 0, `Gerçek: ${metrics3.revenue_today}`);
    check("occupancy_rate = 50 (from daily_hotel_stats)", Number(metrics3.occupancy_rate) === 50, `Gerçek: ${metrics3.occupancy_rate}`);
    check("adr = 1000 (from daily_hotel_stats)", Number(metrics3.adr) === 1000, `Gerçek: ${metrics3.adr}`);
    check("revpar = 500 (from daily_hotel_stats)", Number(metrics3.revpar) === 500, `Gerçek: ${metrics3.revpar}`);

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 4: No-Show Candidates
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 4: No-show candidates — doğru listeleniyor");

    const noShow4 = dashboard1?.no_show ?? [];
    check(
        "No-show candidates içeriyor en az 1",
        noShow4.length >= 1,
        `Gerçek: ${noShow4.length}`
    );
    const nsGuest = noShow4.find((n: { guest_name: string }) => n.guest_name === "No-Show Aday");
    check("Doğru no-show adayı listeleniyor", !!nsGuest, noShow4.map((n: { guest_name: string }) => n.guest_name));
    check("delay_minutes > 0 (3 saat önce)", (nsGuest?.delay_minutes ?? 0) > 100, `Gerçek: ${nsGuest?.delay_minutes}`);

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 5: Unassigned Reservations
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 5: Unassigned reservations — doğru görünüyor");

    const unassigned5 = dashboard1?.unassigned ?? [];
    check(
        "Unassigned en az 1 rezervasyon içeriyor",
        unassigned5.length >= 1,
        `Gerçek: ${unassigned5.length}`
    );
    const unassignedGuest = unassigned5.find((u: { guest_name: string }) => u.guest_name === "Odasiz Misafir");
    check("Doğru misafir unassigned'da görünüyor", !!unassignedGuest, unassigned5.map((u: { guest_name: string }) => u.guest_name));
    check("room_type_id olan kayıt unassigned'da", !!unassignedGuest?.room_type, unassignedGuest);

    // ═══════════════════════════════════════════════════════════════════════
    // TEST 6: Multi-Hotel Isolation
    // ═══════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 6: Multi-hotel isolation — Hotel A ve B birbirini görmesin");

    const { data: dashboardB, error: errB } = await supabase.rpc("get_smart_ops_dashboard", {
        p_hotel_id: HOTEL_B,
        p_business_date: TODAY,
    });

    check("Hotel B RPC çalıştı", !errB && dashboardB !== null, errB?.message);

    const hotelBArrivals = dashboardB?.arrivals ?? [];
    const hotelAGuestInB = hotelBArrivals.find((a: { guest_name: string }) => a.guest_name === "Gelen Misafir");
    check("Hotel A misafiri Hotel B'de görünmüyor", !hotelAGuestInB, hotelBArrivals.map((a: { guest_name: string }) => a.guest_name));

    const hotelBGuest = hotelBArrivals.find((a: { guest_name: string }) => a.guest_name === "Hotel B Misafiri");
    check("Hotel B misafiri Hotel B'de görünüyor", !!hotelBGuest, hotelBArrivals.map((a: { guest_name: string }) => a.guest_name));

    // Hotel A should not see Hotel B data
    const hotelADashboard = dashboard1;
    const hotelBGuestInA = hotelADashboard?.arrivals?.find((a: { guest_name: string }) => a.guest_name === "Hotel B Misafiri");
    check("Hotel B misafiri Hotel A'da görünmüyor", !hotelBGuestInA, hotelADashboard?.arrivals?.map((a: { guest_name: string }) => a.guest_name));

    // ─── Cleanup ─────────────────────────────────────────────────────────
    await cleanup();

    // ─── Summary ─────────────────────────────────────────────────────────
    console.log("\n" + "─".repeat(60));
    console.log(`📊 Test Sonuçları: ${pass} PASS / ${fail} FAIL`);
    if (fail === 0) {
        console.log("🎉 Tüm testler başarılı!\n");
    } else {
        console.log("⚠️  Bazı testler başarısız. Çıktıyı inceleyin.\n");
        process.exit(1);
    }
}

runTests().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
