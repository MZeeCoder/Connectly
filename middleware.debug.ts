import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    console.log("\n========================================");
    console.log("🔍 MIDDLEWARE EXECUTION START");
    console.log("========================================");
    console.log("📍 PATH:", pathname);
    console.log("🕐 TIMESTAMP:", new Date().toISOString());
    console.log("🌐 METHOD:", request.method);
    console.log("🔗 FULL URL:", request.url);

    // Log all cookies
    console.log("\n🍪 COOKIES RECEIVED:");
    const allCookies = request.cookies.getAll();
    console.log("Total cookies:", allCookies.length);
    allCookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
    });

    // Check for specific Supabase cookies
    const authToken = request.cookies.get('sb-access-token');
    const refreshToken = request.cookies.get('sb-refresh-token');
    console.log("\n🔐 SUPABASE AUTH COOKIES:");
    console.log("  - sb-access-token:", authToken ? "✅ EXISTS" : "❌ MISSING");
    console.log("  - sb-refresh-token:", refreshToken ? "✅ EXISTS" : "❌ MISSING");

    // Public routes (no auth required)
    const publicRoutes = ["/", "/login", "/signup"];

    // Private routes (auth required)
    const privateRoutes = ["/feed", "/messages", "/profile"];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isPrivateRoute = privateRoutes.some((r) => pathname.startsWith(r));

    console.log("\n🚦 ROUTE CLASSIFICATION:");
    console.log("  - isPublicRoute:", isPublicRoute);
    console.log("  - isPrivateRoute:", isPrivateRoute);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    console.log("\n📦 CREATING SUPABASE CLIENT...");
    console.log("  - SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ SET" : "❌ MISSING");
    console.log("  - SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ SET" : "❌ MISSING");

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => {
                    const value = request.cookies.get(name)?.value;
                    console.log(`  📖 GET COOKIE: ${name} = ${value ? 'EXISTS' : 'NULL'}`);
                    return value;
                },
                set: (name, value, options) => {
                    console.log(`  📝 SET COOKIE: ${name} (expires: ${options.maxAge}s)`);
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove: (name, options) => {
                    console.log(`  🗑️  REMOVE COOKIE: ${name}`);
                    request.cookies.set({ name, value: "", ...options });
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    console.log("\n👤 FETCHING USER FROM SUPABASE...");

    let user = null;
    let authError = null;

    try {
        const { data, error } = await supabase.auth.getUser();
        user = data?.user || null;
        authError = error;

        console.log("  - User object:", user ? "✅ USER FOUND" : "❌ NO USER");
        if (user) {
            console.log("  - User ID:", user.id);
            console.log("  - User Email:", user.email);
            console.log("  - User Role:", user.role);
            console.log("  - Created At:", user.created_at);
        }

        if (authError) {
            console.log("  ⚠️  AUTH ERROR:", authError.message);
            console.log("  - Error Code:", authError.status);
            console.log("  - Error Name:", authError.name);
        }
    } catch (err) {
        console.log("  ❌ EXCEPTION:", err);
        authError = err;
    }

    // Check session explicitly
    console.log("\n🔍 CHECKING SESSION...");
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("  - Session exists:", sessionData.session ? "✅ YES" : "❌ NO");
        if (sessionData.session) {
            console.log("  - Access Token:", sessionData.session.access_token ? "EXISTS" : "MISSING");
            console.log("  - Refresh Token:", sessionData.session.refresh_token ? "EXISTS" : "MISSING");
            console.log("  - Expires At:", sessionData.session.expires_at);
            console.log("  - Expires In:", sessionData.session.expires_in, "seconds");
        }
    } catch (err) {
        console.log("  ❌ SESSION CHECK ERROR:", err);
    }

    console.log("\n🎯 REDIRECT LOGIC:");

    // Guest → private page ❌
    if (!user && isPrivateRoute) {
        console.log("  ⛔ CONDITION: Guest trying to access private route");
        console.log("  ↪️  ACTION: Redirecting to /login");
        const redirectUrl = new URL("/login", request.url);
        console.log("  🔗 Redirect URL:", redirectUrl.toString());
        console.log("========================================\n");
        return NextResponse.redirect(redirectUrl);
    }

    // Logged-in → auth page ❌
    if (user && isPublicRoute && pathname !== "/") {
        console.log("  ⛔ CONDITION: Authenticated user trying to access auth page");
        console.log("  ↪️  ACTION: Redirecting to /feed");
        const redirectUrl = new URL("/feed", request.url);
        console.log("  🔗 Redirect URL:", redirectUrl.toString());
        console.log("========================================\n");
        return NextResponse.redirect(redirectUrl);
    }

    console.log("  ✅ CONDITION: Access allowed");
    console.log("  ↪️  ACTION: Proceeding to requested page");
    console.log("========================================\n");

    return response;
}

export const config = {
    matcher: [
        // Match all paths except:
        // - _next (Next.js internals)
        // - API routes (optional - remove if you want to protect API routes)
        // - static files
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
