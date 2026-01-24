"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Server Action for user signup
 */
export async function SignupAction(data: {
    email: string;
    password: string;
    username: string;
}) {
    try {
        const supabase = await createClient();

        // Get the app URL for the confirmation redirect
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
            console.error("❌ [SignupAction] Auth error:", authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: "Failed to create user" };
        }

        console.log("✅ [SignupAction] User signed up successfully:", authData.user.id);
        console.log("ℹ️  [SignupAction] Account will be created automatically after email verification");

        return {
            success: true,
            data: {
                message: "Please check your email to verify your account",
                user: authData.user,
            },
        };
    } catch (error) {
        console.error("❌ [SignupAction] Unexpected error:", error);
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
    try {
        const supabase = await createClient();

        // Sign in with email and password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (authError) {
            console.error("❌ [SigninAction] Auth error:", authError);
            return { success: false, error: authError.message };
        }

        if (!authData.user || !authData.session) {
            return { success: false, error: "Invalid credentials" };
        }

        console.log("✅ [SigninAction] User signed in successfully:", authData.user.id);

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
        console.error("❌ [SigninAction] Unexpected error:", error);
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
    try {
        const supabase = await createClient();

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("❌ [LogoutAction] Error:", error);
            return { success: false, error: error.message };
        }

        // Clear cookies
        // Cookies are automatically cleared by supabase.auth.signOut()


        console.log("✅ [LogoutAction] User logged out successfully");

        return {
            success: true,
            data: { redirectTo: "/login" },
        };
    } catch (error) {
        console.error("❌ [LogoutAction] Unexpected error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}
