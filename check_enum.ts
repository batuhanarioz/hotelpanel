import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: d1, error: e1 } = await supabase.rpc("execute_sql", { sql: "SELECT unnest(enum_range(NULL::public.folio_tx_type));" });
    if (e1) {
        // execute_sql fails, fetch directly from pg_type using REST endpoint if possible. 
        // Not possible. But we can just see the rows.
    }
}
check();
