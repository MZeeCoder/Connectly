"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_ROUTES } from "@/lib/constants";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SignupAction } from "@/server/actions/auth.actions";
import { clientLogger } from "@/utils/logger";
import AlertMessage from "@/components/auth/AlertMessage";
import authMessages from "@/lib/auth.json";

export default function SignupForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
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
            setIsRedirecting(true);
            setIsLoading(false);
            // Brief delay to show success message before transitioning
            setTimeout(() => setIsSuccess(true), 800);
        } else {
            clientLogger.error("SignupForm", "Signup failed", {
                email,
                username,
                error: result.error
            });
            setError(result.error || authMessages.messages.signup.errors.generic);
        }
        setIsLoading(false);
    };

    // Success state - show only success message
    if (isSuccess) {
        return (
            <div className="flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm bg-card rounded-2xl p-6 space-y-5 shadow-lg border border-border animate-[slideDown_0.5s_ease-out]">
                    {/* Success Message */}
                    <AlertMessage
                        type="success"
                        title={authMessages.messages.signup.success.title}
                        description={authMessages.messages.signup.success.description}
                    />

                    {/* Back to Login */}
                    <Link href={APP_ROUTES.SIGN_IN}>
                        <Button className="w-full bg-primary hover:bg-primary/80 text-black font-semibold">
                            {authMessages.labels.goToLogin}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 items-center justify-center bg-background px-4">
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
                        {authMessages.labels.createAccount}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {authMessages.labels.joinUs}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <AlertMessage
                        type="error"
                        title="Error"
                        description={error}
                    />
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">
                            Username
                        </label>
                        <Input
                            type="text"
                            label=""
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-input-background text-foreground placeholder:text-muted-foreground border-0"
                            autoComplete="username"
                            name="username"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-foreground text-sm font-medium">
                            Email
                        </label>
                        <Input
                            label=""
                            placeholder="your@email.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-input-background text-foreground placeholder:text-muted-foreground border-0"
                            autoComplete="email"
                            name="email"
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
                                placeholder="Enter your password (min 8 characters)"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10 bg-input-background text-foreground placeholder:text-muted-foreground border-0"
                                autoComplete="new-password"
                                name="password"
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

                    <Button
                        type="submit"
                        isLoading={isLoading || isRedirecting}
                        disabled={isLoading || isRedirecting}
                        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold"
                    >
                        {isRedirecting ? authMessages.messages.signup.success.description : authMessages.labels.signUp}
                    </Button>
                </form>

                {/* Sign In Link */}
                <div className="text-center text-muted-foreground text-sm">
                    {authMessages.labels.alreadyMember}{" "}
                    <Link href={APP_ROUTES.SIGN_IN} className="text-primary hover:underline">
                        {authMessages.labels.signIn}
                    </Link>
                </div>
            </div>
        </div>
    );
}