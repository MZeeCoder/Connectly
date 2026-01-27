"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentPanel } from "@/components/layout/ContentPanel";
import RouteProgress from "@/components/layout/RouteProgress";
import PeopleForm from "@/components/people/people-form";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Determine active section from pathname
    const getActiveSection = (): "feed" | "messages" | "profile" | "explore" | "notifications" | "settings" | null => {
        if (pathname.startsWith("/feed")) return "feed";
        if (pathname.startsWith("/messages")) return "messages";
        if (pathname.startsWith("/profile")) return "profile";
        if (pathname.startsWith("/explore")) return "explore";
        if (pathname.startsWith("/notifications")) return "notifications";
        if (pathname.startsWith("/settings")) return "settings";
        return null;
    };

    const activeSection = getActiveSection();

    return (
        <div className="flex min-h-screen flex-col">
            {/* Top Header with Connectly Branding */}
            <header className="fixed top-0 left-0 right-0 h-12 bg-sidebar border-b border-border z-50 flex items-center px-4">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Connectly</h1>
                </div>
            </header>

            <RouteProgress />

            <div className="flex flex-1 bg-sidebar ">
                {/* Primary Navigation Sidebar */}
                <Sidebar activeSection={activeSection} />

                {/* Secondary Content Panel */}
                {activeSection !== "notifications" && activeSection !== "explore" && activeSection !== "settings" && <ContentPanel section={activeSection} />}

                {/* Main Content Area */}
                <main
                    className={`flex-1 transition-all duration-300 mt-14 bg-card border-l border-border ${activeSection && activeSection !== "notifications" && activeSection !== "explore" && activeSection !== "settings" ? "lg:ml-[344px]" : "lg:ml-14 rounded-tl-xl"
                        }`}
                >
                    <div className="mx-auto px-4 py-6">{children}</div>
                </main>
                <PeopleForm />
            </div>
        </div>
    );
}
