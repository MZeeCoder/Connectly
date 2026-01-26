import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostService } from "@/server/services/post.service";
import { Logger } from "@/utils/logger";
import type { CreatePostData } from "@/types";

/**
 * GET /api/posts - Get all posts (with optional user filter)
 */
export async function GET(request: NextRequest) {
    const timer = Logger.timer("PostsAPI", "GET /api/posts");

    try {
        Logger.request("PostsAPI", "GET", "/api/posts");

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "20");

        Logger.debug("PostsAPI", "Fetching posts", { userId, page, pageSize });

        let posts;
        if (userId) {
            posts = await PostService.getPostsByUserId(userId);
        } else {
            posts = await PostService.getFeed(page, pageSize);
        }

        Logger.success("PostsAPI", "Posts fetched successfully", {
            count: posts.length,
        });
        timer.end("Posts retrieved");

        return NextResponse.json({
            success: true,
            data: posts,
        });
    } catch (error) {
        Logger.error("PostsAPI", "Failed to fetch posts", {
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

/**
 * POST /api/posts - Create a new post
 */
export async function POST(request: Request) {
    const timer = Logger.timer("PostsAPI", "POST /api/posts");

    try {
        Logger.request("PostsAPI", "POST", "/api/posts");

        Logger.debug("PostsAPI", "Authenticating user");
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("PostsAPI", "Unauthorized post creation attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        Logger.auth("PostsAPI", "User authenticated", {
            userId: user.id,
            email: user.email,
        });

        const body: CreatePostData = await request.json();
        Logger.debug("PostsAPI", "Post data received", {
            hasContent: !!body.content,
            imageCount: body.image_urls?.length || 0,
            videoCount: body.video_urls?.length || 0,
        });

        // Validate that post has either content or media
        const hasContent = body.content && body.content.trim().length > 0;
        const hasMedia = (body.image_urls && body.image_urls.length > 0) || (body.video_urls && body.video_urls.length > 0);

        if (!hasContent && !hasMedia) {
            return NextResponse.json(
                { success: false, error: "Post must have either content or media" },
                { status: 400 }
            );
        }

        Logger.db("PostsAPI", "INSERT", "posts");
        const { data, error } = await supabase
            .from("posts")
            .insert({
                user_id: user.id,
                content: body.content?.trim() || "",
                image_urls: body.image_urls || [],
                video_urls: body.video_urls || [],
            })
            .select(`
                *,
                user:accounts(*)
            `)
            .single();

        if (error) {
            Logger.error("PostsAPI", "Database error creating post", {
                error: error.message,
                code: error.code,
            });
            throw error;
        }

        Logger.success("PostsAPI", "Post created successfully", {
            postId: data.id,
            userId: user.id,
        });
        timer.end("Post created");

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        Logger.error("PostsAPI", "Failed to create post", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create post",
            },
            { status: 500 }
        );
    }
}
