"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SendPasswordResetEmailAction } from "@/server/actions/auth.actions";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/constants";
import { FiMail } from "react-icons/fi";

export default function SendEmailResetPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(undefined);
        setSuccess(false);
        setIsLoading(true);

        try {
            const result = await SendPasswordResetEmailAction(email);

            if (result.success) {
                setSuccess(true);
                setEmail("");
            } else {
                setError(result.error || "Failed to send reset email.");
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* Email Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiMail />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        Reset Password
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Enter your email address below. You will receive a link to reset your password.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-600 text-white p-2 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-primary/20 border border-primary text-white p-3 rounded text-sm text-center">
                        Password reset email sent! Check your inbox.
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            label=""
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
                            required
                            disabled={isLoading}
                        />
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Reset Password
                    </Button>
                </form>

                {/* Sign In Link */}
                <div className="text-center text-sm">
                    <span className="text-gray-400">Password recovered? </span>
                    <Link
                        href={APP_ROUTES.SIGN_IN}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}