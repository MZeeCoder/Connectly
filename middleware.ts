import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Middleware for authentication and session management
 * Protects routes and refreshes auth tokens
 * Enforces email verification for protected routes
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: "",
                        ...options,
                    });
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - require authentication AND email verification
    const protectedRoutes = ["/feed", "/profile", "/messages"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Redirect to sign-in if accessing protected route without auth
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL("/sign-in", request.url);
        redirectUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If user is authenticated but email is not verified, redirect to verify-account
    if (isProtectedRoute && user && !user.email_confirmed_at) {
        return NextResponse.redirect(new URL("/verify-account", request.url));
    }

    // Auth routes - sign-in and sign-up pages
    const authRoutes = ["/sign-in", "/sign-up"];
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Redirect verified users away from auth pages to dashboard
    if (isAuthRoute && user && user.email_confirmed_at) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    // Allow access to verify-account page
    // - Users with no session can see "check your email" message
    // - Users with verified email will be auto-redirected to dashboard by the page
    const isVerifyRoute = pathname.startsWith("/verify-account");

    // Auth callback route should always be accessible
    const isCallbackRoute = pathname.startsWith("/api/auth/callback");
    if (isCallbackRoute) {
        return response;
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (they handle their own auth)
         */
        "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
