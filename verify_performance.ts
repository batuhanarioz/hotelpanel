import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPerformance() {
    console.log("--- Performance Verification ---");

    // 1. Call the EXPLAIN helper
    const { data: explainData, error: explainError } = await supabase.rpc('explain_no_show_detection_query');

    if (explainError) {
        console.error("EXPLAIN error (index might not be active yet or function missing):", explainError.message);
    } else {
        console.log("EXPLAIN Output:");
        console.log(explainData);

        const usesIndex = explainData.toLowerCase().includes("index scan") || explainData.toLowerCase().includes("bitmap index scan");
        console.log(`\nIndex usage verified: ${usesIndex ? "YES ✅" : "NO ❌"}`);
    }
}

verifyPerformance();
