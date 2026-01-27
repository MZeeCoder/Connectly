import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostService } from "@/server/services/post.service";
import { Logger } from "@/utils/logger";
import type { UpdatePostData } from "@/types";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/posts/[id] - Get a single post by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const timer = Logger.timer("PostAPI", `GET /api/posts/${id}`);

    try {
        Logger.request("PostAPI", "GET", `/api/posts/${id}`);

        const post = await PostService.getPostById(id);

        if (!post) {
            Logger.warn("PostAPI", "Post not found", { postId: id });
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        Logger.success("PostAPI", "Post fetched successfully", { postId: id });
        timer.end("Post retrieved");

        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (error) {
        Logger.error("PostAPI", "Failed to fetch post", {
            postId: id,
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch post",
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/posts/[id] - Update a post
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const timer = Logger.timer("PostAPI", `PUT /api/posts/${id}`);

    try {
        Logger.request("PostAPI", "PUT", `/api/posts/${id}`);

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("PostAPI", "Unauthorized update attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify ownership
        const { data: existingPost } = await supabase
            .from("posts")
            .select("user_id")
            .eq("id", id)
            .single();

        if (!existingPost) {
            Logger.warn("PostAPI", "Post not found for update", { postId: id });
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        if (existingPost.user_id !== user.id) {
            Logger.warn("PostAPI", "Unauthorized update - not owner", {
                postId: id,
                userId: user.id,
                ownerId: existingPost.user_id,
            });
            return NextResponse.json(
                { success: false, error: "You can only edit your own posts" },
                { status: 403 }
            );
        }

        const body: UpdatePostData = await request.json();
        Logger.debug("PostAPI", "Update data received", {
            postId: id,
            hasContent: !!body.content,
            imageCount: body.image_urls?.length,
            videoCount: body.video_urls?.length,
        });

        // Build update object - only include fields that are provided
        const updateData: Record<string, unknown> = {};
        if (body.content !== undefined) updateData.content = body.content.trim();
        if (body.image_urls !== undefined) updateData.image_urls = body.image_urls;
        if (body.video_urls !== undefined) updateData.video_urls = body.video_urls;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, error: "No update data provided" },
                { status: 400 }
            );
        }

        Logger.db("PostAPI", "UPDATE", "posts");
        const { data, error } = await supabase
            .from("posts")
            .update(updateData)
            .eq("id", id)
            .select(`
                *,
                user:accounts(*)
            `)
            .single();

        if (error) {
            Logger.error("PostAPI", "Database error updating post", {
                error: error.message,
                code: error.code,
            });
            throw error;
        }

        Logger.success("PostAPI", "Post updated successfully", { postId: id });
        timer.end("Post updated");

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        Logger.error("PostAPI", "Failed to update post", {
            postId: id,
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update post",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/posts/[id] - Delete a post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const timer = Logger.timer("PostAPI", `DELETE /api/posts/${id}`);

    try {
        Logger.request("PostAPI", "DELETE", `/api/posts/${id}`);

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("PostAPI", "Unauthorized delete attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get the post to verify ownership and get media URLs for cleanup
        const { data: existingPost } = await supabase
            .from("posts")
            .select("user_id, image_urls, video_urls")
            .eq("id", id)
            .single();

        if (!existingPost) {
            Logger.warn("PostAPI", "Post not found for deletion", { postId: id });
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        if (existingPost.user_id !== user.id) {
            Logger.warn("PostAPI", "Unauthorized delete - not owner", {
                postId: id,
                userId: user.id,
                ownerId: existingPost.user_id,
            });
            return NextResponse.json(
                { success: false, error: "You can only delete your own posts" },
                { status: 403 }
            );
        }

        // Delete the post
        Logger.db("PostAPI", "DELETE", "posts");
        const { error } = await supabase
            .from("posts")
            .delete()
            .eq("id", id);

        if (error) {
            Logger.error("PostAPI", "Database error deleting post", {
                error: error.message,
                code: error.code,
            });
            throw error;
        }

        // Clean up media files from storage (best effort, don't fail if this fails)
        try {
            const mediaUrls = [
                ...(existingPost.image_urls || []),
                ...(existingPost.video_urls || []),
            ];

            if (mediaUrls.length > 0) {
                // Extract file paths from URLs
                const paths = mediaUrls
                    .map((url: string) => {
                        const match = url.match(/posts-media\/(.+)$/);
                        return match ? match[1] : null;
                    })
                    .filter(Boolean) as string[];

                if (paths.length > 0) {
                    Logger.debug("PostAPI", "Cleaning up media files", { paths });
                    await supabase.storage.from("posts-media").remove(paths);
                }
            }
        } catch (cleanupError) {
            Logger.warn("PostAPI", "Failed to clean up media files", {
                error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
            });
        }

        Logger.success("PostAPI", "Post deleted successfully", { postId: id });
        timer.end("Post deleted");

        return NextResponse.json({
            success: true,
            message: "Post deleted successfully",
        });
    } catch (error) {
        Logger.error("PostAPI", "Failed to delete post", {
            postId: id,
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete post",
            },
            { status: 500 }
        );
    }
}
