"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants";
import { cn } from "@/utils/cn";
import { useState, useRef, useEffect } from "react";
import { ProfileService } from "@/server/services/profile.service";
import type { ProfileUser } from "@/app/api/profile/route";

interface SidebarProps {
    activeSection: "feed" | "messages" | "peoples" | "profile" | null;
}

const sidebarItems = [
    {
        id: "feed" as const,
        label: "Feed",
        href: APP_ROUTES.DASHBOARD,
        icon: (
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        id: "messages" as const,
        label: "Messages",
        href: APP_ROUTES.MESSAGES,
        icon: (
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        id: "peoples" as const,
        label: "People",
        href: APP_ROUTES.PEOPLES,
        icon: (
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
];

export function Sidebar({ activeSection }: SidebarProps) {
    const pathname = usePathname();
    const [isHovered, setIsHovered] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Fetch profile data
    useEffect(() => {
        async function fetchProfile() {
            const result = await ProfileService.getCurrentUserProfile();
            if (result.success && result.data) {
                setProfile(result.data);
            }
        }
        fetchProfile();
    }, []);

    // Close profile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }

        if (showProfileMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showProfileMenu]);

    return (
        <aside
            className={cn(
                "fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] bg-[#1E1F20]  lg:flex flex-col transition-[width] duration-150 ease-out z-50 overflow-hidden",
                isHovered ? "w-48" : "w-14"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Navigation Items */}
            <nav className="flex flex-1 flex-col gap-1 p-2 pt-4">
                {sidebarItems.map((item) => {
                    const isActive = activeSection === item.id;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors relative overflow-hidden",
                                isActive
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-gray-400 hover:bg-[#2A2B2C] hover:text-gray-200"
                            )}
                            title={!isHovered ? item.label : undefined}
                        >
                            <div className="flex-shrink-0 w-5 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <span
                                className={cn(
                                    "whitespace-nowrap transition-all duration-150 ease-out",
                                    isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Section at Bottom */}
            <div className="relative border-t border-[#3A3B3C] p-2" ref={profileMenuRef}>
                <Link
                    href={APP_ROUTES.PROFILE}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors relative overflow-hidden",
                        activeSection === "profile"
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "text-gray-400 hover:bg-[#2A2B2C] hover:text-gray-200"
                    )}
                    title={!isHovered ? "Profile" : undefined}
                >
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || profile.username}
                            className="flex-shrink-0 h-7 w-7 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white font-semibold text-xs">
                            {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
                        </div>
                    )}
                    <div
                        className={cn(
                            "flex flex-1 items-center justify-between transition-all duration-150 ease-out",
                            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 absolute"
                        )}
                    >
                        <div className="text-left">
                            <div className="text-xs font-medium text-white">
                                {profile?.full_name || profile?.username || "User"}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                @{profile?.username || "username"}
                            </div>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn("transition-transform flex-shrink-0", showProfileMenu && "rotate-180")}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </Link>
            </div>
        </aside>
    );
}
