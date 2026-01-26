"use server";

import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";
import { Logger } from "@/utils/logger";

export interface PeopleUser {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    followers: number | null;
}

/**
 * Get all people/users
 */
export async function getAllPeoplesAction(): Promise<ApiResponse<PeopleUser[]>> {
    const timer = Logger.timer("GetAllPeoplesAction", "Fetch all peoples");

    try {
        Logger.start("GetAllPeoplesAction", "Fetching all peoples");

        const supabase = await createClient();

        Logger.db("GetAllPeoplesAction", "SELECT", "accounts");
        const { data, error } = await supabase
            .from("accounts")
            .select("id, name, email, avatar_url, followers")
            .order("created_at", { ascending: false });

        if (error) {
            Logger.error("GetAllPeoplesAction", "Database error fetching peoples", {
                error: error.message,
            });
            return {
                success: false,
                error: "Failed to fetch peoples",
            };
        }

        Logger.success("GetAllPeoplesAction", "Peoples fetched successfully", {
            count: data?.length || 0,
        });

        return {
            success: true,
            data: data as PeopleUser[],
        };
    } catch (error) {
        Logger.error("GetAllPeoplesAction", "Unexpected error", {
            error: error instanceof Error ? error.message : String(error),
        });
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    } finally {
        timer.end("Get all peoples completed");
    }
}
