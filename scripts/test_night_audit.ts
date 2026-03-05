
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

async function ins(table: string, data: Record<string, unknown>): Promise<{ error: { message: string } | null }> {
    const { error } = await supabase.from(table).insert(data);
    if (error) console.error(`  ⚠️  insert[${table}]:`, error.message);
    return { error };
}

async function runTests() {
    console.log("\n🌙 Night Audit Engine Tests\n");

    const HOTEL_A = "aaa11111-0000-0000-0000-000000000001";
    const HOTEL_B = "bbb11111-0000-0000-0000-000000000001";
    const ROOM_A = "aaa11111-0000-0000-0000-000000000002";
    const ROOM_B = "bbb11111-0000-0000-0000-000000000002";
    const GUEST_A = "aaa11111-0000-0000-0000-000000000003";
    const GUEST_B = "bbb11111-0000-0000-0000-000000000003";
    const RES_A = "aaa11111-0000-0000-0000-000000000004";
    const RES_B = "bbb11111-0000-0000-0000-000000000004";

    // Use a unique business date per run to avoid immutable-ledger leftover conflicts
    const BASE = new Date("2025-01-01");
    BASE.setDate(BASE.getDate() + Math.floor(Math.random() * 300));
    const BUSINESS_DATE = BASE.toISOString().slice(0, 10);
    // Reservation window must contain BUSINESS_DATE: check_in 2 days before, check_out 5 days after
    const checkIn = new Date(BASE); checkIn.setDate(BASE.getDate() - 2);
    const checkOut = new Date(BASE); checkOut.setDate(BASE.getDate() + 5);
    const CHECK_IN = checkIn.toISOString().slice(0, 10) + "T12:00:00Z";
    const CHECK_OUT = checkOut.toISOString().slice(0, 10) + "T11:00:00Z";
    const expectedNextDate = new Date(BASE); expectedNextDate.setDate(BASE.getDate() + 1);
    const NEXT_DATE = expectedNextDate.toISOString().slice(0, 10);
    console.log(`  📅 Business date for this run: ${BUSINESS_DATE}`);

    // ─── Cleanup (full, idempotent) ─────────────────────────────────────────────
    console.log("🧹 Cleaning up previous test data...");
    for (const hid of [HOTEL_A, HOTEL_B]) {
        await supabase.from("daily_hotel_stats").delete().eq("hotel_id", hid);
        await supabase.from("hotel_business_dates").delete().eq("hotel_id", hid);
        // folio_transactions is immutable (trigger blocks DELETE) — we work around it
        // by using a unique business_date per run so the guard never sees stale data
        await supabase.from("activity_logs").delete().eq("hotel_id", hid);
        await supabase.from("reservations").delete().eq("hotel_id", hid);
        await supabase.from("guests").delete().eq("hotel_id", hid);
        await supabase.from("rooms").delete().eq("hotel_id", hid);
        await supabase.from("hotels").delete().eq("id", hid);
    }

    // ─── Setup Hotel A (upsert = safe on re-run) ──────────────────────────────
    console.log("🏗️  Creating Hotel A (2 rooms)...");
    await supabase.from("hotels").upsert({ id: HOTEL_A, name: "Night Audit Test Hotel A", slug: "na-test-a" }, { onConflict: "id" });
    await supabase.from("rooms").upsert({ id: ROOM_A, hotel_id: HOTEL_A, room_number: "NA-101", status: "CLEAN" }, { onConflict: "id" });
    await supabase.from("rooms").upsert({ id: "aaa11111-0000-0000-0000-000000000099", hotel_id: HOTEL_A, room_number: "NA-102", status: "CLEAN" }, { onConflict: "id" });
    await supabase.from("guests").upsert({ id: GUEST_A, hotel_id: HOTEL_A, full_name: "Night Audit Guest A", is_blacklist: false }, { onConflict: "id" });
    await supabase.from("reservations").upsert({
        id: RES_A, hotel_id: HOTEL_A, room_id: ROOM_A, guest_id: GUEST_A,
        check_in_date: CHECK_IN, check_out_date: CHECK_OUT,
        status: "confirmed", nightly_rate: 1500, adults_count: 2, children_count: 0,
    }, { onConflict: "id" });
    // Update to checked_in — this triggers the initial room charge (system trigger, expected)
    await supabase.from("reservations").update({ status: "checked_in" }).eq("id", RES_A);
    await supabase.from("hotel_business_dates").upsert(
        { hotel_id: HOTEL_A, business_date: BUSINESS_DATE, status: "open" },
        { onConflict: "hotel_id" }
    );

    // ─── Setup Hotel B (upsert = safe on re-run) ──────────────────────────────
    console.log("🏗️  Creating Hotel B...");
    await supabase.from("hotels").upsert({ id: HOTEL_B, name: "Night Audit Test Hotel B", slug: "na-test-b" }, { onConflict: "id" });
    await supabase.from("rooms").upsert({ id: ROOM_B, hotel_id: HOTEL_B, room_number: "NA-B-101", status: "CLEAN" }, { onConflict: "id" });
    await supabase.from("guests").upsert({ id: GUEST_B, hotel_id: HOTEL_B, full_name: "Night Audit Guest B", is_blacklist: false }, { onConflict: "id" });
    await supabase.from("reservations").upsert({
        id: RES_B, hotel_id: HOTEL_B, room_id: ROOM_B, guest_id: GUEST_B,
        check_in_date: CHECK_IN, check_out_date: CHECK_OUT,
        status: "confirmed", nightly_rate: 800, adults_count: 1, children_count: 0,
    }, { onConflict: "id" });
    await supabase.from("reservations").update({ status: "checked_in" }).eq("id", RES_B);
    await supabase.from("hotel_business_dates").upsert(
        { hotel_id: HOTEL_B, business_date: BUSINESS_DATE, status: "open" },
        { onConflict: "hotel_id" }
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST 1: Room charge posted for checked_in reservation
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 1: checked_in rezervasyon → Daily room charge transaction oluşmalı");
    const { data: auditResult1, error: auditErr1 } = await supabase.rpc("run_night_audit", {
        p_hotel_id: HOTEL_A,
    });

    check("run_night_audit RPC çalıştı", !auditErr1 && auditResult1 !== null, auditErr1?.message);
    check("success=true döndü", auditResult1?.success === true, auditResult1);
    // Initial room charge is written by trigger — audit specifically posts 'Daily room charge'
    check("Daily room charge postlandı (charges_posted >= 1)", (auditResult1?.charges_posted ?? 0) >= 1, `Gerçek: ${auditResult1?.charges_posted}`);

    // Verify only 'Daily room charge' entries (not the trigger's 'Initial room charge posting at check-in')
    // Filter strictly by this run's business_date via metadata
    const { data: txList1 } = await supabase
        .from("folio_transactions")
        .select("*")
        .eq("hotel_id", HOTEL_A)
        .eq("type", "room_charge")
        .eq("description", "Daily room charge")
        .filter("metadata->>business_date", "eq", BUSINESS_DATE);

    check("folio_transactions'da Daily room charge kaydı var", (txList1?.length ?? 0) >= 1, `Kayıt sayısı: ${txList1?.length}`);
    check("Tutar 1500 (nightly_rate)", Number(txList1?.[0]?.amount) === 1500, `Gerçek: ${txList1?.[0]?.amount}`);
    check("metadata business_date doğru", txList1?.[0]?.metadata?.business_date === BUSINESS_DATE, `Gerçek: ${txList1?.[0]?.metadata?.business_date}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST 2: Double posting guard — no duplicate on second run
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 2: Aynı gün tekrar çalıştırılırsa duplicate charge oluşmamalı");

    // Record count BEFORE second run
    const { data: txBefore } = await supabase
        .from("folio_transactions")
        .select("id")
        .eq("hotel_id", HOTEL_A)
        .eq("type", "room_charge")
        .eq("description", "Daily room charge");
    const countBefore = txBefore?.length ?? 0;

    // Reset business_date back to BUSINESS_DATE to simulate re-run on same day
    await supabase.from("hotel_business_dates").update({
        business_date: BUSINESS_DATE,
    }).eq("hotel_id", HOTEL_A);

    const { data: auditResult2, error: auditErr2 } = await supabase.rpc("run_night_audit", {
        p_hotel_id: HOTEL_A,
    });

    check("2. run başarılı", !auditErr2, auditErr2?.message);
    check("2. çalıştırmada charges_posted=0 (duplicate guard)", auditResult2?.charges_posted === 0, `Gerçek: ${auditResult2?.charges_posted}`);

    const { data: txAfter } = await supabase
        .from("folio_transactions")
        .select("id")
        .eq("hotel_id", HOTEL_A)
        .eq("type", "room_charge")
        .eq("description", "Daily room charge");
    const countAfter = txAfter?.length ?? 0;

    check("Duplicate oluşmadı (kayıt sayısı değişmedi)", countAfter === countBefore, `Önce: ${countBefore}, Sonra: ${countAfter}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST 3: daily_hotel_stats doğru hesaplanıyor
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 3: daily_hotel_stats doğru hesaplanmalı");

    // After 2 runs on same date, there's 1 stat row for BUSINESS_DATE
    const { data: stats3 } = await supabase
        .from("daily_hotel_stats")
        .select("*")
        .eq("hotel_id", HOTEL_A)
        .eq("date", BUSINESS_DATE)
        .single();

    check("daily_hotel_stats kaydı oluştu", !!stats3, "Kayıt bulunamadı");
    check("rooms_available >= 2 (OOO olmayan odalar)", (stats3?.rooms_available ?? 0) >= 2, `Gerçek: ${stats3?.rooms_available}`);
    check("rooms_sold = 1 (checked_in)", (stats3?.rooms_sold ?? 0) === 1, `Gerçek: ${stats3?.rooms_sold}`);
    check("occupancy_rate > 0", (stats3?.occupancy_rate ?? 0) > 0, `Gerçek: ${stats3?.occupancy_rate}`);
    check("revenue_room >= 1500 (en az 1 gece ücreti)", Number(stats3?.revenue_room ?? 0) >= 1500, `Gerçek: ${stats3?.revenue_room}`);
    check("adr > 0 (revenue/rooms_sold)", Number(stats3?.adr ?? 0) > 0, `Gerçek: ${stats3?.adr}`);
    check("revpar > 0 (revenue/rooms_available)", Number(stats3?.revpar ?? 0) > 0, `Gerçek: ${stats3?.revpar}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST 4: business_date +1 ilerliyor
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 4: business_date doğru şekilde +1 ilerlemeli");

    // Current business_date should be BUSINESS_DATE + 1 (after 2nd run)
    const { data: bd4 } = await supabase
        .from("hotel_business_dates")
        .select("business_date")
        .eq("hotel_id", HOTEL_A)
        .single();

    check(
        `business_date = ${NEXT_DATE} (+1 gün)`,
        bd4?.business_date === NEXT_DATE,
        `Gerçek: ${bd4?.business_date}`
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // TEST 5: Multi-hotel isolation
    // ═══════════════════════════════════════════════════════════════════════════
    console.log("\n📋 TEST 5: Multi-hotel isolation");

    // Reset Hotel B business_date before its audit (ensure clean state)
    await supabase.from("hotel_business_dates").update({
        business_date: BUSINESS_DATE,
    }).eq("hotel_id", HOTEL_B);

    const { data: auditResultB, error: auditErrB } = await supabase.rpc("run_night_audit", {
        p_hotel_id: HOTEL_B,
    });

    check("Hotel B audit çalıştı", !auditErrB && auditResultB?.success === true, auditErrB?.message);
    check("Hotel B Daily room charge postlandı (>= 1)", (auditResultB?.charges_posted ?? 0) >= 1, `Gerçek: ${auditResultB?.charges_posted}`);

    // Hotel A transactions should not include Hotel B reservation charges
    const { data: txA } = await supabase
        .from("folio_transactions")
        .select("id, hotel_id")
        .eq("hotel_id", HOTEL_A);

    const { data: txB } = await supabase
        .from("folio_transactions")
        .select("id, hotel_id")
        .eq("hotel_id", HOTEL_B);

    const setA = new Set((txA || []).map((t) => t.id));
    const setB = new Set((txB || []).map((t) => t.id));
    const overlap = [...setA].filter((id) => setB.has(id));

    check("Hotel A ve B transaction'ları birbirini görmez (overlap=0)", overlap.length === 0, overlap);
    check("Hotel A'da en az 1 transaction var", setA.size > 0, `setA.size=${setA.size}`);
    check("Hotel B'de en az 1 transaction var", setB.size > 0, `setB.size=${setB.size}`);

    // Hotel B business_date should advance independently
    const { data: bdB } = await supabase
        .from("hotel_business_dates")
        .select("business_date")
        .eq("hotel_id", HOTEL_B)
        .single();

    check(
        `Hotel B business_date bağımsız ilerler (${NEXT_DATE})`,
        bdB?.business_date === NEXT_DATE,
        `Gerçek: ${bdB?.business_date}`
    );

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    console.log("\n🧹 Test verisi temizleniyor...");
    for (const hid of [HOTEL_A, HOTEL_B]) {
        await supabase.from("daily_hotel_stats").delete().eq("hotel_id", hid);
        await supabase.from("hotel_business_dates").delete().eq("hotel_id", hid);
        await supabase.from("folio_transactions").delete().eq("hotel_id", hid);
        await supabase.from("activity_logs").delete().eq("hotel_id", hid);
        await supabase.from("reservations").delete().eq("hotel_id", hid);
        await supabase.from("guests").delete().eq("hotel_id", hid);
        await supabase.from("rooms").delete().eq("hotel_id", hid);
        await supabase.from("hotels").delete().eq("id", hid);
    }

    // ─── Summary ─────────────────────────────────────────────────────────────
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
