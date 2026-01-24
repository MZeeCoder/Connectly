import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types";
import { Logger } from "@/utils/logger";

/**
 * Auth service - handles authentication and user-related operations
 */
export class AuthService {
    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User | null> {
        const timer = Logger.timer("AuthService", "getUserById");

        try {
            Logger.debug("AuthService", "Fetching user by ID", { userId });
            const supabase = await createClient();

            Logger.db("AuthService", "SELECT", "accounts");
            const { data, error } = await supabase
                .from("accounts")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                Logger.warn("AuthService", "User not found by ID", {
                    userId,
                    error: error.message,
                });
                return null;
            }

            Logger.success("AuthService", "User fetched successfully", {
                userId,
                username: data.username,
            });
            timer.end("User fetched");

            return data as User;
        } catch (error) {
            Logger.error("AuthService", "Unexpected error in getUserById", {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Get user by username
     */
    static async getUserByUsername(username: string): Promise<User | null> {
        const timer = Logger.timer("AuthService", "getUserByUsername");

        try {
            Logger.debug("AuthService", "Fetching user by username", { username });
            const supabase = await createClient();

            Logger.db("AuthService", "SELECT", "account");
            const { data, error } = await supabase
                .from("account")
                .select("*")
                .eq("username", username)
                .single();

            if (error) {
                Logger.warn("AuthService", "User not found by username", {
                    username,
                    error: error.message,
                });
                return null;
            }

            Logger.success("AuthService", "User fetched by username", {
                userId: data.id,
                username,
            });
            timer.end("User fetched");

            return data as User;
        } catch (error) {
            Logger.error("AuthService", "Unexpected error in getUserByUsername", {
                username,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        userId: string,
        updates: Partial<User>
    ): Promise<User | null> {
        const timer = Logger.timer("AuthService", "updateProfile");

        try {
            Logger.debug("AuthService", "Updating user profile", {
                userId,
                fields: Object.keys(updates),
            });
            const supabase = await createClient();

            Logger.db("AuthService", "UPDATE", "accounts");
            const { data, error } = await supabase
                .from("accounts")
                .update(updates)
                .eq("id", userId)
                .select()
                .single();

            if (error) {
                Logger.error("AuthService", "Failed to update profile", {
                    userId,
                    error: error.message,
                    code: error.code,
                });
                return null;
            }

            Logger.success("AuthService", "Profile updated successfully", {
                userId,
                updatedFields: Object.keys(updates),
            });
            timer.end("Profile updated");

            return data as User;
        } catch (error) {
            Logger.error("AuthService", "Unexpected error in updateProfile", {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }
}
