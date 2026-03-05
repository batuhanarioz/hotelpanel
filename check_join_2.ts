import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: d1, error: e1 } = await supabase
        .from("reservations")
        .select(`id, items:folio_transactions(*)`)
        .eq("id", "aaa00000-0000-0000-0000-000000000004");

    console.log("Join test an alias:", JSON.stringify(d1, null, 2));
    if (e1) console.error("Error e1:", e1);
}

check();
