"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Post, ApiResponse } from "@/types";
import { Logger } from "@/utils/logger";

/**
 * Create a new post
 */
export async function createPostAction(formData: {
    content: string;
    image_url?: string;
    video_url?: string;
}): Promise<ApiResponse<Post>> {
    const timer = Logger.timer("CreatePostAction", "Create post");

    try {
        Logger.start("CreatePostAction", "Creating new post");
        Logger.debug("CreatePostAction", "Post data received", {
            hasContent: !!formData.content,
            contentLength: formData.content?.length,
            hasImage: !!formData.image_url,
            hasVideo: !!formData.video_url,
        });

        Logger.auth("CreatePostAction", "Authenticating user");
        const user = await requireAuth();
        Logger.debug("CreatePostAction", "User authenticated", {
            userId: user.id,
        });

        const supabase = await createClient();

        Logger.db("CreatePostAction", "INSERT", "posts");
        const { data, error } = await supabase
            .from("posts")
            .insert({
                user_id: user.id,
                content: formData.content,
                image_url: formData.image_url,
                video_url: formData.video_url,
            })
            .select("*, user:users(*)")
            .single();

        if (error) {
            Logger.error("CreatePostAction", "Database error creating post", {
                error: error.message,
                code: error.code,
            });
            return {
                success: false,
                error: error.message,
            };
        }

        Logger.info("CreatePostAction", "Revalidating /feed path");
        revalidatePath("/feed");

        Logger.success("CreatePostAction", "Post created successfully", {
            postId: data.id,
            userId: user.id,
        });
        timer.end("Post created");

        return {
            success: true,
            data: data as Post,
            message: "Post created successfully!",
        };
    } catch (error) {
        Logger.error("CreatePostAction", "Unexpected error creating post", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create post",
        };
    }
}

/**
 * Delete a post
 */
export async function deletePostAction(postId: string): Promise<ApiResponse> {
    const timer = Logger.timer("DeletePostAction", "Delete post");

    try {
        Logger.start("DeletePostAction", "Deleting post");
        Logger.debug("DeletePostAction", "Post deletion requested", { postId });

        Logger.auth("DeletePostAction", "Authenticating user");
        const user = await requireAuth();
        const supabase = await createClient();

        // Verify ownership
        Logger.db("DeletePostAction", "SELECT", "posts");
        const { data: post } = await supabase
            .from("posts")
            .select("user_id")
            .eq("id", postId)
            .single();

        if (!post || post.user_id !== user.id) {
            Logger.warn("DeletePostAction", "Unauthorized deletion attempt", {
                postId,
                userId: user.id,
                ownerId: post?.user_id,
            });
            return {
                success: false,
                error: "You don't have permission to delete this post",
            };
        }

        Logger.debug("DeletePostAction", "Ownership verified, proceeding with deletion");
        Logger.db("DeletePostAction", "DELETE", "posts");
        const { error } = await supabase.from("posts").delete().eq("id", postId);

        if (error) {
            Logger.error("DeletePostAction", "Database error deleting post", {
                error: error.message,
                code: error.code,
                postId,
            });
            return {
                success: false,
                error: error.message,
            };
        }

        Logger.info("DeletePostAction", "Revalidating /feed path");
        revalidatePath("/feed");

        Logger.success("DeletePostAction", "Post deleted successfully", {
            postId,
            userId: user.id,
        });
        timer.end("Post deleted");

        return {
            success: true,
            message: "Post deleted successfully!",
        };
    } catch (error) {
        Logger.error("DeletePostAction", "Unexpected error deleting post", {
            error: error instanceof Error ? error.message : String(error),
            postId,
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete post",
        };
    }
}

/**
 * Like/Unlike a post
 */
export async function toggleLikeAction(postId: string): Promise<ApiResponse> {
    const timer = Logger.timer("ToggleLikeAction", "Toggle like");

    try {
        Logger.start("ToggleLikeAction", "Toggling post like");
        Logger.debug("ToggleLikeAction", "Like toggle requested", { postId });

        Logger.auth("ToggleLikeAction", "Authenticating user");
        const user = await requireAuth();
        const supabase = await createClient();

        // Check if already liked
        Logger.db("ToggleLikeAction", "SELECT", "likes");
        const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .single();

        if (existingLike) {
            // Unlike
            Logger.debug("ToggleLikeAction", "Removing like", {
                postId,
                userId: user.id,
            });
            Logger.db("ToggleLikeAction", "DELETE", "likes");
            const { error } = await supabase
                .from("likes")
                .delete()
                .eq("post_id", postId)
                .eq("user_id", user.id);

            if (error) {
                Logger.error("ToggleLikeAction", "Error removing like", {
                    error: error.message,
                });
                throw error;
            }
            Logger.success("ToggleLikeAction", "Like removed", { postId });
        } else {
            // Like
            Logger.debug("ToggleLikeAction", "Adding like", {
                postId,
                userId: user.id,
            });
            Logger.db("ToggleLikeAction", "INSERT", "likes");
            const { error } = await supabase.from("likes").insert({
                post_id: postId,
                user_id: user.id,
            });

            if (error) {
                Logger.error("ToggleLikeAction", "Error adding like", {
                    error: error.message,
                });
                throw error;
            }
            Logger.success("ToggleLikeAction", "Like added", { postId });
        }

        Logger.info("ToggleLikeAction", "Revalidating /feed path");
        revalidatePath("/feed");

        timer.end("Like toggled");

        return {
            success: true,
        };
    } catch (error) {
        Logger.error("ToggleLikeAction", "Unexpected error toggling like", {
            error: error instanceof Error ? error.message : String(error),
            postId,
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to toggle like",
        };
    }
}
