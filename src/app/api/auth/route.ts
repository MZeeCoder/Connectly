import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Structured logging for API routes
const logInfo = (action: string, message: string, data?: object) => {
    console.log(`[${new Date().toISOString()}] [INFO] 👤 [${action}] ${message}`, data ? JSON.stringify(data) : "");
};

const logError = (action: string, message: string, data?: object) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ❌ [${action}] ${message}`, data ? JSON.stringify(data) : "");
};

const logDebug = (action: string, message: string, data?: object) => {
    if (process.env.NODE_ENV === "development") {
        console.debug(`[${new Date().toISOString()}] [DEBUG] 🔍 [${action}] ${message}`, data ? JSON.stringify(data) : "");
    }
};

/**
 * GET /api/auth/me - Get current user
 */
export async function GET() {
    logInfo("GetCurrentUser", "Fetching current user");

    try {
        const supabase = await createClient();
        logDebug("GetCurrentUser", "Supabase client created");

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
            logError("GetCurrentUser", "Auth error", { error: authError.message });
        }

        if (!user) {
            logInfo("GetCurrentUser", "No authenticated user found");
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        logDebug("GetCurrentUser", "User authenticated", { userId: user.id, email: user.email });

        // Fetch from Accounts table (not users)
        const { data: userData, error: dbError } = await supabase
            .from("Accounts")
            .select("*")
            .eq("id", user.id)
            .single();

        if (dbError && dbError.code !== "PGRST116") {
            logError("GetCurrentUser", "Database error fetching account", {
                userId: user.id,
                error: dbError.message
            });
        }

        logInfo("GetCurrentUser", "User data fetched successfully", {
            userId: user.id,
            hasAccountData: !!userData
        });

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                ...userData,
            },
        });
    } catch (error) {
        logError("GetCurrentUser", "Unexpected error", {
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch user",
            },
            { status: 500 }
        );
    }
}
