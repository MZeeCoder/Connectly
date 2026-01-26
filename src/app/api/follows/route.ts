import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

export interface FollowRelationship {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface FollowStatus {
    isFollowing: boolean;
    followId?: string;
}

/**
 * POST /api/follows - Follow a user
 * Body: { following_id: string }
 */
export async function POST(request: NextRequest) {
    const timer = Logger.timer("FollowsAPI", "POST /api/follows");

    try {
        Logger.request("FollowsAPI", "POST", "/api/follows");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("FollowsAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { following_id } = body;

        if (!following_id) {
            Logger.warn("FollowsAPI", "Missing following_id in request body");
            return NextResponse.json(
                {
                    success: false,
                    error: "following_id is required",
                },
                { status: 400 }
            );
        }

        // Prevent self-following
        if (user.id === following_id) {
            Logger.warn("FollowsAPI", "User attempting to follow themselves");
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot follow yourself",
                },
                { status: 400 }
            );
        }

        Logger.db("FollowsAPI", "INSERT", "follows");

        // Create the follow relationship
        const { data, error } = await supabase
            .from("follows")
            .insert({
                follower_id: user.id,
                following_id: following_id,
            })
            .select()
            .single();

        if (error) {
            // Check if it's a duplicate follow
            if (error.code === "23505") {
                Logger.warn("FollowsAPI", "User already following this account");
                return NextResponse.json(
                    {
                        success: false,
                        error: "Already following this user",
                    },
                    { status: 409 }
                );
            }

            Logger.error("FollowsAPI", "Database error creating follow", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to follow user",
                },
                { status: 500 }
            );
        }

        Logger.success("FollowsAPI", "Follow relationship created", {
            follower_id: user.id,
            following_id: following_id,
        });
        timer.end("Follow created");

        return NextResponse.json({
            success: true,
            data: data as FollowRelationship,
        });
    } catch (error) {
        Logger.error("FollowsAPI", "Failed to follow user", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to follow user",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/follows - Unfollow a user
 * Query params: ?following_id=xxx
 */
export async function DELETE(request: NextRequest) {
    const timer = Logger.timer("FollowsAPI", "DELETE /api/follows");

    try {
        Logger.request("FollowsAPI", "DELETE", "/api/follows");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("FollowsAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const following_id = searchParams.get("following_id");

        if (!following_id) {
            Logger.warn("FollowsAPI", "Missing following_id in query params");
            return NextResponse.json(
                {
                    success: false,
                    error: "following_id is required",
                },
                { status: 400 }
            );
        }

        Logger.db("FollowsAPI", "DELETE", "follows");

        // Delete the follow relationship
        const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", following_id);

        if (error) {
            Logger.error("FollowsAPI", "Database error deleting follow", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to unfollow user",
                },
                { status: 500 }
            );
        }

        Logger.success("FollowsAPI", "Follow relationship deleted", {
            follower_id: user.id,
            following_id: following_id,
        });
        timer.end("Unfollow completed");

        return NextResponse.json({
            success: true,
            message: "Successfully unfollowed user",
        });
    } catch (error) {
        Logger.error("FollowsAPI", "Failed to unfollow user", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to unfollow user",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/follows - Get follow status or follow relationships
 * Query params: 
 *   - ?user_id=xxx - Check if current user is following this user
 *   - ?type=followers&target_user_id=xxx - Get followers of a user
 *   - ?type=following&target_user_id=xxx - Get users that target user is following
 */
export async function GET(request: NextRequest) {
    const timer = Logger.timer("FollowsAPI", "GET /api/follows");

    try {
        Logger.request("FollowsAPI", "GET", "/api/follows");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("FollowsAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const user_id = searchParams.get("user_id");
        const type = searchParams.get("type");
        const target_user_id = searchParams.get("target_user_id");

        // Check if current user is following a specific user
        if (user_id) {
            Logger.db("FollowsAPI", "SELECT", "follows");

            const { data, error } = await supabase
                .from("follows")
                .select("id")
                .eq("follower_id", user.id)
                .eq("following_id", user_id)
                .maybeSingle();

            if (error) {
                Logger.error("FollowsAPI", "Database error checking follow status", {
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

            const followStatus: FollowStatus = {
                isFollowing: !!data,
                followId: data?.id,
            };

            Logger.success("FollowsAPI", "Follow status checked", followStatus);
            timer.end("Follow status retrieved");

            return NextResponse.json({
                success: true,
                data: followStatus,
            });
        }

        // Get followers or following
        if (type && target_user_id) {
            Logger.db("FollowsAPI", "SELECT", `follows with accounts`);

            if (type === "followers") {
                // Get followers of target user
                const { data, error } = await supabase
                    .from("follows")
                    .select(`
                        id,
                        created_at,
                        follower:follower_id (
                            id,
                            username,
                            full_name,
                            avatar_url,
                            bio
                        )
                    `)
                    .eq("following_id", target_user_id)
                    .order("created_at", { ascending: false });

                if (error) {
                    Logger.error("FollowsAPI", "Database error fetching followers", {
                        error: error.message,
                    });
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Failed to fetch followers",
                        },
                        { status: 500 }
                    );
                }

                Logger.success("FollowsAPI", "Followers fetched", {
                    count: data?.length || 0,
                });
                timer.end("Followers retrieved");

                return NextResponse.json({
                    success: true,
                    data: data,
                });
            } else if (type === "following") {
                // Get users that target user is following
                const { data, error } = await supabase
                    .from("follows")
                    .select(`
                        id,
                        created_at,
                        following:following_id (
                            id,
                            username,
                            full_name,
                            avatar_url,
                            bio
                        )
                    `)
                    .eq("follower_id", target_user_id)
                    .order("created_at", { ascending: false });

                if (error) {
                    Logger.error("FollowsAPI", "Database error fetching following", {
                        error: error.message,
                    });
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Failed to fetch following",
                        },
                        { status: 500 }
                    );
                }

                Logger.success("FollowsAPI", "Following fetched", {
                    count: data?.length || 0,
                });
                timer.end("Following retrieved");

                return NextResponse.json({
                    success: true,
                    data: data,
                });
            }
        }

        Logger.warn("FollowsAPI", "Invalid query parameters");
        return NextResponse.json(
            {
                success: false,
                error: "Invalid query parameters",
            },
            { status: 400 }
        );
    } catch (error) {
        Logger.error("FollowsAPI", "Failed to process follow request", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to process request",
            },
            { status: 500 }
        );
    }
}
