import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/me - Get current user
 */
export async function GET() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                ...userData,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch user",
            },
            { status: 500 }
        );
    }
}
