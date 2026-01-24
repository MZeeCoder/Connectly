import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Logger } from "@/utils/logger";

/**
 * GET /api/auth/callback
 * 
 * This handles the email confirmation callback from Supabase.
 * When the user clicks the confirmation link in their email,
 * Supabase redirects them here with a token_hash and type parameter.
 */
export async function GET(request: NextRequest) {
    const timer = Logger.timer("AuthCallback", "GET /api/auth/callback");

    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    Logger.request("AuthCallback", "GET", "/api/auth/callback");
    Logger.debug("AuthCallback", "Callback parameters received", {
        hasTokenHash: !!token_hash,
        type,
        hasError: !!error,
    });

    // Handle error from Supabase
    if (error) {
        Logger.error("AuthCallback", "Error received from Supabase", {
            error,
            errorDescription,
        });
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", errorDescription || error);
        return NextResponse.redirect(loginUrl);
    }

    // Verify we have the required token_hash
    if (!token_hash) {
        Logger.error("AuthCallback", "Missing token_hash in callback");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "Invalid confirmation link");
        return NextResponse.redirect(loginUrl);
    }

    try {
        Logger.debug("AuthCallback", "Creating Supabase client");
        const supabase = await createClient();

        Logger.auth("AuthCallback", "Verifying OTP token", { type });
        // Verify the email with the token hash
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "email" | "signup" | "recovery" | "invite" || "email",
        });

        if (verifyError) {
            Logger.error("AuthCallback", "OTP verification failed", {
                error: verifyError.message,
                code: verifyError.code,
            });
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("error", "Failed to verify email. Please try again.");
            return NextResponse.redirect(loginUrl);
        }

        if (!data.session) {
            Logger.error("AuthCallback", "No session created after verification");
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("error", "Failed to create session");
            return NextResponse.redirect(loginUrl);
        }

        Logger.success("AuthCallback", "Email verified successfully", {
            userId: data.user?.id,
            email: data.user?.email,
        });

        // Store session tokens in cookies
        Logger.debug("AuthCallback", "Setting authentication cookies");
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

        Logger.auth("AuthCallback", "Session cookies set successfully");
        timer.end("Callback processed successfully");

        // Redirect to dashboard
        const dashboardUrl = new URL("/feed", request.url);
        dashboardUrl.searchParams.set("verified", "true");
        Logger.info("AuthCallback", "Redirecting to dashboard", { path: "/feed" });
        return NextResponse.redirect(dashboardUrl);
    } catch (err) {
        Logger.error("AuthCallback", "Unexpected error occurred", {
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        });
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "An unexpected error occurred");
        return NextResponse.redirect(loginUrl);
    }
}
