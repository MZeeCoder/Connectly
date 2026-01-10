"use client";

import { useEffect, useState } from "react";

/**
 * ClientOnly component ensures children are only rendered on the client side
 * Useful for preventing hydration mismatches
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}
