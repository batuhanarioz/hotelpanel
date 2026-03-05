import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking fetching reservations with items...");

    // Fetch a single reservation with folio_transactions relation
    const { data, error } = await supabase
        .from("reservations")
        .select(`
            id,
            reservation_number,
            items:folio_transactions(*)
        `)
        .eq("id", "aaa00000-0000-0000-0000-000000000004");

    console.log("Result:", JSON.stringify(data, null, 2));
    if (error) {
        console.error("Error:", error);
    }
}

check();
