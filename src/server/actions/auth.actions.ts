"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_ROUTES } from "@/lib/constants";
import type { LoginCredentials, RegisterCredentials, ApiResponse } from "@/types";

/**
 * Login action - authenticates user with email and password
 */
export async function loginAction(
    credentials: LoginCredentials
): Promise<ApiResponse<{ redirectTo: string }>> {
    try {
        const supabase = await createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        revalidatePath("/", "layout");

        return {
            success: true,
            data: { redirectTo: APP_ROUTES.DASHBOARD },
        };
    } catch (error) {
        return {
            success: false,
            error: "An unexpected error occurred. Please try again.",
        };
    }
}

/**
 * Register action - creates a new user account
 */
export async function registerAction(
    credentials: RegisterCredentials
): Promise<ApiResponse<{ redirectTo: string }>> {
    try {
        const supabase = await createClient();

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                data: {
                    username: credentials.username,
                    full_name: credentials.full_name,
                },
            },
        });

        if (authError) {
            return {
                success: false,
                error: authError.message,
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: "Failed to create user account.",
            };
        }

        // Create user profile in database
        const { error: profileError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: credentials.email,
            username: credentials.username,
            full_name: credentials.full_name,
        });

        if (profileError) {
            return {
                success: false,
                error: "Failed to create user profile.",
            };
        }

        revalidatePath("/", "layout");

        return {
            success: true,
            data: { redirectTo: APP_ROUTES.DASHBOARD },
            message: "Account created successfully!",
        };
    } catch (error) {
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
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect(APP_ROUTES.LOGIN);
}
