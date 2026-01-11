"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/constants";
import { Logger } from "@/utils/logger";
import type { SiginCredentials, SignupCredentials, ApiResponse } from "@/types";

/**
 * Signin action - authenticates user with email and password
 * Users who have not confirmed their email cannot log in
 */
export async function SigninAction(
    credentials: SiginCredentials
): Promise<ApiResponse<{ redirectTo: string }>> {
    Logger.start("SigninAction", "Starting sign-in process", { email: credentials.email });

    try {
        const supabase = await createClient();
        Logger.debug("SigninAction", "Supabase client created");

        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            Logger.error("SigninAction", "Authentication failed", {
                email: credentials.email,
                error: error.message
            });
            return {
                success: false,
                error: error.message,
            };
        }

        Logger.debug("SigninAction", "Auth successful, checking email verification", {
            userId: data.user?.id
        });

        // Check if email is confirmed
        if (!data.user?.email_confirmed_at) {
            Logger.warn("SigninAction", "Email not verified, signing out user", {
                email: credentials.email
            });
            await supabase.auth.signOut();
            return {
                success: false,
                error: "Please verify your email before signing in. Check your inbox for the confirmation link.",
            };
        }

        revalidatePath("/", "layout");

        Logger.success("SigninAction", "Sign-in successful", {
            userId: data.user.id,
            email: data.user.email
        });

        return {
            success: true,
            data: { redirectTo: APP_ROUTES.DASHBOARD },
        };
    } catch (error) {
        Logger.error("SigninAction", "Unexpected error", {
            email: credentials.email,
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}


/**
 * Signup action - creates a new user account
 * 
 * Flow:
 * 1. User signs up → Supabase creates auth user with metadata
 * 2. Supabase sends verification email with {{ .ConfirmationURL }}
 * 3. User clicks email link → redirected to /verify-account?code=xxx
 * 4. /verify-account exchanges code for session (PKCE)
 * 5. /verify-account creates user profile → redirects to /dashboard
 * 
 * PKCE flow handled directly in /verify-account page (no separate callback route)
 */
export async function SignupAction(
    credentials: SignupCredentials
): Promise<ApiResponse<{ redirectTo: string }>> {
    Logger.start("SignupAction", "Starting signup process", {
        email: credentials.email,
        username: credentials.username
    });

    try {
        const supabase = await createClient();
        Logger.debug("SignupAction", "Supabase client created");

        // Create auth user with email confirmation required
        // User metadata is stored for later use when creating the profile
        Logger.debug("SignupAction", "Creating auth user with metadata");

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    username: credentials.username,
                    full_name: credentials.full_name,
                },
                // PKCE: Supabase redirects here with ?code=xxx after user clicks email link
                // The /verify-account page handles code exchange directly
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-account`,
            },
        });

        if (authError) {
            Logger.error("SignupAction", "Auth signup failed", {
                email: credentials.email,
                error: authError.message
            });
            return {
                success: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            Logger.error("SignupAction", "No user returned from signup", {
                email: credentials.email
            });
            return {
                success: false,
                error: "Failed to create user account.",
            };
        }

        // Note: User profile is NOT created here
        // It will be created in /verify-account after email verification
        Logger.success("SignupAction", "Auth user created, verification email sent", {
            userId: authData.user.id,
            email: authData.user.email
        });

        return {
            success: true,
            data: { redirectTo: APP_ROUTES.VERIFY_ACCOUNT },
            message: "Account created! Please check your email for the verification link.",
        };
    } catch (error) {
        Logger.error("SignupAction", "Unexpected error", {
            email: credentials.email,
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Send password reset email action
 */
export async function SendPasswordResetEmailAction(
    email: string
): Promise<ApiResponse<void>> {
    Logger.start("SendPasswordResetEmail", "Initiating password reset", { email });

    try {
        const supabase = await createClient();
        Logger.debug("SendPasswordResetEmail", "Supabase client created");

        // Generate password reset link
        // PKCE: Redirect to /verify-account with type=recovery
        // The page will exchange code and redirect to password-reset page
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-account?type=recovery`,
        });

        if (error) {
            Logger.error("SendPasswordResetEmail", "Failed to send reset email", {
                email,
                error: error.message
            });
            return {
                success: false,
                error: error.message,
            };
        }

        Logger.success("SendPasswordResetEmail", "Password reset email sent", { email });
        return {
            success: true,
            message: "Password reset email sent successfully!",
        };
    } catch (error) {
        Logger.error("SendPasswordResetEmail", "Unexpected error", {
            email,
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Reset password action - updates user password
 */
export async function ResetPasswordAction(
    credentials: { email: string; password: string }
): Promise<ApiResponse<void>> {
    Logger.start("ResetPasswordAction", "Starting password reset", { email: credentials.email });

    try {
        const supabase = await createClient();
        Logger.debug("ResetPasswordAction", "Supabase client created");

        // Update the user's password
        const { error } = await supabase.auth.updateUser({
            password: credentials.password,
        });

        if (error) {
            Logger.error("ResetPasswordAction", "Password update failed", {
                email: credentials.email,
                error: error.message
            });
            return {
                success: false,
                error: error.message,
            };
        }

        Logger.success("ResetPasswordAction", "Password reset successful", { email: credentials.email });
        return {
            success: true,
            message: "Password reset successfully!",
        };
    } catch (error) {
        Logger.error("ResetPasswordAction", "Unexpected error", {
            email: credentials.email,
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Resend verification email
 * PKCE: Points to /verify-account which handles token exchange directly
 */
export async function ResendOTPAction(
    email: string
): Promise<ApiResponse<void>> {
    Logger.start("ResendOTPAction", "Resending verification email", { email });

    try {
        const supabase = await createClient();
        Logger.debug("ResendOTPAction", "Supabase client created");

        // Resend verification email
        // PKCE: Points to /verify-account which handles code exchange
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-account`,
            }
        });

        if (error) {
            Logger.error("ResendOTPAction", "Failed to resend email", {
                email,
                error: error.message
            });
            return {
                success: false,
                error: error.message || "Failed to resend verification email.",
            };
        }

        Logger.success("ResendOTPAction", "Verification email resent", { email });
        return {
            success: true,
            message: "A new verification email has been sent.",
        };
    } catch (error) {
        Logger.error("ResendOTPAction", "Unexpected error", {
            email,
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Logout action - signs out the current user
 */
export async function logoutAction(): Promise<void> {
    Logger.start("LogoutAction", "User logging out");

    const supabase = await createClient();
    await supabase.auth.signOut();

    Logger.success("LogoutAction", "User signed out successfully");
    revalidatePath("/", "layout");
    redirect(APP_ROUTES.SIGN_IN);
}

/**
 * Create user profile in custom Accounts table
 * Called from /verify-account page after email verification
 * Can also be used as a fallback if profile creation fails elsewhere
 */
export async function createUserProfileAction(): Promise<ApiResponse<void>> {
    Logger.start("CreateUserProfile", "Starting profile creation");

    try {
        const supabase = await createClient();
        Logger.debug("CreateUserProfile", "Supabase client created");

        // Get the current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            Logger.error("CreateUserProfile", "No authenticated user found", {
                error: userError?.message
            });
            return {
                success: false,
                error: "No authenticated user found.",
            };
        }

        Logger.debug("CreateUserProfile", "User found", {
            userId: user.id,
            email: user.email
        });

        // Verify email is confirmed
        if (!user.email_confirmed_at) {
            Logger.warn("CreateUserProfile", "Email not verified", {
                userId: user.id
            });
            return {
                success: false,
                error: "Email not verified.",
            };
        }

        // Check if user already exists in Accounts table
        Logger.db("CreateUserProfile", "SELECT", "Accounts", { userId: user.id });
        const { data: existingUser, error: selectError } = await supabase
            .from("Accounts")
            .select("id")
            .eq("id", user.id)
            .single();

        if (selectError && selectError.code !== "PGRST116") {
            Logger.error("CreateUserProfile", "Error checking existing account", {
                userId: user.id,
                error: selectError.message
            });
        }

        if (existingUser) {
            Logger.info("CreateUserProfile", "Account already exists", { userId: user.id });
            return {
                success: true,
                message: "User profile already exists.",
            };
        }

        // Create user profile in Accounts table
        Logger.db("CreateUserProfile", "INSERT", "Accounts", {
            userId: user.id,
            email: user.email
        });

        const userMetadata = user.user_metadata;
        const { error: insertError } = await supabase.from("Accounts").insert({
            id: user.id,
            email: user.email,
            username: userMetadata?.username || user.email?.split("@")[0],
            full_name: userMetadata?.full_name || null,
            created_at: new Date().toISOString(),
        });

        if (insertError) {
            Logger.error("CreateUserProfile", "Failed to create account in Accounts table", {
                userId: user.id,
                error: insertError.message,
                code: insertError.code
            });
            return {
                success: false,
                error: "Failed to create user profile.",
            };
        }

        Logger.success("CreateUserProfile", "Account created successfully in Accounts table", {
            userId: user.id,
            email: user.email
        });
        return {
            success: true,
            message: "User profile created successfully.",
        };
    } catch (error) {
        Logger.error("CreateUserProfile", "Unexpected error", {
            error: error instanceof Error ? error.message : "Unknown error"
        });
        return {
            success: false,
            error: "An unexpected error occurred.",
        };
    }
}

