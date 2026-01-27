import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

/**
 * GET /api/profile/posts - Get current user's posts
 */
export async function GET() {
    const timer = Logger.timer("ProfilePostsAPI", "GET /api/profile/posts");

    try {
        Logger.request("ProfilePostsAPI", "GET", "/api/profile/posts");
        Logger.debug("ProfilePostsAPI", "Fetching current user's posts");

        const supabase = await createClient();

        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("ProfilePostsAPI", "User not authenticated");
            return NextResponse.json(
                {
                    success: false,
                    error: "User not authenticated",
                },
                { status: 401 }
            );
        }

        Logger.db("ProfilePostsAPI", "SELECT", "posts");
        const { data: posts, error } = await supabase
            .from("posts")
            .select(`
                *,
                accounts:user_id (
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            Logger.error("ProfilePostsAPI", "Database error fetching posts", {
                error: error.message,
            });
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to fetch posts",
                },
                { status: 500 }
            );
        }

        // Map the data to include user field for PostCard compatibility
        const formattedPosts = posts?.map(post => ({
            ...post,
            user: Array.isArray(post.accounts) ? post.accounts[0] : post.accounts
        })) || [];

        Logger.success("ProfilePostsAPI", "Posts fetched successfully", {
            count: formattedPosts.length,
        });
        timer.end("Posts retrieved");

        return NextResponse.json({
            success: true,
            data: formattedPosts,
        });
    } catch (error) {
        Logger.error("ProfilePostsAPI", "Failed to fetch posts", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch posts",
            },
            { status: 500 }
        );
    }
}
