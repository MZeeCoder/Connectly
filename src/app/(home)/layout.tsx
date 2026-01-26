"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentPanel } from "@/components/layout/ContentPanel";
import RouteProgress from "@/components/layout/RouteProgress";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Determine active section from pathname
    const getActiveSection = (): "feed" | "messages" | "profile" | null => {
        if (pathname.startsWith("/feed")) return "feed";
        if (pathname.startsWith("/messages")) return "messages";
        if (pathname.startsWith("/profile")) return "profile";
        return null;
    };

    const activeSection = getActiveSection();

    return (
        <div className="flex min-h-screen flex-col">
            {/* Top Header with Connectly Branding */}
            <header className="fixed top-0 left-0 right-0 h-12 bg-[#1E1F20] border-b border-[#3A3B3C] z-50 flex items-center px-4">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">Connectly</h1>
                </div>
            </header>

            <RouteProgress />

            <div className="flex flex-1 bg-[#1E1F20] ">
                {/* Primary Navigation Sidebar */}
                <Sidebar activeSection={activeSection} />

                {/* Secondary Content Panel */}
                <ContentPanel section={activeSection} />

                {/* Main Content Area */}
                <main
                    className={`flex-1 transition-all duration-300 mt-14 bg-[#131314] border-l border-[#3A3B3C] ${activeSection ? "lg:ml-[272px]" : "lg:ml-14 rounded-tl-xl"
                        }`}
                >
                    <div className="mx-auto px-4 py-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
