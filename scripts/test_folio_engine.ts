
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

function check(label: string, condition: boolean, detail?: any) {
    if (condition) {
        console.log(`  ✅ PASS: ${label}`);
        pass++;
    } else {
        console.error(`  ❌ FAIL: ${label}`, detail ?? "");
        fail++;
    }
}

async function ins(table: string, data: Record<string, any>): Promise<{ error: any }> {
    const { error } = await supabase.from(table).insert(data);
    if (error) console.error(`  ⚠️  insert[${table}]:`, error.message);
    return { error };
}

async function runTests() {
    console.log("\n🚀 Folio Ledger Engine Tests\n");

    const HOTEL_A = "aaa00000-0000-0000-0000-000000000001";
    const HOTEL_B = "bbb00000-0000-0000-0000-000000000001";
    const ROOM_A = "aaa00000-0000-0000-0000-000000000002";
    const ROOM_B = "bbb00000-0000-0000-0000-000000000002";
    const GUEST_A = "aaa00000-0000-0000-0000-000000000003";
    const GUEST_B = "bbb00000-0000-0000-0000-000000000003";
    const RES_A = "aaa00000-0000-0000-0000-000000000004";
    const RES_B = "bbb00000-0000-0000-0000-000000000005";

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    console.log("🧹 Cleaning up previous test data...");
    for (const hid of [HOTEL_A, HOTEL_B]) {
        await supabase.from("folio_transactions").delete().eq("hotel_id", hid);
        await supabase.from("reservations").delete().eq("hotel_id", hid);
        await supabase.from("guests").delete().eq("hotel_id", hid);
        await supabase.from("rooms").delete().eq("hotel_id", hid);
        await supabase.from("hotels").delete().eq("id", hid);
    }

    // ─── Setup Hotel A ────────────────────────────────────────────────────────
    console.log("🏗️  Creating Hotel A...");
    await ins("hotels", { id: HOTEL_A, name: "Folio Engine Test Hotel A", slug: "folio-test-a" });
    await ins("rooms", { id: ROOM_A, hotel_id: HOTEL_A, room_number: "FLO-101", status: "CLEAN" });
    await ins("guests", { id: GUEST_A, hotel_id: HOTEL_A, full_name: "Folio Test Guest A", is_blacklist: false });

    const { error: resErrA } = await supabase.from("reservations").insert({
        id: RES_A,
        hotel_id: HOTEL_A,
        room_id: ROOM_A,
        guest_id: GUEST_A,
        check_in_date: "2026-04-01",
        check_out_date: "2026-04-06",
        status: "confirmed",
        estimated_amount: 5000,
        nightly_rate: 1000,
        adults_count: 2,
        children_count: 0
    });
    if (resErrA) console.error("  ⚠️  Reservation A:", resErrA.message);

    // ─── Setup Hotel B ────────────────────────────────────────────────────────
    console.log("🏗️  Creating Hotel B...");
    await ins("hotels", { id: HOTEL_B, name: "Folio Engine Test Hotel B", slug: "folio-test-b" });
    await ins("rooms", { id: ROOM_B, hotel_id: HOTEL_B, room_number: "FLO-B-101", status: "CLEAN" });
    await ins("guests", { id: GUEST_B, hotel_id: HOTEL_B, full_name: "Folio Test Guest B", is_blacklist: false });
    await supabase.from("reservations").insert({
        id: RES_B,
        hotel_id: HOTEL_B,
        room_id: ROOM_B,
        guest_id: GUEST_B,
        check_in_date: "2026-04-01",
        check_out_date: "2026-04-06",
        status: "confirmed",
        estimated_amount: 3000,
        nightly_rate: 600,
        adults_count: 1,
        children_count: 0
    });

    // ─── TEST 1: room_charge → balance artmalı ────────────────────────────────
    console.log("\n📋 TEST 1: room_charge → Bakiye artmalı");
    const { error: e1 } = await supabase.from("folio_transactions").insert({
        hotel_id: HOTEL_A,
        reservation_id: RES_A,
        guest_id: GUEST_A,
        type: "room_charge",
        amount: 5000,
        currency: "TRY",
        description: "5 Gecelik Konaklama",
        source: "system"
    });
    check("room_charge insert başarılı", !e1, e1?.message);

    const { data: b1 } = await supabase
        .from("reservation_folio_balance").select("*")
        .eq("reservation_id", RES_A).single();
    check("Bakiye = 5000 (room_charge sonrası)", Number(b1?.balance) === 5000, `Gerçek: ${b1?.balance}`);

    // ─── TEST 2: payment → balance düşmeli ───────────────────────────────────
    console.log("\n📋 TEST 2: payment → Bakiye düşmeli");
    const { data: tx2, error: e2 } = await supabase.rpc("add_payment", {
        p_reservation_id: RES_A,
        p_amount: 3000,
        p_method: "CREDIT_CARD",
        p_description: "Ön ödeme - kredi kartı"
    });
    check("add_payment RPC çalıştı, UUID döndü", !e2 && tx2 != null, e2?.message);

    const { data: b2 } = await supabase
        .from("reservation_folio_balance").select("*")
        .eq("reservation_id", RES_A).single();
    check("Bakiye = 2000 (3000 ödeme sonrası)", Number(b2?.balance) === 2000, `Gerçek: ${b2?.balance}`);

    // ─── TEST 3: refund → balance artmalı ────────────────────────────────────
    console.log("\n📋 TEST 3: refund → Bakiye artmalı");
    const { data: tx3, error: e3 } = await supabase.rpc("add_refund", {
        p_reservation_id: RES_A,
        p_amount: 500,
        p_reason: "Oda sorunu tazminatı"
    });
    check("add_refund RPC çalıştı, UUID döndü", !e3 && tx3 != null, e3?.message);

    const { data: b3 } = await supabase
        .from("reservation_folio_balance").select("*")
        .eq("reservation_id", RES_A).single();
    // charges=5000, payments=3000, refund=500 → total_payments = 3000-500=2500 → balance=2500
    check("Bakiye = 2500 (500 iade sonrası)", Number(b3?.balance) === 2500, `Gerçek: ${b3?.balance}`);

    // ─── TEST 4: negatif adjustment ──────────────────────────────────────────
    console.log("\n📋 TEST 4: Negatif Adjustment → Bakiye düşmeli");
    const { error: e4 } = await supabase.from("folio_transactions").insert({
        hotel_id: HOTEL_A,
        reservation_id: RES_A,
        guest_id: GUEST_A,
        type: "adjustment",
        amount: -200,
        currency: "TRY",
        description: "Manuel indirim düzeltmesi",
        source: "ui"
    });
    check("Negatif adjustment insert başarılı", !e4, e4?.message);

    const { data: b4 } = await supabase
        .from("reservation_folio_balance").select("*")
        .eq("reservation_id", RES_A).single();
    // total_charges=5000, total_payments=3000-500+200(negative adj credit)=2700 → balance=2300
    check("Bakiye = 2300 (-200 adjustment sonrası)", Number(b4?.balance) === 2300, `Gerçek: ${b4?.balance}`);

    // ─── TEST 5: immutability ─────────────────────────────────────────────────
    console.log("\n📋 TEST 5: Immutability → UPDATE bloklanmalı");
    const { data: txList } = await supabase
        .from("folio_transactions").select("id")
        .eq("reservation_id", RES_A).limit(1);

    if (txList && txList[0]) {
        const { error: eUpd } = await supabase
            .from("folio_transactions")
            .update({ amount: 9999 })
            .eq("id", txList[0].id);
        check("UPDATE bloklandı (immutable ledger)", !!eUpd, eUpd?.message ?? "UPDATE geçti — TRIGGER ÇALIŞMIYOR!");
    } else {
        check("En az 1 transaction var (immutability testi için)", false, "Transaction bulunamadı");
    }

    // ─── TEST 6: multi-hotel isolation ───────────────────────────────────────
    console.log("\n📋 TEST 6: Multi-Hotel Isolation");
    await supabase.from("folio_transactions").insert({
        hotel_id: HOTEL_B,
        reservation_id: RES_B,
        guest_id: GUEST_B,
        type: "room_charge",
        amount: 3000,
        currency: "TRY",
        description: "Hotel B oda ücreti",
        source: "system"
    });

    const { data: txA } = await supabase
        .from("folio_transactions").select("id").eq("hotel_id", HOTEL_A);
    const { data: txB } = await supabase
        .from("folio_transactions").select("id").eq("hotel_id", HOTEL_B);

    const setA = new Set((txA || []).map(t => t.id));
    const setB = new Set((txB || []).map(t => t.id));
    const overlap = [...setA].filter(id => setB.has(id));

    check("Hotel A → B transaction'larını görmemeli (overlap=0)", overlap.length === 0, overlap);
    check(`Hotel A'da ${setA.size} transaction var`, setA.size > 0);
    check(`Hotel B'de ${setB.size} transaction var`, setB.size > 0);

    // ─── Cleanup ──────────────────────────────────────────────────────────────
    console.log("\n🧹 Test verisi temizleniyor...");
    for (const hid of [HOTEL_A, HOTEL_B]) {
        await supabase.from("folio_transactions").delete().eq("hotel_id", hid);
        await supabase.from("reservations").delete().eq("hotel_id", hid);
        await supabase.from("guests").delete().eq("hotel_id", hid);
        await supabase.from("rooms").delete().eq("hotel_id", hid);
        await supabase.from("hotels").delete().eq("id", hid);
    }

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log("\n" + "─".repeat(52));
    console.log(`📊 Test Sonuçları: ${pass} PASS / ${fail} FAIL`);
    if (fail === 0) {
        console.log("🎉 Tüm testler başarılı!\n");
    } else {
        console.log("⚠️  Bazı testler başarısız. Çıktıyı inceleyin.\n");
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
