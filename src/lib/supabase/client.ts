import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser-side usage (Client Components)
 * This client should only be used in Client Components
 * 
 * IMPORTANT: Never expose admin keys on the client
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
