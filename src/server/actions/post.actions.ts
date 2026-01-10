"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Post, ApiResponse } from "@/types";

/**
 * Create a new post
 */
export async function createPostAction(formData: {
    content: string;
    image_url?: string;
    video_url?: string;
}): Promise<ApiResponse<Post>> {
    try {
        const user = await requireAuth();
        const supabase = await createClient();

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
            return {
                success: false,
                error: error.message,
            };
        }

        revalidatePath("/feed");

        return {
            success: true,
            data: data as Post,
            message: "Post created successfully!",
        };
    } catch (error) {
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
    try {
        const user = await requireAuth();
        const supabase = await createClient();

        // Verify ownership
        const { data: post } = await supabase
            .from("posts")
            .select("user_id")
            .eq("id", postId)
            .single();

        if (!post || post.user_id !== user.id) {
            return {
                success: false,
                error: "You don't have permission to delete this post",
            };
        }

        const { error } = await supabase.from("posts").delete().eq("id", postId);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        revalidatePath("/feed");

        return {
            success: true,
            message: "Post deleted successfully!",
        };
    } catch (error) {
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
    try {
        const user = await requireAuth();
        const supabase = await createClient();

        // Check if already liked
        const { data: existingLike } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from("likes")
                .delete()
                .eq("post_id", postId)
                .eq("user_id", user.id);

            if (error) throw error;
        } else {
            // Like
            const { error } = await supabase.from("likes").insert({
                post_id: postId,
                user_id: user.id,
            });

            if (error) throw error;
        }

        revalidatePath("/feed");

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to toggle like",
        };
    }
}
