import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Post } from "@/types";

/**
 * Post service - handles all post-related database operations
 */
export class PostService {
    /**
     * Get paginated posts feed
     */
    static async getFeed(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<Post[]> {
        const supabase = await createClient();
        const offset = (page - 1) * pageSize;

        const { data, error } = await supabase
            .from("posts")
            .select(`
        *,
        user:accounts(*),
        likes(count),
        comments(count)
      `)
            .order("created_at", { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) throw error;
        return data as Post[];
    }

    /**
     * Get a single post by ID
     */
    static async getPostById(postId: string): Promise<Post | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("posts")
            .select(`
        *,
        user:accounts(*),
        likes(count),
        comments(count)
      `)
            .eq("id", postId)
            .single();

        if (error) return null;
        return data as Post;
    }

    /**
     * Get posts by user ID
     */
    static async getPostsByUserId(userId: string): Promise<Post[]> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("posts")
            .select(`
        *,
        user:accounts(*),
        likes(count),
        comments(count)
      `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Post[];
    }
}
