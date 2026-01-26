import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

export interface ProfileUser {
    id: string;
    username: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
}

/**
 * GET /api/profile - Get current user's profile
 */
export async function GET() {
    const timer = Logger.timer("ProfileAPI", "GET /api/profile");

    try {
        Logger.request("ProfileAPI", "GET", "/api/profile");
        Logger.debug("ProfileAPI", "Fetching current user profile");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("ProfileAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        Logger.db("ProfileAPI", "SELECT", "accounts");
        const { data, error } = await supabase
            .from("accounts")
            .select("id, username, full_name, email, avatar_url, bio, created_at")
            .eq("id", user.id)
            .single();

        if (error) {
            Logger.error("ProfileAPI", "Database error fetching profile", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to fetch profile",
                },
                { status: 500 }
            );
        }

        Logger.success("ProfileAPI", "Profile fetched successfully");
        timer.end("Profile retrieved");

        return NextResponse.json({
            success: true,
            data: data as ProfileUser,
        });
    } catch (error) {
        Logger.error("ProfileAPI", "Failed to fetch profile", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch profile",
            },
            { status: 500 }
        );
    }
}
