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
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const code = requestUrl.searchParams.get("code");

  Logger.request("AuthCallback", "GET", "/api/auth/callback");
  Logger.debug("AuthCallback", "Callback parameters received", {
    hasTokenHash: !!token_hash,
    hasToken: !!token,
    hasCode: !!code,
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

  // Verify we have at least one authentication parameter
  if (!token_hash && !token && !code) {
    Logger.error(
      "AuthCallback",
      "Missing authentication parameters in callback",
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Invalid confirmation link");
    return NextResponse.redirect(loginUrl);
  }

  try {
    Logger.debug("AuthCallback", "Creating Supabase client");
    const supabase = await createClient();

    let data;
    let verifyError;

    // Handle PKCE flow (code parameter) - used by email confirmations and magic links
    if (code) {
      Logger.auth("AuthCallback", "Exchanging code for session", { type });
      const result = await supabase.auth.exchangeCodeForSession(code);
      data = result.data;
      verifyError = result.error;
    }
    // Handle OTP flow (token_hash or token parameter) - legacy email confirmations
    else if (token_hash || token) {
      Logger.auth("AuthCallback", "Verifying OTP token", { type });
      const result = await supabase.auth.verifyOtp({
        token_hash: token_hash || token || "",
        type:
          (type as "email" | "signup" | "recovery" | "invite" | "magiclink") ||
          "email",
      });
      data = result.data;
      verifyError = result.error;
    } else {
      Logger.error("AuthCallback", "No valid authentication parameter found");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Invalid confirmation link");
      return NextResponse.redirect(loginUrl);
    }

    if (verifyError) {
      Logger.error("AuthCallback", "Authentication failed", {
        error: verifyError.message,
        code: verifyError.code,
      });
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Failed to verify. Please try again.");
      return NextResponse.redirect(loginUrl);
    }

    if (!data.session) {
      Logger.error("AuthCallback", "No session created after verification");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Failed to create session");
      return NextResponse.redirect(loginUrl);
    }

    Logger.success("AuthCallback", "Authentication successful", {
      userId: data.user?.id,
      email: data.user?.email,
    });

    // Session is automatically handled by Supabase SSR
    // Cookies are set via the createClient response headers
    Logger.auth("AuthCallback", "Session established successfully");
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
