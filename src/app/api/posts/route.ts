import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PostService } from "@/server/services/post.service";

/**
 * GET /api/posts - Get all posts
 */
export async function GET() {
    try {
        const posts = await PostService.getFeed();

        return NextResponse.json({
            success: true,
            data: posts,
        });
    } catch (error) {
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
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

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

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create post",
            },
            { status: 500 }
        );
    }
}
