"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentPanel } from "@/components/layout/ContentPanel";
import { BottomNav } from "@/components/layout/BottomNav";
import RouteProgress from "@/components/layout/RouteProgress";
import PeopleForm from "@/components/people/people-form";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Determine active section from pathname
    const getActiveSection = (): "feed" | "messages" | "profile" | "explore" | "notifications" | "settings" | "peoples" | null => {
        if (pathname.startsWith("/feed")) return "feed";
        if (pathname.startsWith("/messages")) return "messages";
        if (pathname.startsWith("/profile")) return "profile";
        if (pathname.startsWith("/explore")) return "explore";
        if (pathname.startsWith("/notifications")) return "notifications";
        if (pathname.startsWith("/settings")) return "settings";
        if (pathname.startsWith("/peoples")) return "peoples";
        return null;
    };

    const activeSection = getActiveSection();
    const showContentPanel = activeSection === "feed" || activeSection === "messages" || activeSection === "profile";

    return (
        <div className="flex min-h-screen flex-col">
            {/* Top Header with Connectly Branding */}
            <header className="fixed top-0 left-0 right-0 h-12 bg-sidebar border-b border-border z-50 flex items-center justify-between px-4">
                {/* Left: Logo (always visible) */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground hidden sm:block">Connectly</h1>
                </div>

                {/* Center: Page Title (mobile only) */}
                <div className="md:hidden flex-1 text-center">
                    <h2 className="text-base font-semibold text-foreground capitalize">
                        {activeSection === "feed" ? "Home" : activeSection || "Home"}
                    </h2>
                </div>

                {/* Right: Settings Icon (mobile only) */}
                <Link href="/settings" className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors">
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
                        className="text-foreground"
                    >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </Link>
            </header>

            <RouteProgress />

            <div className="flex flex-1 bg-sidebar">
                {/* Primary Navigation Sidebar - Desktop Only */}
                <Sidebar activeSection={activeSection} />

                {/* Secondary Content Panel - Hidden on mobile for messages */}
                {showContentPanel && (
                    <ContentPanel section={activeSection} />
                )}

                {/* Main Content Area */}
                <main
                    className={`
                        flex-1 transition-all duration-300 
                        mt-12 mb-16 md:mb-0 md:mt-14
                        bg-card 
                        ${showContentPanel
                            ? "md:ml-[306px] lg:ml-[344px] md:border-l"
                            : "md:ml-14 lg:ml-14 md:rounded-tl-xl md:border-l"
                        }
                        border-border
                    `}
                >
                    <div className="mx-auto px-2 sm:px-4 py-4 sm:py-6">{children}</div>
                </main>

                {/* People Sidebar - Desktop Only */}
                <PeopleForm />

                {/* Bottom Navigation - Mobile Only */}
                <BottomNav activeSection={activeSection} />
            </div>
        </div>
    );
}
