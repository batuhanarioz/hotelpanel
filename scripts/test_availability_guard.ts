
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log("🚀 Starting Availability Guard Engine Tests...");

    // 1. Setup Test Data
    const testHotelId = "11111111-1111-1111-1111-111111111111";
    const otherHotelId = "22222222-2222-2222-2222-222222222222";
    const testRoomId = "11111111-1111-1111-1111-111111111001";
    const otherRoomId = "22222222-2222-2222-2222-222222222001";
    const testGuestId = "11111111-1111-1111-1111-111111111002";

    console.log("Cleaning up old test data...");
    await supabase.from("hotel_settings").delete().eq("hotel_id", testHotelId);
    await supabase.from("room_blocks").delete().eq("hotel_id", testHotelId);
    await supabase.from("reservations").delete().eq("hotel_id", testHotelId);
    await supabase.from("guests").delete().eq("hotel_id", testHotelId);
    await supabase.from("rooms").delete().eq("hotel_id", testHotelId);
    await supabase.from("hotels").delete().eq("id", testHotelId);

    console.log("Creating test infrastructure...");
    await supabase.from("hotels").insert({ id: testHotelId, name: "Test Guard Hotel", slug: "test-guard-hotel" });
    await supabase.from("hotel_settings").upsert({ hotel_id: testHotelId, allow_overbooking: false });
    await supabase.from("rooms").insert({ id: testRoomId, hotel_id: testHotelId, room_number: "T-GUARD-101", status: "CLEAN" });
    await supabase.from("guests").insert({ id: testGuestId, hotel_id: testHotelId, full_name: "Test Guest" });

    const check = async (params: any) => {
        const { data, error } = await supabase.rpc("check_room_availability", {
            p_hotel_id: testHotelId,
            p_room_id: testRoomId,
            ...params
        });
        if (error) {
            console.error("RPC Error:", error);
            return null;
        }
        return data;
    };

    /** CASE A1: Back-to-back (Should NOT conflict) **/
    console.log("\n--- Case A1: Back-to-back ---");
    const { error: insError1 } = await supabase.from("reservations").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        guest_id: testGuestId,
        check_in_date: "2026-03-10T10:00:00+03:00",
        check_out_date: "2026-03-10T12:00:00+03:00",
        status: "confirmed"
    });
    if (insError1) console.error("Insert Error (A1):", insError1);

    let res = await check({
        p_check_in_at: "2026-03-10T12:00:00+03:00",
        p_check_out_at: "2026-03-10T14:00:00+03:00"
    });
    console.log("Back-to-back (12:00 edge):", res?.available === true ? "✅ PASS" : "❌ FAIL");

    /** CASE A2: Partial Overlap (Should conflict) **/
    console.log("\n--- Case A2: Partial Overlap ---");
    res = await check({
        p_check_in_at: "2026-03-10T11:00:00+03:00",
        p_check_out_at: "2026-03-10T13:00:00+03:00"
    });
    console.log("Partial Overlap (Conflict expected):", (res?.available === false && res?.conflicts?.length > 0) ? "✅ PASS" : "❌ FAIL");

    /** CASE A4: Exact Match (Should conflict) **/
    console.log("\n--- Case A4: Exact Match ---");
    res = await check({
        p_check_in_at: "2026-03-10T10:00:00+03:00",
        p_check_out_at: "2026-03-10T12:00:00+03:00"
    });
    console.log("Exact Match (Conflict expected):", (res?.available === false && res?.conflicts?.length > 0) ? "✅ PASS" : "❌ FAIL");

    /** CASE: Room Blocks (Maintenance ALWAYS blocked) **/
    console.log("\n--- Case: Room Blocks (Maintenance) ---");
    const { error: insErrorBlock } = await supabase.from("room_blocks").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        check_in_at: "2026-03-15T10:00:00+03:00",
        check_out_at: "2026-03-15T12:00:00+03:00",
        block_type: "maintenance",
        reason: "Water pipe"
    });
    if (insErrorBlock) console.error("Insert Error (Block):", insErrorBlock);

    // Set allow_overbooking = true
    await supabase.from("hotel_settings").upsert({ hotel_id: testHotelId, allow_overbooking: true });

    res = await check({
        p_check_in_at: "2026-03-15T11:00:00+03:00",
        p_check_out_at: "2026-03-15T13:00:00+03:00"
    });
    console.log("Maintenance Overlap (Policy ON, but block is critical):", (res?.available === false && res?.has_critical_block === true && res?.conflicts?.length > 0) ? "✅ PASS" : "❌ FAIL");

    /** CASE: Overbooking Policy (Reservation soft conflict) **/
    console.log("\n--- Case: Overbooking Policy ---");
    res = await check({
        p_check_in_at: "2026-03-10T11:00:00+03:00",
        p_check_out_at: "2026-03-10T13:00:00+03:00"
    });
    console.log("Overbooking (Policy ON, should be available):", (res?.available === true && res?.conflicts?.length > 0) ? "✅ PASS" : "❌ FAIL");

    /** CASE: Multi-hotel Isolation **/
    console.log("\n--- Case: Isolation ---");
    await supabase.from("hotels").upsert({ id: otherHotelId, name: "Other Hotel", slug: "other-hotel" });
    await supabase.from("rooms").upsert({ id: otherRoomId, hotel_id: otherHotelId, room_number: "O-101", status: "CLEAN" });

    const { data: otherRes } = await supabase.rpc("check_room_availability", {
        p_hotel_id: otherHotelId,
        p_room_id: otherRoomId,
        p_check_in_at: "2026-03-10T11:00:00+03:00",
        p_check_out_at: "2026-03-10T13:00:00+03:00"
    });
    console.log("Isolation:", otherRes?.available === true ? "✅ PASS" : "❌ FAIL");

    /** CASE: Database Level Enforcement (Trigger) **/
    console.log("\n--- Case: Database Level Enforcement (Trigger) ---");
    // Set policy to NO overbooking
    await supabase.from("hotel_settings").upsert({ hotel_id: testHotelId, allow_overbooking: false });

    // Create an existing reservation: Mar 20, 10:00 -> 14:00
    await supabase.from("reservations").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        guest_id: testGuestId,
        check_in_date: "2026-03-20T10:00:00+03:00",
        check_out_date: "2026-03-20T14:00:00+03:00",
        status: "confirmed"
    });

    // Try to insert a conflicting one directly via .insert() (Trigger should block)
    const { error: trigError } = await supabase.from("reservations").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        guest_id: testGuestId,
        check_in_date: "2026-03-20T11:00:00+03:00",
        check_out_date: "2026-03-20T13:00:00+03:00",
        status: "confirmed"
    });

    if (trigError && trigError.message.includes("AVAILABILITY_OVERLAP_CONFLICT")) {
        console.log("Trigger Enforcement (Overlap): ✅ PASS (Blocked as expected)");
    } else {
        console.log("Trigger Enforcement (Overlap): ❌ FAIL (Not blocked or wrong error)", trigError?.message);
    }

    // Test Critical Block Enforcement
    await supabase.from("room_blocks").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        check_in_at: "2026-03-22T10:00:00+03:00",
        check_out_at: "2026-03-22T12:00:00+03:00",
        block_type: "maintenance"
    });

    const { error: critTrigError } = await supabase.from("reservations").insert({
        hotel_id: testHotelId,
        room_id: testRoomId,
        guest_id: testGuestId,
        check_in_date: "2026-03-22T11:00:00+03:00",
        check_out_date: "2026-03-22T13:00:00+03:00",
        status: "confirmed"
    });

    if (critTrigError && critTrigError.message.includes("AVAILABILITY_CRITICAL_BLOCK")) {
        console.log("Trigger Enforcement (Critical): ✅ PASS (Blocked as expected)");
    } else {
        console.log("Trigger Enforcement (Critical): ❌ FAIL (Not blocked or wrong error)", critTrigError?.message);
    }

    // Final Cleanup
    await supabase.from("room_blocks").delete().eq("hotel_id", testHotelId);
    await supabase.from("reservations").delete().eq("hotel_id", testHotelId);
    await supabase.from("guests").delete().eq("hotel_id", testHotelId);
    await supabase.from("rooms").delete().eq("hotel_id", testHotelId);
    await supabase.from("hotels").delete().eq("id", testHotelId);

    console.log("\n✅ All Tests Completed.");
}

runTests().catch(console.error);
