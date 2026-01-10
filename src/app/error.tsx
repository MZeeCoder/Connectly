"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <div className="text-center">
                <h2 className="mb-4 text-3xl font-bold text-foreground">
                    Something went wrong!
                </h2>
                <p className="mb-8 text-muted-foreground">
                    An unexpected error occurred. Please try again.
                </p>
                <Button onClick={() => reset()}>Try again</Button>
            </div>
        </div>
    );
}
