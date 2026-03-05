import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log('--- ENTERPRISE LIFECYCLE TEST SUITE ---');

    // Get data
    const { data: hotels } = await supabase.from('hotels').select('*').limit(1);
    if (!hotels || hotels.length === 0) { console.error("No hotel found"); return; }
    const hotelId = hotels[0].id;

    const { data: rooms } = await supabase.from('rooms').select('*').eq('hotel_id', hotelId).limit(1);
    if (!rooms || rooms.length === 0) { console.error("No room found"); return; }
    const room = rooms[0];

    const { data: guests } = await supabase.from('guests').select('*').eq('hotel_id', hotelId).limit(1);
    if (!guests || guests.length === 0) { console.error("No guest found"); return; }
    const guest = guests[0];

    // Helper to get user ID for the hotel
    const { data: users } = await supabase.from('users').select('id, role').eq('hotel_id', hotelId).limit(1);
    const testerUserId = users?.[0]?.id;
    const testerRole = users?.[0]?.role;
    console.log(`Testing with User ID: ${testerUserId} (Role: ${testerRole})`);

    // ENSURE PERMISSIONS FOR THE TESTER
    console.log('Ensuring permissions for tester role...');
    const permsToGrant = [
        'RESERVATION_STATUS_CHECKIN',
        'RESERVATION_STATUS_CHECKOUT',
        'RESERVATION_STATUS_CANCEL',
        'RESERVATION_STATUS_NO_SHOW',
        'RESERVATION_STATUS_UNDO_CHECKOUT',
        'RESERVATION_STATUS_REINSTATE'
    ];
    for (const perm of permsToGrant) {
        await supabase.from('role_permissions').upsert({
            hotel_id: hotelId,
            role: testerRole,
            permission: perm
        }, { onConflict: 'hotel_id, role, permission' });
    }

    async function createRes() {
        const { data, error } = await supabase.from('reservations').insert({
            hotel_id: hotelId,
            guest_id: guest.id,
            room_id: room.id,
            room_number: room.room_number,
            status: 'confirmed',
            check_in_date: new Date().toISOString(),
            check_out_date: new Date(Date.now() + 86400000).toISOString()
        }).select().single();
        if (error) { console.error("Create res error:", error); return null; }
        return data;
    }

    async function callRpc(id, newStatus, note = null, expectedUpdatedAt = null) {
        console.log(`[ACTION] Transitioning ${id.slice(0, 8)} to ${newStatus}...`);
        // We use the service role client which acts as a superuser, 
        // but change_reservation_status has SECURITY DEFINER and checks auth.uid()
        // To simulate a specific user, we would need to sign in as them, 
        // but service role can call the function. However, the RPC code does v_user_id := auth.uid().
        // auth.uid() is null for service role unless we set session.

        const { data, error } = await supabase.rpc('change_reservation_status', {
            p_reservation_id: id,
            p_new_status: newStatus,
            p_hotel_id: hotelId,
            p_note: note,
            p_expected_updated_at: expectedUpdatedAt
        });
        if (error) {
            console.log(`  [RESULT] Error: ${error.message}`);
            return { success: false, message: error.message };
        }
        console.log(`  [RESULT] Success: ${data.status}`);
        return { success: true, data };
    }

    // 1. confirmed -> checked_in -> checked_out -> undo
    console.log('\nSCENARIO 1: Check-in/Out Flow & Undo');
    // Reset room status for test
    await supabase.from('rooms').update({ status: 'CLEAN' }).eq('id', room.id);

    let res = await createRes();
    if (!res) return;

    await callRpc(res.id, 'checked_in');
    let { data: r1 } = await supabase.from('rooms').select('status').eq('id', room.id).single();
    console.log(`  Room status (expect OCCUPIED): ${r1.status}`);

    await callRpc(res.id, 'checked_out');
    let { data: r2 } = await supabase.from('rooms').select('status').eq('id', room.id).single();
    console.log(`  Room status (expect DIRTY): ${r2.status}`);

    await callRpc(res.id, 'checked_in', 'Undo Checkout Test');
    let { data: r3 } = await supabase.from('rooms').select('status').eq('id', room.id).single();
    console.log(`  Room status (expect OCCUPIED after undo): ${r3.status}`);

    // 2. confirmed -> cancelled -> reinstate
    console.log('\nSCENARIO 2: Cancellation & Reinstate');
    res = await createRes();
    if (!res) return;
    await callRpc(res.id, 'cancelled');
    await callRpc(res.id, 'confirmed', 'Reinstate Test');
    let { data: resRe } = await supabase.from('reservations').select('status').eq('id', res.id).single();
    console.log(`  Final Status (expect confirmed): ${resRe.status}`);

    // 3. Concurrency Control
    console.log('\nSCENARIO 3: Concurrency Check');
    const oldUpdatedAt = res.updated_at;
    await supabase.from('reservations').update({ guest_note: 'Updated' }).eq('id', res.id);
    await callRpc(res.id, 'cancelled', 'Concurrency Test', oldUpdatedAt);

    // 4. History Audit
    console.log('\nSCENARIO 4: History Audit');
    const { data: history } = await supabase.from('reservation_status_history').select('*').eq('reservation_id', res.id);
    console.log(`  History records found for Scenario 2 res: ${history?.length}`);
    history?.forEach(h => console.log(`    - ${h.from_status} -> ${h.to_status} | Source: ${h.source}`));

    console.log('\n--- TESTS DONE ---');
}

runTests();
