import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Post } from "@/types";
import { Logger } from "@/utils/logger";

// Select query for posts with user info
const POST_SELECT_QUERY = `
    id,
    user_id,
    content,
    image_url,
    image_urls,
    video_urls,
    likes_count,
    comments_count,
    created_at,
    updated_at,
    user:accounts(*)
`;

/**
 * Post service - handles all post-related database operations
 */
export class PostService {
    /**
     * Get paginated posts feed
     */
    static async getFeed(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<Post[]> {
        const timer = Logger.timer("PostService", "getFeed");

        try {
            Logger.debug("PostService", "Fetching posts feed", {
                page,
                pageSize,
            });

            const supabase = await createClient();
            const offset = (page - 1) * pageSize;

            Logger.db("PostService", "SELECT", "posts");
            const { data, error } = await supabase
                .from("posts")
                .select(POST_SELECT_QUERY)
                .order("created_at", { ascending: false })
                .range(offset, offset + pageSize - 1);

            if (error) {
                Logger.error("PostService", "Failed to fetch feed", {
                    error: error.message,
                    code: error.code,
                    page,
                });
                throw error;
            }

            Logger.success("PostService", "Feed fetched successfully", {
                count: data.length,
                page,
            });
            timer.end("Feed fetched");

            return data as unknown as Post[];
        } catch (error) {
            Logger.error("PostService", "Unexpected error in getFeed", {
                error: error instanceof Error ? error.message : String(error),
                page,
            });
            throw error;
        }
    }

    /**
     * Get a single post by ID
     */
    static async getPostById(postId: string): Promise<Post | null> {
        const timer = Logger.timer("PostService", "getPostById");

        try {
            Logger.debug("PostService", "Fetching post by ID", { postId });

            const supabase = await createClient();

            Logger.db("PostService", "SELECT", "posts");
            const { data, error } = await supabase
                .from("posts")
                .select(POST_SELECT_QUERY)
                .eq("id", postId)
                .single();

            if (error) {
                Logger.warn("PostService", "Post not found", {
                    postId,
                    error: error.message,
                });
                return null;
            }

            Logger.success("PostService", "Post fetched successfully", {
                postId,
            });
            timer.end("Post fetched");

            return data as unknown as Post;
        } catch (error) {
            Logger.error("PostService", "Unexpected error in getPostById", {
                postId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
    }

    /**
     * Get posts by user ID
     */
    static async getPostsByUserId(userId: string): Promise<Post[]> {
        const timer = Logger.timer("PostService", "getPostsByUserId");

        try {
            Logger.debug("PostService", "Fetching posts by user ID", { userId });

            const supabase = await createClient();

            Logger.db("PostService", "SELECT", "posts");
            const { data, error } = await supabase
                .from("posts")
                .select(POST_SELECT_QUERY)
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                Logger.error("PostService", "Failed to fetch user posts", {
                    userId,
                    error: error.message,
                    code: error.code,
                });
                throw error;
            }

            Logger.success("PostService", "User posts fetched successfully", {
                userId,
                count: data.length,
            });
            timer.end("User posts fetched");

            return data as unknown as Post[];
        } catch (error) {
            Logger.error("PostService", "Unexpected error in getPostsByUserId", {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
