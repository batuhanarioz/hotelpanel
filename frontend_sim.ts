import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: { session }, error: authErr } = await supabase.auth.signInWithPassword({ email: "mersinhotel@gmail.com", password: "password123!" });
    if (authErr && !session) {
        console.error("Auth:", authErr);
        // Try admin
        await supabase.auth.signInWithPassword({ email: "admin@mercan.com", password: "password" });
    }

    const { data: user } = await supabase.from("users").select("hotel_id").single();
    if (!user) return console.log("user not found");

    console.log("Logged in:", user);

    const { data, error } = await supabase
        .from("reservations")
        .select(`id, reservation_number, items:folio_transactions(*)`)
        .eq("hotel_id", user.hotel_id)
        .limit(3);

    console.log("Data length:", data?.length);
    console.log("Items per res:", data?.map(d => d.items?.length));

    // Check if folio transactions can be queried directly
    const { data: folios } = await supabase
        .from("folio_transactions")
        .select("*")
        .eq("hotel_id", user.hotel_id)
        .limit(3);

    console.log("Direct folios count:", folios?.length);
    console.log("Direct folios:", folios);
}

check();
