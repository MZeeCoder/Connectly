"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { APP_NAME, APP_ROUTES } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { ProfileService } from "@/server/services/profile.service";
import type { ProfileUser } from "@/app/api/profile/route";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutAction } from "@/server/actions/auth.actions";
import { Home, LogOut } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const result = await ProfileService.getCurrentUserProfile();
                if (result.success && result.data) {
                    setProfile(result.data);
                }
            } else {
                setProfile(null);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const result = await LogoutAction();
            if (result.success) {
                // If on home page, just refresh to update UI. Otherwise redirect to home.
                if (pathname === APP_ROUTES.HOME) {
                    router.refresh();
                } else {
                    router.push(APP_ROUTES.HOME);
                }
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href={APP_ROUTES.HOME} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">C</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
                </Link>

                {/* Right Side: Navigation & User Actions */}
                <div className="flex items-center gap-4">
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link href={APP_ROUTES.SIGN_IN}>
                                <Button variant="ghost" size="sm">
                                    Sign in
                                </Button>
                            </Link>
                            <Link href={APP_ROUTES.SIGN_UP}>
                                <Button size="sm" className="bg-primary/90 hover:bg-primary">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* Notification Icon - Optional, kept from original if space permits */}
                            <Button variant="ghost" size="icon" className="hidden sm:flex">
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

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="cursor-pointer">
                                        <Avatar
                                            src={profile?.avatar_url || undefined}
                                            alt={profile?.username || "User"}
                                            fallback={profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || "U"}
                                            size="sm"
                                        />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
                                            <p className="text-sm font-semibold truncate text-foreground">
                                                {profile?.email || user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push(APP_ROUTES.DASHBOARD)}>
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Feed</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
