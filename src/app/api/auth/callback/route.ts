import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/callback
 * 
 * This handles the email confirmation callback from Supabase.
 * When the user clicks the confirmation link in their email,
 * Supabase redirects them here with a token_hash and type parameter.
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    console.log("🔗 [AuthCallback] Received callback", {
        hasTokenHash: !!token_hash,
        type,
        error,
    });

    // Handle error from Supabase
    if (error) {
        console.error("❌ [AuthCallback] Error from Supabase:", error, errorDescription);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", errorDescription || error);
        return NextResponse.redirect(loginUrl);
    }

    // Verify we have the required token_hash
    if (!token_hash) {
        console.error("❌ [AuthCallback] Missing token_hash");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "Invalid confirmation link");
        return NextResponse.redirect(loginUrl);
    }

    try {
        const supabase = await createClient();

        // Verify the email with the token hash
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "email" | "signup" | "recovery" | "invite" || "email",
        });

        if (verifyError) {
            console.error("❌ [AuthCallback] Verification error:", verifyError);
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("error", "Failed to verify email. Please try again.");
            return NextResponse.redirect(loginUrl);
        }

        if (!data.session) {
            console.error("❌ [AuthCallback] No session created");
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("error", "Failed to create session");
            return NextResponse.redirect(loginUrl);
        }

        console.log("✅ [AuthCallback] Email verified successfully for user:", data.user?.id);

        // Store session tokens in cookies
        const cookieStore = await cookies();
        cookieStore.set("token", data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        cookieStore.set("refresh_token", data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // Redirect to dashboard
        const dashboardUrl = new URL("/feed", request.url);
        dashboardUrl.searchParams.set("verified", "true");
        return NextResponse.redirect(dashboardUrl);
    } catch (err) {
        console.error("❌ [AuthCallback] Unexpected error:", err);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "An unexpected error occurred");
        return NextResponse.redirect(loginUrl);
    }
}
