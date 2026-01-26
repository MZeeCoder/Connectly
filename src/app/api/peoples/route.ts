import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

export interface PeopleUser {
    id: string;
    username: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    bio: string | null;
}

/**
 * GET /api/peoples - Get all people/users
 */
export async function GET() {
    const timer = Logger.timer("PeoplesAPI", "GET /api/peoples");

    try {
        Logger.request("PeoplesAPI", "GET", "/api/peoples");
        Logger.debug("PeoplesAPI", "Fetching all peoples");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("PeoplesAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        Logger.db("PeoplesAPI", "SELECT", "accounts");
        // Fetch all users except the current user
        const { data, error } = await supabase
            .from("accounts")
            .select("id, username, full_name, email, avatar_url, bio")
            .neq("id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            Logger.error("PeoplesAPI", "Database error fetching peoples", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to fetch peoples",
                },
                { status: 500 }
            );
        }

        Logger.success("PeoplesAPI", "Peoples fetched successfully", {
            count: data?.length || 0,
        });
        timer.end("Peoples retrieved");

        return NextResponse.json({
            success: true,
            data: data as PeopleUser[],
        });
    } catch (error) {
        Logger.error("PeoplesAPI", "Failed to fetch peoples", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch peoples",
            },
            { status: 500 }
        );
    }
}
