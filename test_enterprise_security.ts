import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const systemClient = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log('--- ENTERPRISE LIFECYCLE SECURITY FINAL TEST ---');
    console.log('NOTE: This test assumes you have applied the migration in supabase/migrations/20260305020000_reservation_lifecycle_enterprise.sql');

    // Get data
    const { data: hotels } = await systemClient.from('hotels').select('*').limit(1);
    if (!hotels || hotels.length === 0) { console.error("No hotel found"); return; }
    const hotelId = hotels[0].id;

    const { data: rooms } = await systemClient.from('rooms').select('*').eq('hotel_id', hotelId).limit(1);
    const room = rooms?.[0];

    const { data: guests } = await systemClient.from('guests').select('*').eq('hotel_id', hotelId).limit(1);
    const guest = guests?.[0];

    async function createRes() {
        const { data, error } = await systemClient.from('reservations').insert({
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

    // TEST 1: Service Role calling USER RPC (SHOULD FAIL)
    console.log('\nTEST 1: Service Role calling change_reservation_status');
    const res1 = await createRes();
    if (res1) {
        const { data, error } = await systemClient.rpc('change_reservation_status', {
            p_reservation_id: res1.id,
            p_new_status: 'checked_in',
            p_hotel_id: hotelId
        });
        if (error) {
            console.log(`  [OK] Expected Failure: ${error.message}`);
        } else {
            console.log(`  [FAIL] Unexpected Success: ${JSON.stringify(data)}`);
            console.log('  CRITICAL: You must apply the latest migration to enforce auth.uid() check!');
        }
    }

    // TEST 2: Service Role calling SYSTEM RPC (SHOULD SUCCEED)
    console.log('\nTEST 2: Service Role calling system_change_reservation_status');
    const res2 = await createRes();
    if (res2) {
        const { data, error } = await systemClient.rpc('system_change_reservation_status', {
            p_reservation_id: res2.id,
            p_new_status: 'no_show',
            p_hotel_id: hotelId,
            p_actor_label: 'nightly-no-show-job',
            p_note: 'Automated cleanup'
        });
        if (error) {
            console.log(`  [FAIL] Unexpected Failure: ${error.message}`);
        } else {
            console.log(`  [OK] Success. New status: ${data.status}`);

            // Verify history exactly as requested by audit rules
            const { data: history } = await systemClient.from('reservation_status_history')
                .select('*')
                .eq('reservation_id', res2.id)
                .eq('to_status', 'no_show')
                .order('changed_at', { ascending: false })
                .limit(1)
                .single();

            if (history) {
                console.log(`  Audit Verification:`);
                console.log(`    - Actor Type: ${history.actor_type} (Expected: system)`);
                console.log(`    - Actor Label: ${history.actor_label} (Expected: nightly-no-show-job)`);
                console.log(`    - Source: ${history.source} (Expected: system)`);
                console.log(`    - User ID: ${history.changed_by_user_id} (Expected: null)`);
            }
        }
    }

    // TEST 3: System RPC Restricted Transitions (SHOULD FAIL for checked_in)
    console.log('\nTEST 3: System RPC restricted transitions check');
    const res3 = await createRes();
    if (res3) {
        const { data, error } = await systemClient.rpc('system_change_reservation_status', {
            p_reservation_id: res3.id,
            p_new_status: 'checked_in',
            p_hotel_id: hotelId,
            p_actor_label: 'test-system-job'
        });
        if (error) {
            console.log(`  [OK] Expected Failure for restricted transition: ${error.message}`);
        } else {
            console.log(`  [FAIL] Unexpected Success for restricted transition: ${JSON.stringify(data)}`);
        }
    }

    console.log('\n--- SECURITY TESTS DONE ---');
}

runTests();
