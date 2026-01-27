"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { APP_NAME, APP_ROUTES } from "@/lib/constants";
import { cn } from "@/utils/cn";

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href={APP_ROUTES.HOME} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden items-center gap-6 md:flex">
                    <Link
                        href={APP_ROUTES.DASHBOARD}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            isActive(APP_ROUTES.DASHBOARD)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Feed
                    </Link>
                    <Link
                        href={APP_ROUTES.MESSAGES}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            isActive(APP_ROUTES.MESSAGES)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Messages
                    </Link>
                    <Link
                        href={APP_ROUTES.PROFILE}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            isActive(APP_ROUTES.PROFILE)
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        Profile
                    </Link>
                </div>

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                    </Button>

                    <Avatar
                        src="/placeholder-avatar.jpg"
                        alt="User"
                        fallback="U"
                        size="sm"
                        className="cursor-pointer"
                    />
                </div>
            </div>
        </nav>
    );
}
