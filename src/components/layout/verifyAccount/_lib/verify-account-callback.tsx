"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { APP_ROUTES } from "@/lib/constants";
import { ResendOTPAction } from "@/server/actions/auth.actions";

// Client-side logger helper
const clientLog = {
    info: (action: string, message: string, data?: object) => {
        console.log(`📧 [${action}] ${message}`, data || "");
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

interface VerifyAccountCallbackProps {
    status: "pending" | "verified" | "error";
    email: string;
    errorMessage?: string;
}

/**
 * Verify Account Callback Component
 * 
 * This component handles the UI for the verification callback page.
 * It shows different states:
 * - pending: User needs to check their email and click the verification link
 * - verified: Email verified, redirecting to dashboard (rarely seen as redirect is instant)
 * - error: Something went wrong
 * 
 * NO "Confirm Account" button - verification happens automatically when user clicks email link
 */
export default function VerifyAccountCallback({
    status,
    email,
    errorMessage
}: VerifyAccountCallbackProps) {
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);

    // Log component mount and status
    useEffect(() => {
        clientLog.info("VerifyAccountCallback", "Component mounted", { status, email });
    }, [status, email]);

    const handleResendEmail = async () => {

        clientLog.info("VerifyAccountCallback", "Resend email requested", { email });
        debugger;
        if (!email || email === "your email") {
            clientLog.error("VerifyAccountCallback", "Email not available for resend");
            setResendError("Email address not available. Please sign up again.");
            return;
        }

        setIsResending(true);
        setResendMessage(null);
        setResendError(null);

        try {
            const result = await ResendOTPAction(email);
            if (result.success) {
                clientLog.info("VerifyAccountCallback", "Resend successful", { email });
                setResendMessage(result.message || "Verification email sent!");
            } else {
                clientLog.error("VerifyAccountCallback", "Resend failed", {
                    email,
                    error: result.error
                });
                setResendError(result.error || "Failed to resend email.");
            }
        } catch (err) {
            clientLog.error("VerifyAccountCallback", "Unexpected error during resend", {
                email,
                error: err instanceof Error ? err.message : "Unknown error"
            });
            setResendError("An unexpected error occurred.");
        } finally {
            setIsResending(false);
        }
    };

    if (status === "error") {
        clientLog.error("VerifyAccountCallback", "Displaying error state", { errorMessage });
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
                    <p className="text-muted-foreground">
                        {errorMessage || "Something went wrong during verification."}
                    </p>
                    <Link
                        href={APP_ROUTES.SIGN_UP}
                        className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "verified") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Email Verified!</h1>
                    <p className="text-muted-foreground">Redirecting to your dashboard...</p>
                    <div className="animate-spin mx-auto h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    // Default: pending state - waiting for user to click email link
    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center shadow-lg">
                {/* Email Icon */}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg
                        className="h-8 w-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
                    <p className="text-muted-foreground">
                        We&apos;ve sent a verification link to{" "}
                        <span className="font-medium text-foreground">{email}</span>
                    </p>
                </div>

                {/* Instructions */}
                <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        Click the link in your email to verify your account.
                        You&apos;ll be automatically logged in after verification.
                    </p>

                    <div className="rounded-md bg-muted/50 p-4 text-left">
                        <p className="font-medium text-foreground mb-2">What happens next:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Open your email inbox</li>
                            <li>Click the verification link</li>
                            <li>You&apos;ll be automatically logged in</li>
                        </ol>
                    </div>
                </div>

                {/* Resend Section */}
                <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                        Didn&apos;t receive the email?
                    </p>

                    {resendMessage && (
                        <p className="text-sm text-green-600 mb-3">{resendMessage}</p>
                    )}

                    {resendError && (
                        <p className="text-sm text-red-600 mb-3">{resendError}</p>
                    )}

                    <button
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? "Sending..." : "Resend verification email"}
                    </button>

                    <p className="text-xs text-muted-foreground mt-2">
                        Also check your spam folder
                    </p>
                </div>

                {/* Back to Sign In */}
                <div className="text-center pt-2">
                    <Link
                        href={APP_ROUTES.SIGN_IN}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
