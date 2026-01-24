import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostService } from "@/server/services/post.service";
import { Logger } from "@/utils/logger";

/**
 * GET /api/posts - Get all posts
 */
export async function GET() {
    const timer = Logger.timer("PostsAPI", "GET /api/posts");

    try {
        Logger.request("PostsAPI", "GET", "/api/posts");

        Logger.debug("PostsAPI", "Fetching posts from PostService");
        const posts = await PostService.getFeed();

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

        const body = await request.json();
        Logger.debug("PostsAPI", "Post data received", {
            hasContent: !!body.content,
            hasImage: !!body.image_url,
            hasVideo: !!body.video_url,
        });

        Logger.db("PostsAPI", "INSERT", "posts");
        const { data, error } = await supabase
            .from("posts")
            .insert({
                user_id: user.id,
                content: body.content,
                image_url: body.image_url,
                video_url: body.video_url,
            })
            .select()
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
