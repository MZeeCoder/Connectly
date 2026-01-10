import { createClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/types";

/**
 * Gets the current authenticated user from Supabase session
 * Returns null if no user is authenticated
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch additional user data from database
    const { data: userData } = await supabase
        .from("users")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

    return {
        id: user.id,
        email: user.email!,
        username: userData?.username || "",
        avatar_url: userData?.avatar_url,
    };
}

/**
 * Checks if a user is authenticated
 * Returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Requires authentication - throws error if user is not authenticated
 * Use this in Server Actions that require authentication
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error("Unauthorized - Please sign in");
    }

    return user;
}
