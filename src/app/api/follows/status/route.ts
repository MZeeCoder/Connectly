import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

export interface FollowStatusMap {
    [userId: string]: boolean;
}

/**
 * POST /api/follows/status - Check follow status for multiple users
 * Body: { user_ids: string[] }
 * Returns: { [userId]: boolean } - true if following, false otherwise
 */
export async function POST(request: NextRequest) {
    const timer = Logger.timer("FollowsStatusAPI", "POST /api/follows/status");

    try {
        Logger.request("FollowsStatusAPI", "POST", "/api/follows/status");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("FollowsStatusAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { user_ids } = body;

        if (!user_ids || !Array.isArray(user_ids)) {
            Logger.warn("FollowsStatusAPI", "Missing or invalid user_ids in request body");
            return NextResponse.json(
                {
                    success: false,
                    error: "user_ids array is required",
                },
                { status: 400 }
            );
        }

        if (user_ids.length === 0) {
            return NextResponse.json({
                success: true,
                data: {},
            });
        }

        Logger.db("FollowsStatusAPI", "SELECT", "follows");

        // Get all follows from current user to the provided user IDs
        const { data, error } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", user.id)
            .in("following_id", user_ids);

        if (error) {
            Logger.error("FollowsStatusAPI", "Database error checking follow status", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to check follow status",
                },
                { status: 500 }
            );
        }

        // Create a map of user_id -> isFollowing
        const followStatusMap: FollowStatusMap = {};
        const followingIds = new Set(data.map(f => f.following_id));

        user_ids.forEach(userId => {
            followStatusMap[userId] = followingIds.has(userId);
        });

        Logger.success("FollowsStatusAPI", "Follow status checked for multiple users", {
            count: user_ids.length,
        });
        timer.end("Follow status retrieved");

        return NextResponse.json({
            success: true,
            data: followStatusMap,
        });
    } catch (error) {
        Logger.error("FollowsStatusAPI", "Failed to check follow status", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to check follow status",
            },
            { status: 500 }
        );
    }
}
