import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Logger } from "@/utils/logger";

export async function middleware(request: NextRequest) {
    const startTime = Date.now();
    const pathname = request.nextUrl.pathname;
    const method = request.method;
    const url = request.url;

    Logger.middleware("Middleware", `Incoming request: ${method} ${pathname}`);
    Logger.debug("Middleware", "Request details", {
        pathname,
        method,
        url,
        headers: Object.fromEntries(request.headers.entries()),
    });

    // Route configuration
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const privateRoutes = ["/feed", "/messages", "/profile"];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isPrivateRoute = privateRoutes.some((r) => pathname.startsWith(r));

    Logger.debug("Middleware", "Route classification", {
        pathname,
        isPublicRoute,
        isPrivateRoute,
    });

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    Logger.debug("Middleware", "Creating Supabase client");
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => {
                    const value = request.cookies.get(name)?.value;
                    Logger.debug("Middleware", `Cookie GET: ${name}`, { hasValue: !!value });
                    return value;
                },
                set: (name: string, value: string, options: any) => {
                    Logger.debug("Middleware", `Cookie SET: ${name}`, { maxAge: options.maxAge });
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove: (name: string, options: any) => {
                    Logger.debug("Middleware", `Cookie REMOVE: ${name}`);
                    request.cookies.set({ name, value: "", ...options });
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    // refreshing the auth token
    Logger.debug("Middleware", "Fetching authenticated user");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        Logger.error("Middleware", "Failed to get user", { error: authError.message });
    }

    Logger.auth("Middleware", user ? `User authenticated: ${user.id}` : "No user authenticated", {
        userId: user?.id,
        email: user?.email,
    });

    // Guest trying to access private route → redirect to /login
    if (!user && isPrivateRoute) {
        Logger.warn("Middleware", `Unauthenticated access attempt to ${pathname}. Redirecting to /login`);
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        const redirectResponse = NextResponse.redirect(url);

        const duration = Date.now() - startTime;
        Logger.performance("Middleware", "Request processed (redirect)", duration);
        return redirectResponse;
    }

    // Logged-in user trying to access auth pages → redirect to /feed
    if (user && (pathname === "/login" || pathname === "/signup")) {
        Logger.info("Middleware", `Authenticated user accessing ${pathname}. Redirecting to /feed`);
        const url = request.nextUrl.clone();
        url.pathname = "/feed";
        const redirectResponse = NextResponse.redirect(url);

        const duration = Date.now() - startTime;
        Logger.performance("Middleware", "Request processed (redirect)", duration);
        return redirectResponse;
    }

    const duration = Date.now() - startTime;
    Logger.performance("Middleware", "Request processed", duration);
    Logger.success("Middleware", `Request completed: ${method} ${pathname}`);

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
