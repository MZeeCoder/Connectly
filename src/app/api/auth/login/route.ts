import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Login API Route
 * 
 * This is a SERVER-SIDE API route that handles authentication.
 * It runs on the server, never on the client, which provides security benefits.
 * 
 * Why use an API route instead of client-side authentication?
 * 
 * Security Benefits:
 * 1. Credentials never exposed to client-side JavaScript
 * 2. Can set HttpOnly cookies (unreachable by client JS)
 * 3. Server-side validation and rate limiting
 * 4. Secure connection to database/auth service
 * 5. No sensitive auth logic in client bundle
 * 6. Protection against XSS attacks (HttpOnly cookies)
 * 
 * This is a POST endpoint: /api/auth/login
 */
export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        /**
         * Authenticate the user
         * 
         * In a PRODUCTION application, you would:
         * 1. Hash the password (bcrypt, argon2, etc.)
         * 2. Query your database for the user
         * 3. Compare the hashed passwords
         * 4. Check if account is verified/active
         * 5. Implement rate limiting to prevent brute force
         * 6. Log the login attempt
         * 7. Generate a secure JWT or session token
         * 
         * Example with a real database:
         * ```typescript
         * const user = await db.user.findUnique({ where: { email } });
         * if (!user) return error("Invalid credentials");
         * 
         * const isValid = await bcrypt.compare(password, user.passwordHash);
         * if (!isValid) return error("Invalid credentials");
         * 
         * const token = jwt.sign(
         *   { userId: user.id, email: user.email },
         *   process.env.JWT_SECRET!,
         *   { expiresIn: "7d" }
         * );
         * ```
         */

        // For this demo, accept any credentials
        // In production: NEVER do this!
        const isValidCredentials = email && password;

        if (!isValidCredentials) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        /**
         * Generate authentication token
         * 
         * For this demo, we're using a simple string.
         * In production, use a proper JWT token:
         * 
         * ```typescript
         * import jwt from 'jsonwebtoken';
         * 
         * const token = jwt.sign(
         *   { 
         *     userId: user.id,
         *     email: user.email,
         *     role: user.role 
         *   },
         *   process.env.JWT_SECRET!,
         *   { 
         *     expiresIn: '7d',
         *     issuer: 'your-app-name',
         *     audience: 'your-app-users'
         *   }
         * );
         * ```
         */
        const token = `demo_token_${email}_${Date.now()}`;

        /**
         * Set the authentication cookie
         * 
         * Cookie Security Best Practices:
         * 
         * 1. httpOnly: true
         *    - Cookie cannot be accessed by client-side JavaScript
         *    - Protects against XSS attacks
         *    - Even if attacker injects malicious script, they can't steal the token
         * 
         * 2. secure: true (in production)
         *    - Cookie only sent over HTTPS
         *    - Prevents man-in-the-middle attacks
         *    - Use process.env.NODE_ENV === 'production' to enable in prod only
         * 
         * 3. sameSite: 'lax' or 'strict'
         *    - Protects against CSRF attacks
         *    - 'strict': Cookie not sent on any cross-site request
         *    - 'lax': Cookie sent on top-level navigation (good for UX)
         * 
         * 4. path: '/'
         *    - Cookie available on all routes
         * 
         * 5. maxAge: 7 days (in seconds)
         *    - Cookie expires after 7 days
         *    - Forces re-authentication periodically
         *    - Use shorter duration for sensitive apps
         */
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true, // CRITICAL: Protects against XSS
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "lax", // CSRF protection
            path: "/", // Available on all routes
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        });

        /**
         * Return success response
         * 
         * The cookie is now set, and middleware will allow access to protected routes.
         * Client will automatically include this cookie in subsequent requests.
         */
        return NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    email,
                    // In production, return safe user data (no sensitive info)
                },
            },
            { status: 200 }
        );
    } catch (error) {
        /**
         * Error handling
         * 
         * In production:
         * - Log the error to monitoring service (Sentry, Datadog, etc.)
         * - Don't expose internal error details to client
         * - Return generic error message
         */
        console.error("Login error:", error);

        return NextResponse.json(
            { error: "An error occurred during login" },
            { status: 500 }
        );
    }
}

/**
 * Optional: Logout endpoint
 * 
 * Usage: POST /api/auth/logout
 */
export async function DELETE() {
    try {
        // Clear the authentication cookie
        const cookieStore = await cookies();
        cookieStore.delete("token");

        return NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "An error occurred during logout" },
            { status: 500 }
        );
    }
}
