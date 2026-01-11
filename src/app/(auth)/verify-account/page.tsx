import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/constants";
import { Logger } from "@/utils/logger";
import VerifyAccountCallback from "@/components/layout/verifyAccount/_lib/verify-account-callback";

/**
 * /verify-account - PKCE Callback & Verification Page
 * 
 * This page handles:
 * 1. PKCE code exchange (when user clicks email verification link)
 * 2. Shows "Check your email" message (right after signup)
 * 3. Creates user profile in Accounts table (after verification)
 * 4. Redirects to dashboard (after successful verification)
 * 
 * Flow:
 * - User signs up → redirected here with ?email=xxx → sees "Check your email"
 * - User clicks email link → Supabase redirects here with ?code=xxx
 * - This page exchanges code for session (PKCE)
 * - Creates profile in Accounts table
 * - Redirects to dashboard
 * 
 * NO separate /api/auth/callback needed - PKCE handled here directly
 */
export default async function VerifyAccountPage({
    searchParams,
}: {
    searchParams: Promise<{
        email?: string;
        error?: string;
        error_description?: string;
        code?: string;  // PKCE code from Supabase
        type?: string;  // 'signup', 'recovery', etc.
    }>;
}) {
    Logger.start("VerifyAccountPage", "Page loaded");

    const params = await searchParams;
    const supabase = await createClient();

    // ============================================
    // STEP 1: Handle PKCE Code Exchange
    // ============================================
    // If there's a code in the URL, exchange it for a session first
    if (params.code) {
        Logger.info("VerifyAccountPage", "PKCE code detected, exchanging for session", {
            hasCode: true,
            type: params.type || "signup"
        });

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);

        if (exchangeError) {
            Logger.error("VerifyAccountPage", "PKCE code exchange failed", {
                error: exchangeError.message,
                code: exchangeError.status
            });
            return (
                <VerifyAccountCallback
                    status="error"
                    email=""
                    errorMessage={exchangeError.message || "Failed to verify your email. Please try again."}
                />
            );
        }

        Logger.success("VerifyAccountPage", "PKCE code exchange successful", {
            userId: data.user?.id,
            email: data.user?.email
        });

        // For password recovery, redirect to password reset page
        if (params.type === "recovery") {
            Logger.info("VerifyAccountPage", "Recovery flow - redirecting to password reset");
            redirect(APP_ROUTES.PASSWORD_RESET);
        }

        // Continue with the normal flow - user is now authenticated
    }

    // ============================================
    // STEP 2: Handle Error from Supabase
    // ============================================
    if (params.error) {
        Logger.error("VerifyAccountPage", "Error parameter in URL", {
            error: params.error,
            description: params.error_description
        });
        return (
            <VerifyAccountCallback
                status="error"
                email=""
                errorMessage={params.error_description || params.error || "Verification failed"}
            />
        );
    }

    // ============================================
    // STEP 3: Get Current User Session
    // ============================================
    Logger.debug("VerifyAccountPage", "Fetching user session");
    const { data: { user }, error } = await supabase.auth.getUser();

    // Case 1: No user session - show "Check your email" message
    // This happens right after signup before user clicks the email link
    if (error || !user) {
        Logger.info("VerifyAccountPage", "No user session - showing check email UI", {
            hasError: !!error,
            email: params.email
        });
        const emailToShow = params.email || "your email";
        return (
            <VerifyAccountCallback
                status="pending"
                email={emailToShow}
            />
        );
    }

    Logger.debug("VerifyAccountPage", "User found", {
        userId: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at
    });

    // Case 2: User exists but email not confirmed
    if (!user.email_confirmed_at) {
        Logger.warn("VerifyAccountPage", "User exists but email not confirmed", {
            userId: user.id
        });
        return (
            <VerifyAccountCallback
                status="pending"
                email={user.email || params.email || "your email"}
            />
        );
    }

    // ============================================
    // STEP 4: Email Verified - Create Profile & Redirect
    // ============================================
    Logger.info("VerifyAccountPage", "Email verified - processing account creation", {
        userId: user.id,
        email: user.email
    });

    // Check if user already exists in custom Accounts table
    Logger.db("VerifyAccountPage", "SELECT", "Accounts", { userId: user.id });
    const { data: existingUser, error: selectError } = await supabase
        .from("Accounts")
        .select("id")
        .eq("id", user.id)
        .single();

    if (selectError && selectError.code !== "PGRST116") {
        Logger.error("VerifyAccountPage", "Error checking Accounts table", {
            userId: user.id,
            error: selectError.message,
            code: selectError.code
        });
    }

    // Create user profile if it doesn't exist
    if (!existingUser) {
        Logger.db("VerifyAccountPage", "INSERT", "Accounts", { userId: user.id });

        const userMetadata = user.user_metadata;
        const { error: insertError } = await supabase.from("Accounts").insert({
            id: user.id,
            email: user.email,
            username: userMetadata?.username || user.email?.split("@")[0],
            full_name: userMetadata?.full_name || null,
            created_at: new Date().toISOString(),
        });

        if (insertError) {
            Logger.error("VerifyAccountPage", "Failed to create account in Accounts table", {
                userId: user.id,
                error: insertError.message,
                code: insertError.code,
                details: insertError.details
            });
            // Don't block the user - they can still access the app
            // Profile creation can be retried later
        } else {
            Logger.success("VerifyAccountPage", "Account created successfully in Accounts table", {
                userId: user.id,
                email: user.email
            });
        }
    } else {
        Logger.info("VerifyAccountPage", "Account already exists in Accounts table", {
            userId: user.id
        });
    }

    // Auto-redirect to dashboard - user is now fully verified and logged in
    Logger.end("VerifyAccountPage", "Redirecting to dashboard", { userId: user.id });
    redirect(APP_ROUTES.DASHBOARD);
}

