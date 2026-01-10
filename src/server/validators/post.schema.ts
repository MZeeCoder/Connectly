import { z } from "zod";
import { POST_MAX_LENGTH } from "@/lib/constants";

/**
 * Post validation schema
 */
export const createPostSchema = z.object({
    content: z
        .string()
        .min(1, "Post content is required")
        .max(POST_MAX_LENGTH, `Post content must be less than ${POST_MAX_LENGTH} characters`),
    image_url: z.string().url().optional(),
    video_url: z.string().url().optional(),
});

export const updatePostSchema = z.object({
    content: z
        .string()
        .min(1, "Post content is required")
        .max(POST_MAX_LENGTH, `Post content must be less than ${POST_MAX_LENGTH} characters`)
        .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
