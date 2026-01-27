"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutAction } from "@/server/actions/auth.actions";

/**
 * Logout Button Component
 * 
 * This component provides a button to log out the user.
 * It calls the logout server action and redirects to the login page.
 * 
 * Usage:
 * ```tsx
 * import LogoutButton from "@/components/auth/LogoutButton";
 * 
 * export function Header() {
 *   return (
 *     <header>
 *       <LogoutButton />
 *     </header>
 *   );
 * }
 * ```
 */
export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);

        try {
            // Call the logout server action
            const result = await LogoutAction();

            if (result.success) {
                // Redirect to login page
                router.push(result.data?.redirectTo || "/login");
                router.refresh(); // Refresh to clear any cached data
            } else {
                // Even if the action fails, try to redirect
                // The middleware will catch unauthorized access anyway
                router.push("/login");
            }
        } catch (error) {
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 border border-destructive/50 text-destructive rounded-md text-sm font-medium hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
            {isLoading ? "Logging out..." : "Logout"}
        </button>
    );
}

/**
 * Alternative: Inline Logout Button
 * Simpler version without loading state
 */
export function SimpleLogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/login", { method: "DELETE" });
        router.push("/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            className="text-destructive hover:text-destructive/80 text-sm font-medium"
        >
            Logout
        </button>
    );
}
