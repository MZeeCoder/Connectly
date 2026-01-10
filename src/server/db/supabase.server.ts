import { createClient } from "@/lib/supabase/server";

/**
 * Supabase server database client
 * Use this for complex database operations in services
 */
export async function getSupabaseServerClient() {
    return await createClient();
}
