"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_ROUTES } from "@/lib/constants";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { SignupAction } from "@/server/actions/auth.actions";
import { clientLogger } from "@/utils/logger";

export default function SignupForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        clientLogger.info("SignupForm", "Starting signup submission", { email, username });

        const result = await SignupAction({
            email,
            password,
            username,
        });

        if (result.success && result.data) {
            clientLogger.success("SignupForm", "Signup successful", { email, username });
            setIsSuccess(true);
        } else {
            clientLogger.error("SignupForm", "Signup failed", {
                email,
                username,
                error: result.error
            });
            setError(result.error || "Failed to create account");
        }
        setIsLoading(false);
    };

    // Success state - show only success message
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center text-green-500 text-3xl">
                            <FiUserPlus />
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white">Account Created!</h2>
                        <p className="text-green-500 text-sm">
                            Please check your email to verify your account. Click the verification link to activate your account.
                        </p>
                    </div>

                    {/* Back to Login */}
                    <Link href={APP_ROUTES.SIGN_IN}>
                        <Button className="w-full bg-primary hover:bg-primary/80 text-black font-semibold">
                            Go to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* User Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiUserPlus />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Create an account
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Join us today
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-500 text-sm text-center">
                        {error}
                    </p>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="text"
                            label=""
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="pl-10 bg-gray text-white  placeholder-gray-400"
                            autoComplete="username"
                            name="username"
                            required
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
                            autoComplete="email"
                            name="email"
                            required
                        />
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>





                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Password (min 8 characters)"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray text-white  placeholder-gray-400"
                            autoComplete="new-password"
                            name="password"
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

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
                    >
                        Sign Up
                    </Button>
                </form>

                {/* Sign In Link */}
                <div className="text-center text-gray-500 text-sm mt-4">
                    Already have an account?{" "}
                    <Link href={APP_ROUTES.SIGN_IN} className="text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
