"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SigninAction } from "@/server/actions/auth.actions";
import { APP_ROUTES } from "@/lib/constants";
import { FiUser, FiLock } from "react-icons/fi";

// Client-side logger helper
const clientLog = {
    info: (action: string, message: string, data?: object) => {
        console.log(`🔐 [${action}] ${message}`, data || "");
    },
    error: (action: string, message: string, data?: object) => {
        console.error(`❌ [${action}] ${message}`, data || "");
    },
    debug: (action: string, message: string, data?: object) => {
        if (process.env.NODE_ENV === "development") {
            console.debug(`🔍 [${action}] ${message}`, data || "");
        }
    },
};

export default function SinginForm() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        clientLog.info("SigninForm", "Starting sign-in submission", { email: username });

        try {
            const result = await SigninAction({ email: username, password });

            if (result.success && result.data) {
                clientLog.info("SigninForm", "Sign-in successful, redirecting", {
                    email: username,
                    redirectTo: result.data.redirectTo
                });
                router.push(result.data.redirectTo);
            } else {
                clientLog.error("SigninForm", "Sign-in failed", {
                    email: username,
                    error: result.error
                });
                setError(result.error || "Failed to sign in. Please try again.");
            }
        } catch (err) {
            clientLog.error("SigninForm", "Unexpected error during sign-in", {
                email: username,
                error: err instanceof Error ? err.message : "Unknown error"
            });
            setError("Something went wrong. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* User Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiUser />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-600 text-white p-2 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 bg-gray text-white  placeholder-gray-400"
                            required
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-gray text-white  placeholder-gray-400"
                            required
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
                    >
                        Sign In
                    </Button>

                    {/* Remember & Forgot */}
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="accent-primary"
                            />
                            Remember me
                        </label>

                        <Link href="/forgot-password" className="hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </form>

                {/* Create Account */}
                <div className="text-center text-gray-500 text-sm mt-4">
                    Not a member?{" "}
                    <Link href={APP_ROUTES.SIGN_UP} className="text-primary underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}