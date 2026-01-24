"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SigninAction } from "@/server/actions/auth.actions";
import { APP_ROUTES } from "@/lib/constants";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { clientLogger } from "@/utils/logger";

export default function SinginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        clientLogger.info("SigninForm", "Starting login submission", { email });

        try {
            const result = await SigninAction({ email, password });

            if (result.success && result.data) {
                clientLogger.success("SigninForm", "Login successful, redirecting", {
                    email,
                    redirectTo: result.data.redirectTo
                });
                router.push(result.data.redirectTo);
            } else {
                clientLogger.error("SigninForm", "Login failed", {
                    email,
                    error: result.error
                });
                setError(result.error || "Failed to sign in. Please try again.");
            }
        } catch (err) {
            clientLogger.error("SigninForm", "Unexpected error during login", {
                email,
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
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-gray text-white  placeholder-gray-400"
                            required
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray text-white  placeholder-gray-400"
                            required
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
                    >
                        Sign In
                    </Button>
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