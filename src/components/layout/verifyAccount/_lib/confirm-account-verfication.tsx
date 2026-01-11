"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { APP_ROUTES } from "@/lib/constants";
import { confirmAccountAction } from "@/server/actions/auth.actions";

interface ConfirmAccountVerificationProps {
    userEmail: string;
}

export default function ConfirmAccountVerification({ userEmail }: ConfirmAccountVerificationProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirmAccount = async () => {
        setIsLoading(true);
        setError(null);
        debugger;
        try {
            const result = await confirmAccountAction();

            if (result.success) {
                router.push(APP_ROUTES.DASHBOARD);
            } else {
                setError(result.error || "Failed to confirm account. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
                <div className="space-y-2 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg
                            className="h-8 w-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
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
                    <p className="text-muted-foreground">
                        Your email{" "}
                        <span className="font-medium text-foreground">{userEmail}</span>{" "}
                        has been successfully verified.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Click the button below to complete your registration and access your dashboard.
                    </p>
                    <Button
                        onClick={handleConfirmAccount}
                        isLoading={isLoading}
                        className="w-full"
                        size="lg"
                    >
                        Confirm Account
                    </Button>
                </div>
            </div>
        </div>
    );
}