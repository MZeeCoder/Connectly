import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-4 py-12">
            <div className="w-full max-w-1/3">{children}</div>
        </div>
    );
}