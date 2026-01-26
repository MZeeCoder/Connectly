import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Logger } from "@/utils/logger";

export async function middleware(request: NextRequest) {
    const startTime = Date.now();
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    Logger.middleware("Middleware", `Incoming request: ${method} ${pathname}`);

    // Route configuration
    const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
    const privateRoutes = ["/feed", "/messages", "/profile"];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isPrivateRoute = privateRoutes.some((r) => pathname.startsWith(r));

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
        Logger.error("Middleware", "Failed to get user", { error: authError.message });
    }

    if (user) {
        Logger.auth("Middleware", `User authenticated: ${user.id}`, {
            userId: user?.id,
            email: user?.email,
        });
    }

    // Guest trying to access private route → redirect to /login
    if (!user && isPrivateRoute) {
        Logger.warn("Middleware", `Unauthenticated access attempt to ${pathname}. Redirecting to /login`);
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        const duration = Date.now() - startTime;
        Logger.performance("Middleware", "Request processed (redirect)", duration);
        return NextResponse.redirect(url);
    }

    // Logged-in user trying to access auth pages → redirect to /feed
    if (user && (pathname === "/login" || pathname === "/signup")) {
        Logger.info("Middleware", `Authenticated user accessing ${pathname}. Redirecting to /feed`);
        const url = request.nextUrl.clone();
        url.pathname = "/feed";
        const duration = Date.now() - startTime;
        Logger.performance("Middleware", "Request processed (redirect)", duration);
        return NextResponse.redirect(url);
    }

    const duration = Date.now() - startTime;
    Logger.performance("Middleware", "Request processed", duration);
    Logger.success("Middleware", `Request completed: ${method} ${pathname}`);

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - Images and assets
         * - API routes that don't need auth
         * - well-known routes (for auth providers, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$|\\.well-known).*)",
    ],
};
