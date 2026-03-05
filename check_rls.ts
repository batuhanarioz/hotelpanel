import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: d1, error: e1 } = await supabase.rpc("execute_sql", { sql: "SELECT * FROM pg_policies WHERE tablename = 'folio_transactions';" });
    console.log("RLS policies:", d1);
}

check();
