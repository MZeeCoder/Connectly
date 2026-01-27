"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SigninAction, MagicLinkLoginAction } from "@/server/actions/auth.actions";
import { APP_ROUTES } from "@/lib/constants";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { clientLogger } from "@/utils/logger";
import AlertMessage from "@/components/auth/AlertMessage";
import authMessages from "@/lib/auth.json";

export default function SinginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [errorTitle, setErrorTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [magicLinkEmail, setMagicLinkEmail] = useState("");

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setErrorTitle("");
        setIsSendingMagicLink(true);
        setMagicLinkSent(false);

        clientLogger.info("SigninForm", "Sending magic link", { email: magicLinkEmail });

        try {
            const result = await MagicLinkLoginAction({ email: magicLinkEmail });

            if (result.success) {
                clientLogger.success("SigninForm", "Magic link sent successfully", {
                    email: magicLinkEmail
                });
                setMagicLinkSent(true);
                setError("");
            } else {
                clientLogger.error("SigninForm", "Failed to send magic link", {
                    email: magicLinkEmail,
                    error: result.error
                });
                setError(result.error || "Failed to send magic link. Please try again.");
            }
        } catch (err) {
            clientLogger.error("SigninForm", "Unexpected error sending magic link", {
                email: magicLinkEmail,
                error: err instanceof Error ? err.message : "Unknown error"
            });
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSendingMagicLink(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setErrorTitle("");
        setIsLoading(true);

        clientLogger.info("SigninForm", "Starting login submission", { email });

        try {
            const result = await SigninAction({ email, password });

            if (result.success && result.data) {
                clientLogger.success("SigninForm", "Login successful, redirecting", {
                    email,
                    redirectTo: result.data.redirectTo
                });
                setIsRedirecting(true);
                setIsLoading(false);
                // Brief delay to show success message before redirecting
                setTimeout(() => {
                    router.push(result.data.redirectTo);
                }, 600);
            } else {
                clientLogger.error("SigninForm", "Login failed", {
                    email,
                    error: result.error
                });
                setError(result.error || authMessages.messages.signin.errors.generic);
                setErrorTitle(result.errorTitle || "");
            }
        } catch (err) {
            clientLogger.error("SigninForm", "Unexpected error during login", {
                email,
                error: err instanceof Error ? err.message : "Unknown error"
            });
            setError(authMessages.messages.signin.errors.generic);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex flex-col gap-3 -mt-10 items-center justify-center  bg-background px-4">
            {/* Connectly Logo */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xl">C</span>
                </div>
                <span className="text-foreground text-2xl font-bold">Connectly</span>
            </div>
            <div className="w-full max-w-sm bg-card rounded-2xl p-6 space-y-5 shadow-lg border border-border animate-[slideDown_0.5s_ease-out]">
                {/* Title */}
                <div className="text-center space-y-1.5">
                    <h1 className="text-2xl font-bold text-foreground">
                        Sign in to your account
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Welcome back! Please enter your details
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <AlertMessage
                        type="error"
                        title={errorTitle || "Error"}
                        description={error}
                    />
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">
                            Email
                        </label>
                        <Input
                            label=""
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-input-background text-foreground placeholder:text-muted-foreground border-0"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                label=""
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10 bg-input-background text-foreground placeholder:text-muted-foreground border-0"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-left">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                            Password forgotten?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading || isRedirecting}
                        disabled={isLoading || isRedirecting}
                        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
                    >
                        {isRedirecting ? authMessages.messages.signin.success.redirecting : authMessages.labels.signIn}
                    </Button>
                </form>
                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                {/* Magic Link Login Form */}
                <form onSubmit={handleMagicLinkSubmit} className="space-y-3">
                    <div className="">
                        <label className="text-foreground text-sm font-medium">
                            Email Magic Link
                        </label>
                        <Input
                            label=""
                            placeholder="Enter your email"
                            type="email"
                            value={magicLinkEmail}
                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                            className="bg-input-background mt-1 text-foreground placeholder:text-muted-foreground border-0"
                            required
                            disabled={isSendingMagicLink}
                        />
                    </div>

                    {magicLinkSent && (
                        <AlertMessage
                            type="success"
                            title="Magic Link Sent"
                            description="Check your email for the login link. It may take a few moments to arrive."
                        />
                    )}

                    <button
                        type="submit"
                        disabled={isSendingMagicLink}
                        className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                        {isSendingMagicLink ? "Sending..." : "Send Magic Link"}
                    </button>
                </form>
                {/* Create Account */}
                <div className="text-center text-muted-foreground text-sm">
                    Not a member?{" "}
                    <Link href={APP_ROUTES.SIGN_UP} className="text-primary underline">
                        Sign up
                    </Link>
                </div>


            </div>
        </div>
    )
}