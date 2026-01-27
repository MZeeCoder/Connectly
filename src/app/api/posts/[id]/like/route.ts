import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * POST /api/posts/[id]/like - Like or unlike a post
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const timer = Logger.timer("LikeAPI", `POST /api/posts/${id}/like`);

    try {
        Logger.request("LikeAPI", "POST", `/api/posts/${id}/like`);

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("LikeAPI", "Unauthorized like attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        Logger.auth("LikeAPI", "User authenticated", { userId: user.id });

        // Check if the post exists
        const { data: post } = await supabase
            .from("posts")
            .select("id")
            .eq("id", id)
            .single();

        if (!post) {
            Logger.warn("LikeAPI", "Post not found", { postId: id });
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        // Check if already liked
        const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .single();

        let liked: boolean;

        if (existingLike) {
            // Unlike - remove the like
            Logger.debug("LikeAPI", "Removing like", { postId: id, userId: user.id });

            const { error } = await supabase
                .from("likes")
                .delete()
                .eq("post_id", id)
                .eq("user_id", user.id);

            if (error) {
                Logger.error("LikeAPI", "Failed to remove like", { error: error.message });
                throw error;
            }

            // Decrement likes_count
            await supabase.rpc("decrement_likes_count", { post_id: id });

            liked = false;
            Logger.success("LikeAPI", "Like removed", { postId: id });
        } else {
            // Like - add the like
            Logger.debug("LikeAPI", "Adding like", { postId: id, userId: user.id });

            const { error } = await supabase
                .from("likes")
                .insert({
                    post_id: id,
                    user_id: user.id,
                });

            if (error) {
                Logger.error("LikeAPI", "Failed to add like", { error: error.message });
                throw error;
            }

            // Increment likes_count
            await supabase.rpc("increment_likes_count", { post_id: id });

            liked = true;
            Logger.success("LikeAPI", "Like added", { postId: id });
        }

        // Get updated likes count
        const { data: updatedPost } = await supabase
            .from("posts")
            .select("likes_count")
            .eq("id", id)
            .single();

        timer.end("Like toggled");

        return NextResponse.json({
            success: true,
            data: {
                liked,
                likes_count: updatedPost?.likes_count || 0,
            },
        });
    } catch (error) {
        Logger.error("LikeAPI", "Failed to toggle like", {
            postId: id,
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to toggle like",
            },
            { status: 500 }
        );
    }
}
