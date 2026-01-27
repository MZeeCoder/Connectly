"use client";

import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, useRef } from "react";
import "nprogress/nprogress.css"; // default nprogress styles

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export default function RouteProgress() {
    const pathname = usePathname();
    const previousPath = useRef<string | null>(null);

    useEffect(() => {
        if (previousPath.current !== null && previousPath.current !== pathname) {
            NProgress.start();
            setTimeout(() => {
                NProgress.done();
            }, 300);
            NProgress.configure({
                showSpinner: true,
                trickleSpeed: 100,
            });
        }
        previousPath.current = pathname;
    }, [pathname]);

    return null;
}
