
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log("🚀 Starting Room Allocation Engine Tests...");

    const testHotelId = "11111111-1111-1111-1111-111111111111"; // Should exist from availability guard tests or similar
    const testRoomTypeId = "11111111-1111-1111-1111-111111111112"; // Dummy RT
    const testRoomId1 = "11111111-1111-1111-1111-111111111001"; // CLEAN
    const testRoomId2 = "11111111-1111-1111-1111-111111111002"; // DIRTY
    const testGuestId = "11111111-1111-1111-1111-111111111002";

    console.log("Setting up Room Allocation specific data...");

    // Ensure hotel exists
    await supabase.from("hotels").upsert({ id: testHotelId, name: "Test Allocation Hotel", slug: "test-allocation" });

    // Ensure room type exists
    await supabase.from("room_types").upsert({ id: testRoomTypeId, hotel_id: testHotelId, name: "Standard Test", base_price: 100 });

    // Room 1: CLEAN
    await supabase.from("rooms").upsert({
        id: testRoomId1,
        hotel_id: testHotelId,
        room_type_id: testRoomTypeId,
        room_number: "ALLOC-101",
        status: "CLEAN",
        priority_score: 10
    });

    // Room 2: DIRTY
    await supabase.from("rooms").upsert({
        id: testRoomId2,
        hotel_id: testHotelId,
        room_type_id: testRoomTypeId,
        room_number: "ALLOC-102",
        status: "DIRTY",
        priority_score: 50 // Higher priority, but DIRTY
    });

    /** TEST 1: auto_assign_room (Strategy: Better Status over Priority) **/
    console.log("\n--- Test 1: Auto Assign (Priority vs Status) ---");

    // Create unassigned reservation
    const { data: res1, error: resErr } = await supabase.from("reservations").insert({
        hotel_id: testHotelId,
        guest_id: testGuestId,
        room_id: null,
        room_type_id: testRoomTypeId,
        check_in_date: "2026-04-01T10:00:00+03:00",
        check_out_date: "2026-04-02T10:00:00+03:00",
        status: "confirmed"
    }).select().single();

    if (resErr) {
        console.error("Reservation Creation Error:", resErr);
        return;
    }

    const { data: assignResult, error: assignError } = await supabase.rpc("auto_assign_room", {
        p_reservation_id: res1.id,
        p_allow_dirty: false,
        p_strategy: 'best_score'
    });

    if (assignError) {
        console.error("RPC Error (auto_assign_room):", assignError);
    } else {
        console.log("Assigned Room Number:", assignResult.room_number);
        console.log("Assignment Logic (Expected ALLOC-101 because 102 is DIRTY):", assignResult.room_number === "ALLOC-101" ? "✅ PASS" : "❌ FAIL");
    }

    /** TEST 2: bulk_auto_assign **/
    console.log("\n--- Test 2: Bulk Auto Assign ---");

    await supabase.from("reservations").insert([
        { hotel_id: testHotelId, guest_id: testGuestId, room_type_id: testRoomTypeId, check_in_date: "2026-04-01T12:00:00+03:00", check_out_date: "2026-04-03T12:00:00+03:00", status: "confirmed" },
        { hotel_id: testHotelId, guest_id: testGuestId, room_type_id: testRoomTypeId, check_in_date: "2026-04-05T12:00:00+03:00", check_out_date: "2026-04-07T12:00:00+03:00", status: "confirmed" }
    ]);

    const { data: bulkResult } = await supabase.rpc("bulk_auto_assign", {
        p_hotel_id: testHotelId,
        p_date_from: "2026-03-01T00:00:00Z",
        p_date_to: "2026-05-01T23:59:59Z"
    });

    console.log("Bulk Result:", bulkResult);
    console.log("Bulk Assignment (Expected some successes):", bulkResult.assigned_count > 0 ? "✅ PASS" : "❌ FAIL");

    // Final Cleanup
    console.log("\nCleaning up test data...");
    await supabase.from("reservations").delete().eq("hotel_id", testHotelId);
    await supabase.from("rooms").delete().eq("hotel_id", testHotelId);
    await supabase.from("room_types").delete().eq("hotel_id", testHotelId);
    await supabase.from("hotels").delete().eq("id", testHotelId);

    console.log("✅ Verification Tests Completed.");
}

runTests().catch(console.error);
