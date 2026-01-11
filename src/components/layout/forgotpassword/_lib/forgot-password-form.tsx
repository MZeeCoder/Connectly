"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ResetPasswordAction } from "@/server/actions/auth.actions";
import { APP_ROUTES } from "@/lib/constants";
import { FiLock } from "react-icons/fi";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        // Get email from query parameters
        const emailParam = searchParams.get("email");
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(undefined);

        // Validation
        if (!email) {
            setError("Email is required.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const result = await ResetPasswordAction({ email, password });

            if (result.success) {
                router.push(APP_ROUTES.SIGN_IN);
            } else {
                setError(result.error || "Failed to reset password.");
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
                {/* Lock Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiLock />
                    </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-white">
                        Create New Password
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Enter your new password below to reset your account password.
                    </p>
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
                            type="password"
                            placeholder="New Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
                            required
                            disabled={isLoading}
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <Input
                            label=""
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 bg-gray text-white placeholder-gray-400"
                            required
                            disabled={isLoading}
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            </div>
        </div>
    );
}