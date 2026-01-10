import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types";

/**
 * Auth service - handles authentication and user-related operations
 */
export class AuthService {
    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) return null;
        return data as User;
    }

    /**
     * Get user by username
     */
    static async getUserByUsername(username: string): Promise<User | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

        if (error) return null;
        return data as User;
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        userId: string,
        updates: Partial<User>
    ): Promise<User | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", userId)
            .select()
            .single();

        if (error) return null;
        return data as User;
    }
}
