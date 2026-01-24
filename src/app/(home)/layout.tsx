import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import RouteProgress from '@/components/layout/RouteProgress';

export default function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <RouteProgress />
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                    <div className="container mx-auto px-4 py-8">{children}</div>
                </main>
            </div>
            
        </div>
    );
}
