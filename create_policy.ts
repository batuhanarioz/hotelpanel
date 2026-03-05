import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const r1 = await supabase.rpc("execute_sql", {
        sql: `
        ALTER TABLE public.folio_transactions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.folio_transactions;
        CREATE POLICY "Enable read access for authenticated users" 
            ON public.folio_transactions FOR ALL TO authenticated 
            USING (true) WITH CHECK (true);
    `});
    console.log(r1);
}

check();
