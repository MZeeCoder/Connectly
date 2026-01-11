"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_ROUTES } from "@/lib/constants";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

import { SignupAction } from "@/server/actions/auth.actions";

// Client-side logger helper
const clientLog = {
    info: (action: string, message: string, data?: object) => {
        console.log(`📝 [${action}] ${message}`, data || "");
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

export default function SignupForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        debugger;
        clientLog.info("SignupForm", "Starting signup submission", { email, username });

        const result = await SignupAction({
            email,
            password,
            username,
            full_name: fullName,
        });

        if (result.success && result.data) {
            clientLog.info("SignupForm", "Signup successful, redirecting to verify-account", {
                email,
                redirectTo: result.data.redirectTo
            });
            // Pass email as query parameter for resend functionality
            // router.push(`${result.data.redirectTo}?email=${encodeURIComponent(email)}`);
        } else {
            clientLog.error("SignupForm", "Signup failed", {
                email,
                error: result.error
            });
            setError(result.error || "Failed to create account");
            setIsLoading(false);
        }
    };

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
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
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
                            required
                        />
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <Input
                            label=""
                            placeholder="Password (min 8 characters)"
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
