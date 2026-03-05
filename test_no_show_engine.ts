import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function testNoShowEngine() {
    console.log('🚀 Starting Auto No-Show Engine Test...')

    // 1. Get a test hotel
    const { data: hotels } = await supabase.from('hotels').select('id').limit(1)
    if (!hotels || hotels.length === 0) {
        console.error('❌ No hotels found')
        return
    }
    const hotelId = hotels[0].id
    console.log(`🏨 Using Hotel: ${hotelId}`)

    // 2. Setup Hotel Settings (Mode = Candidate, Grace = 120min)
    console.log('⚙️ Setting up hotel_settings...')
    await supabase.from('hotel_settings').upsert({
        hotel_id: hotelId,
        auto_no_show_mode: 'candidate',
        no_show_grace_period_minutes: 120
    })

    // 3. Create a test reservation that SHOULD be a candidate
    // (check_in_date = 3 hours ago)
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    console.log('📅 Creating candidate reservation...')
    const { data: resData, error: resError } = await supabase.from('reservations').insert({
        hotel_id: hotelId,
        guest_id: (await supabase.from('guests').select('id').eq('hotel_id', hotelId).limit(1).single()).data?.id,
        room_id: (await supabase.from('rooms').select('id').eq('hotel_id', hotelId).limit(1).single()).data?.id,
        status: 'confirmed',
        check_in_date: threeHoursAgo,
        check_out_date: tomorrow,
        channel: 'web',
        adults_count: 1
    }).select().single()

    if (resError) {
        console.error('❌ Error creating reservation:', resError)
        return
    }
    const resId = resData.id
    console.log(`✅ Reservation created: ${resId} (Check-in: ${threeHoursAgo})`)

    // 4. Run Detection Job
    console.log('🔍 Running detect_no_show_candidates()...')
    const { data: jobData, error: jobError } = await supabase.rpc('detect_no_show_candidates')

    if (jobError) {
        console.error('❌ Job Error:', jobError)
    } else {
        console.log('✅ Job Result:', jobData)
    }

    // 5. Verify flagship
    const { data: verifiedRes } = await supabase.from('reservations').select('no_show_candidate, no_show_candidate_at').eq('id', resId).single()
    if (verifiedRes?.no_show_candidate) {
        console.log('🎉 SUCCESS: Reservation correctly flagged as candidate!')
        console.log(`⏰ Flagged at: ${verifiedRes.no_show_candidate_at}`)
    } else {
        console.error('❌ FAILURE: Reservation was NOT flagged.')
    }

    // 6. Verify History
    const { data: history } = await supabase.from('reservation_status_history')
        .select('*')
        .eq('reservation_id', resId)
        .eq('actor_label', 'auto_no_show_engine')
        .single()

    if (history) {
        console.log('📜 History log found correctly.')
    } else {
        console.error('❌ History log missing.')
    }

    // 7. TEST CLEANUP TRIGGER: Change status to 'checked_in' and check if flag is cleared
    console.log('🧹 Testing cleanup trigger (checked_in)...')
    const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'checked_in' })
        .eq('id', resId)

    if (updateError) {
        console.error('❌ Update Error:', updateError)
    } else {
        const { data: cleanedRes } = await supabase.from('reservations').select('no_show_candidate').eq('id', resId).single()
        if (!cleanedRes?.no_show_candidate) {
            console.log('✅ SUCCESS: Candidate flag cleared automatically by trigger!')
        } else {
            console.error('❌ FAILURE: Candidate flag still present.')
        }
    }

    console.log('🏁 Test completed.')
}

testNoShowEngine().catch(console.error)
