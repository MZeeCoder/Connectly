"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Logger } from "@/utils/logger";
import { SITE_URL } from "@/lib/constants";

/**
 * Server Action for user signup
 */
export async function SignupAction(data: {
    email: string;
    password: string;
    username: string;
}) {
    const timer = Logger.timer("SignupAction", "User signup");

    try {
        Logger.start("SignupAction", "Starting user signup process");
        Logger.debug("SignupAction", "Signup data received", {
            email: data.email,
            username: data.username,
            hasPassword: !!data.password,
        });

        const supabase = await createClient();

        // Get the app URL for the confirmation redirect
        // Auto-detects: localhost:3000 in dev, production URL in prod
        const siteUrl = SITE_URL;
        Logger.debug("SignupAction", "Site URL configured", { siteUrl });

        Logger.auth("SignupAction", "Initiating Supabase signup");
        // Sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${siteUrl}/api/auth/callback`,
                data: {
                    username: data.username,
                },
            },
        });

        if (authError) {
            Logger.error("SignupAction", "Supabase auth error", {
                error: authError.message,
                code: authError.code,
            });
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            Logger.error("SignupAction", "No user returned from signup");
            return { success: false, error: "Failed to create user" };
        }

        Logger.success("SignupAction", "User signed up successfully", {
            userId: authData.user.id,
            email: authData.user.email,
        });
        Logger.info("SignupAction", "Account will be created automatically after email verification");
        timer.end("Signup completed successfully");

        return {
            success: true,
            data: {
                message: "Please check your email to verify your account",
                user: authData.user,
            },
        };
    } catch (error) {
        Logger.error("SignupAction", "Unexpected error during signup", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Server Action for user signin
 */
export async function SigninAction(data: { email: string; password: string }) {
    const timer = Logger.timer("SigninAction", "User signin");

    try {
        Logger.start("SigninAction", "Starting user signin process");
        Logger.debug("SigninAction", "Signin attempt", {
            email: data.email,
            hasPassword: !!data.password,
        });

        const supabase = await createClient();

        Logger.auth("SigninAction", "Authenticating with Supabase");
        // Sign in with email and password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            Logger.warn("SigninAction", "Authentication failed", {
                error: authError.message,
                code: authError.code,
                email: data.email,
            });
            return { success: false, error: authError.message };
        }

        if (!authData.user || !authData.session) {
            Logger.error("SigninAction", "Invalid credentials - no user or session");
            return { success: false, error: "Invalid credentials" };
        }

        Logger.success("SigninAction", "User signed in successfully", {
            userId: authData.user.id,
            email: authData.user.email,
        });
        Logger.debug("SigninAction", "Session created", {
            expiresAt: authData.session.expires_at,
        });
        timer.end("Signin completed successfully");

        // Store session tokens in cookies
        // Session tokens are automatically handled by Supabase SSR via separate set-cookie headers
        // No need to manually set them here

        return {
            success: true,
            data: {
                user: authData.user,
                redirectTo: "/feed",
            },
        };
    } catch (error) {
        Logger.error("SigninAction", "Unexpected error during signin", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

/**
 * Server Action for user logout
 */
export async function LogoutAction() {
    const timer = Logger.timer("LogoutAction", "User logout");

    try {
        Logger.start("LogoutAction", "Starting user logout process");

        const supabase = await createClient();

        Logger.auth("LogoutAction", "Signing out from Supabase");
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            Logger.error("LogoutAction", "Logout error", {
                error: error.message,
                code: error.code,
            });
            return { success: false, error: error.message };
        }

        // Clear cookies
        // Cookies are automatically cleared by supabase.auth.signOut()

        Logger.success("LogoutAction", "User logged out successfully");
        timer.end("Logout completed");

        return {
            success: true,
            data: { redirectTo: "/login" },
        };
    } catch (error) {
        Logger.error("LogoutAction", "Unexpected error during logout", {
            error: error instanceof Error ? error.message : String(error),
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
