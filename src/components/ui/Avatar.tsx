"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ src, alt, fallback, size = "md", className, ...props }, ref) => {
        const [imageError, setImageError] = React.useState(false);

        const getFallbackText = () => {
            if (fallback) return fallback;
            if (alt) return alt.charAt(0).toUpperCase();
            return "?";
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
                    sizeClasses[size],
                    className
                )}
                {...props}
            >
                {src && !imageError ? (
                    <img
                        src={src}
                        alt={alt || "Avatar"}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span className="font-medium text-muted-foreground">
                        {getFallbackText()}
                    </span>
                )}
            </div>
        );
    }
);

Avatar.displayName = "Avatar";

export { Avatar };
