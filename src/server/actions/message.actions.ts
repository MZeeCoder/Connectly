"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Message, ApiResponse } from "@/types";

/**
 * Send a message to another user
 */
export async function sendMessageAction(formData: {
    receiver_id: string;
    content: string;
}): Promise<ApiResponse<Message>> {
    try {
        const user = await requireAuth();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("messages")
            .insert({
                sender_id: user.id,
                receiver_id: formData.receiver_id,
                content: formData.content,
            })
            .select("*, sender:users!sender_id(*), receiver:users!receiver_id(*)")
            .single();

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        revalidatePath("/messages");

        return {
            success: true,
            data: data as Message,
            message: "Message sent successfully!",
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send message",
        };
    }
}

/**
 * Mark a message as read
 */
export async function markMessageAsReadAction(
    messageId: string
): Promise<ApiResponse> {
    try {
        const user = await requireAuth();
        const supabase = await createClient();

        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", messageId)
            .eq("receiver_id", user.id);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        revalidatePath("/messages");

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to mark message as read",
        };
    }
}
