import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from("reservations")
        .select(`
        id, 
        items:folio_transactions(id, item_type, amount, type, created_at)
    `)
        .limit(5);

    console.log("Reservations with items:", JSON.stringify(data, null, 2));
    if (error) console.error("Error:", error);
}

check();
