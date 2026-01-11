"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/auth/callback
 * 
 * DEPRECATED: PKCE is now handled directly in /verify-account/page.tsx
 * 
 * This route is kept for backwards compatibility.
 * If someone hits this route with a code, we redirect to /verify-account
 * which will handle the PKCE code exchange.
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const type = requestUrl.searchParams.get("type");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    console.log(`[${new Date().toISOString()}] [INFO] 🔗 [AuthCallback] Redirecting to /verify-account`, {
        hasCode: !!code,
        type: type || "signup"
    });

    // Build redirect URL with all params for /verify-account to handle
    const redirectUrl = new URL("/verify-account", request.url);

    if (code) {
        redirectUrl.searchParams.set("code", code);
    }
    if (type) {
        redirectUrl.searchParams.set("type", type);
    }
    if (error) {
        redirectUrl.searchParams.set("error", error);
    }
    if (errorDescription) {
        redirectUrl.searchParams.set("error_description", errorDescription);
    }

    return NextResponse.redirect(redirectUrl);
}
