"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { FiMail, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { SITE_URL } from "@/lib/constants";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${SITE_URL}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
                setIsLoading(false);
                return;
            }

            setSuccess(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    // Success state
    if (success) {
        return (
            <div className="flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center text-green-500 text-3xl">
                            <FiCheckCircle />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white">Check Your Email</h2>
                        <p className="text-gray-400 text-sm">
                            We've sent a password reset link to <strong className="text-white">{email}</strong>.
                            Click the link in the email to reset your password.
                        </p>
                    </div>
                    <Link href="/login">
                        <Button variant="primary" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Forgot password form
    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* Mail Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiMail />
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <h2 className="text-xl font-semibold text-white">Forgot Password?</h2>
                    <p className="text-gray-400 text-sm">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-600 text-white p-3 rounded text-sm flex items-center gap-2">
                        <FiAlertCircle className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            label=""
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
                            required
                        />
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                </form>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
