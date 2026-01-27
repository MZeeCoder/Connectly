"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
    user: User | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Client-side hook for authentication state
 */
export function useAuth() {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) throw error;

                setState({
                    user,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                setState({
                    user: null,
                    loading: false,
                    error: error instanceof Error ? error : new Error("Failed to get user"),
                });
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setState({
                    user: session?.user ?? null,
                    loading: false,
                    error: null,
                });
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: !!state.user,
    };
}
