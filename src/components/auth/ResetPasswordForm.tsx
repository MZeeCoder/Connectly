"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { FiLock, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";

type RecoveryState = "loading" | "valid" | "invalid";

export default function ResetPasswordForm() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recoveryState, setRecoveryState] = useState<RecoveryState>("loading");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Listen for PASSWORD_RECOVERY event
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("🔐 [ResetPassword] Auth event:", event);

                if (event === "PASSWORD_RECOVERY") {
                    console.log("✅ [ResetPassword] Valid recovery session detected");
                    setRecoveryState("valid");
                } else if (event === "SIGNED_IN" && session) {
                    // After password update, user is signed in
                    console.log("✅ [ResetPassword] Password updated successfully");
                } else if (!session && recoveryState === "loading") {
                    // No session and no recovery event - invalid link
                    console.log("❌ [ResetPassword] No valid recovery session");
                    setRecoveryState("invalid");
                }
            }
        );

        // Check if there's already a session (user arrived via recovery link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log("✅ [ResetPassword] Existing session found");
                setRecoveryState("valid");
            } else {
                // Give it a moment for the auth state change to fire
                setTimeout(() => {
                    if (recoveryState === "loading") {
                        setRecoveryState("invalid");
                    }
                }, 1500);
            }
        };

        checkSession();

        // Cleanup subscription
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase.auth, recoveryState]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Validation
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            console.log("🔐 [ResetPassword] Attempting to update password");

            // Update the user's password
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                console.error("❌ [ResetPassword] Update error:", updateError);
                setError(updateError.message);
                setIsLoading(false);
                return;
            }

            console.log("✅ [ResetPassword] Password updated successfully");
            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            console.error("❌ [ResetPassword] Unexpected error:", err);
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    // Loading state
    if (recoveryState === "loading") {
        return (
            <div className="flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    </div>
                    <p className="text-center text-gray-400">Verifying recovery link...</p>
                </div>
            </div>
        );
    }

    // Invalid recovery link state
    if (recoveryState === "invalid") {
        return (
            <div className="flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center text-red-500 text-3xl">
                            <FiAlertCircle />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold text-white">Invalid or Expired Link</h2>
                        <p className="text-gray-400 text-sm">
                            This password recovery link is invalid or has expired. Please request a new one.
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
                        <h2 className="text-xl font-semibold text-white">Password Updated!</h2>
                        <p className="text-gray-400 text-sm">
                            Your password has been successfully updated. Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm bg-gray-dark rounded-xl p-8 space-y-6 shadow-lg animate-[slideDown_0.5s_ease-out]">
                {/* Lock Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gray rounded-full flex items-center justify-center text-white text-2xl">
                        <FiLock />
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                    <p className="text-gray-400 text-sm">Enter your new password below</p>
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
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray text-white placeholder-gray-400"
                            required
                            minLength={6}
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label=""
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 bg-gray text-white placeholder-gray-400"
                            required
                            minLength={6}
                        />
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating Password..." : "Update Password"}
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
