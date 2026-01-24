"use client";

import React from "react";
import { clientLogger } from "@/utils/logger";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and logs them
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        clientLogger.error("ErrorBoundary", "React error caught", {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <div className="max-w-md rounded-lg border border-destructive bg-card p-6 text-center shadow-lg">
                        <h2 className="mb-2 text-xl font-bold text-destructive">
                            Oops! Something went wrong
                        </h2>
                        <p className="mb-4 text-muted-foreground">
                            We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                                    Error Details
                                </summary>
                                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                                    {this.state.error.message}
                                    {"\n\n"}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
