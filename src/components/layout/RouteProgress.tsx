"use client";

import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, useRef } from "react";
import "nprogress/nprogress.css"; // default nprogress styles

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export default function RouteProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const previousPath = useRef<string | null>(null);

    useEffect(() => {
        if (previousPath.current !== null && previousPath.current !== pathname + "?" + searchParams.toString()) {
            NProgress.start();
            setTimeout(() => {
                NProgress.done();
            }, 300); // you can adjust delay if needed
            NProgress.configure({
                showSpinner: true,   // ✅ enable spinner
                trickleSpeed: 100,
            });
        }
        previousPath.current = pathname + "?" + searchParams.toString();
    }, [pathname, searchParams]);

    return null;
}
