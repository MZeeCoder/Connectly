"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            isOpen,
            onClose,
            title,
            description,
            children,
            className,
            showCloseButton = true,
        },
        ref
    ) => {
        React.useEffect(() => {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };

            if (isOpen) {
                document.addEventListener("keydown", handleEscape);
                document.body.style.overflow = "hidden";
            }

            return () => {
                document.removeEventListener("keydown", handleEscape);
                document.body.style.overflow = "unset";
            };
        }, [isOpen, onClose]);

        if (!isOpen) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal Content */}
                <div
                    ref={ref}
                    className={cn(
                        "relative z-50 w-full max-w-lg rounded-lg bg-card p-6 shadow-xl",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            <span className="sr-only">Close</span>
                        </button>
                    )}

                    {/* Header */}
                    {(title || description) && (
                        <div className="mb-4">
                            {title && (
                                <h2 className="text-lg font-semibold leading-none tracking-tight">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div>{children}</div>
                </div>
            </div>
        );
    }
);

Modal.displayName = "Modal";

export { Modal };
