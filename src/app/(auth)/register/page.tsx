"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAction } from "@/server/actions/auth.actions";
import { APP_NAME, APP_ROUTES } from "@/lib/constants";

export default function RegisterPage() {
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

        const result = await registerAction({
            email,
            password,
            username,
            full_name: fullName,
        });

        if (result.success && result.data) {
            router.push(result.data.redirectTo);
        } else {
            setError(result.error || "Failed to create account");
            setIsLoading(false);
        }
    };

    return (
        <div className="rounded-lg border border-border bg-card p-8 shadow-xl">
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Join {APP_NAME} today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                        {error}
                    </div>
                )}

                <Input
                    label="Username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />

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
                    helperText="Must be at least 8 characters"
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Create Account
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href={APP_ROUTES.LOGIN}
                    className="font-medium text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}
