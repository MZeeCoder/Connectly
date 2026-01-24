"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ContentPanel } from "@/components/layout/ContentPanel";
import RouteProgress from "@/components/layout/RouteProgress";

export default function HomeLayout({ children }: { children: ReactNode }) {
    const [activeSection, setActiveSection] = useState<"feed" | "messages" | "profile" | null>(null);

    return (
        <div className="flex min-h-screen flex-col">
            <RouteProgress />

            <div className="flex flex-1 bg-[#1E1F20]">
                {/* Primary Navigation Sidebar */}
                <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

                {/* Secondary Content Panel */}
                <ContentPanel section={activeSection} />

                {/* Main Content Area */}
                <main
                    className={`flex-1 transition-all duration-300 mt-16 bg-[#131314] border-l border-[#2A2B2C] ${activeSection ? "lg:ml-[272px]" : "lg:ml-14 rounded-tl-xl"
                        }`}
                >
                    <div className="mx-auto px-4 py-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
