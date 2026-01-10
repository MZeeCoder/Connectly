"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction } from "@/server/actions/auth.actions";
import { APP_NAME, APP_ROUTES } from "@/lib/constants";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await loginAction({ email, password });

        if (result.success && result.data) {
            router.push(result.data.redirectTo);
        } else {
            setError(result.error || "Failed to sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-lg border border-border bg-card p-8 shadow-xl">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in to your {APP_NAME} account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Sign In
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                    href={APP_ROUTES.REGISTER}
                    className="font-medium text-primary hover:underline"
                >
                    Sign up
                </Link>
            </p>
        </div>
    );
}
