# Middleware Diagnostics Guide

## 🔍 How to Use Diagnostic Middleware

### Step 1: Enable Diagnostic Logging

1. **Temporarily rename your current middleware:**
   ```bash
   mv middleware.ts middleware.backup.ts
   ```

2. **Rename the diagnostic middleware:**
   ```bash
   mv middleware.debug.ts middleware.ts
   ```

3. **Restart your dev server:**
   ```bash
   pnpm dev
   ```

### Step 2: Test Each Scenario

Run these tests in your browser **with DevTools Console open (F12)**:

#### Test Case 1: Guest Accessing Private Route
- Navigate to: `http://localhost:3000/feed`
- **Expected**: Redirect to `/login`
- Check terminal for logs

#### Test Case 2: Guest Accessing Public Route
- Navigate to: `http://localhost:3000/login`
- **Expected**: Show login page
- Check terminal for logs

#### Test Case 3: Authenticated User Accessing Private Route
- Log in first
- Navigate to: `http://localhost:3000/feed`
- **Expected**: Show feed page
- Check terminal for logs

#### Test Case 4: Authenticated User Accessing Auth Page
- Stay logged in
- Navigate to: `http://localhost:3000/login`
- **Expected**: Redirect to `/feed`
- Check terminal for logs

#### Test Case 5: Root Path
- Navigate to: `http://localhost:3000/`
- Check what happens (currently not handled)

---

## 🐛 Common Issues & What to Look For in Logs

### Issue 1: Cookies Not Being Read

**Symptoms in logs:**
```
🍪 COOKIES RECEIVED:
Total cookies: 0
```

**Causes:**
- Supabase hasn't set cookies yet
- Cookies are HTTP-only and domain-restricted
- Browser is blocking cookies (SameSite issues)

**Fix:**
1. Check Supabase Auth settings for cookie configuration
2. Verify your domain is correct in `.env`
3. Check browser cookie settings

---

### Issue 2: User Object is NULL Despite Valid Cookies

**Symptoms in logs:**
```
🔐 SUPABASE AUTH COOKIES:
  - sb-access-token: ✅ EXISTS
  - sb-refresh-token: ✅ EXISTS
👤 FETCHING USER FROM SUPABASE...
  - User object: ❌ NO USER
  ⚠️  AUTH ERROR: Invalid JWT token
```

**Causes:**
- Token expired and refresh failed
- Token is malformed
- Supabase project keys mismatch
- Wrong Supabase URL

**Fix:**
1. Verify your `.env` variables match your Supabase project
2. Check if tokens are expired (look at "Expires At" in session check)
3. Try logging out and logging in again
4. Clear cookies and retry

---

### Issue 3: Middleware Executes Multiple Times

**Symptoms in logs:**
```
🔍 MIDDLEWARE EXECUTION START (appears 3+ times for one page load)
```

**Causes:**
- Matcher is too broad and catching static assets
- Next.js is prefetching routes
- Browser is making multiple requests

**Fix:**
- Update matcher config to exclude more patterns
- Add early return for specific paths

---

### Issue 4: Session Exists But User is NULL

**Symptoms in logs:**
```
🔍 CHECKING SESSION...
  - Session exists: ✅ YES
  - Access Token: EXISTS
👤 FETCHING USER FROM SUPABASE...
  - User object: ❌ NO USER
```

**Causes:**
- `getUser()` validates token on server but it's invalid
- Token signature mismatch
- Supabase service is having issues

**Fix:**
1. Use `getSession()` instead of `getUser()` if you don't need validation
2. Check Supabase service status
3. Regenerate your Supabase API keys

---

### Issue 5: Infinite Redirect Loop

**Symptoms:**
- Browser shows "too many redirects" error
- Logs show rapid redirects between `/login` and `/feed`

**Causes:**
- User state is inconsistent
- Middleware redirect logic has a bug
- Cookies are being cleared on redirect

**Fix:**
1. Check if `/` (root) is causing issues
2. Ensure you're not redirecting to a route that triggers another redirect
3. Add explicit handling for root path

---

## 🔧 Specific Fixes Based on Log Analysis

### Fix 1: If Cookies Are Missing

The issue is likely in your Supabase client configuration. Update your auth flow:

**In `src/lib/supabase/client.ts`:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**In `src/lib/supabase/server.ts`:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error - might be in middleware context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  )
}
```

---

### Fix 2: If User is NULL But Session Exists

Your tokens might be invalid. Clear auth state:

```typescript
// Add this to your logout or as a standalone utility
const supabase = createClient()
await supabase.auth.signOut({ scope: 'local' })
```

Then log in again.

---

### Fix 3: Improved Middleware (After Diagnosis)

Based on common issues, here's a more robust middleware:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Early return for static assets and internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
    ) {
        return NextResponse.next();
    }

    // Route configuration
    const publicRoutes = ["/", "/login", "/signup"];
    const privateRoutes = ["/feed", "/messages", "/profile"];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isPrivateRoute = privateRoutes.some((r) => pathname.startsWith(r));

    // Create response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => request.cookies.get(name)?.value,
                set: (name, value, options) => {
                    request.cookies.set({ name, value, ...options });
                    response.cookies.set({ name, value, ...options });
                },
                remove: (name, options) => {
                    request.cookies.set({ name, value: "", ...options });
                    response.cookies.set({ name, value: "", ...options });
                },
            },
        }
    );

    // Get user - this validates the token
    const { data: { user }, error } = await supabase.auth.getUser();

    // If there's an auth error, clear the session
    if (error) {
        await supabase.auth.signOut({ scope: 'local' });
    }

    // Redirect logic
    if (!user && isPrivateRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
        return NextResponse.redirect(new URL("/feed", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};
```

---

## 📊 What to Share for Further Help

If you still have issues after running diagnostics, copy the **entire terminal output** from one middleware execution and share:

1. The full log output
2. Which test case was failing
3. Your browser cookies (from DevTools → Application → Cookies)
4. Your `.env` configuration (redact actual keys)

---

## ⚡ Next.js 15+ Specific Issues

If you're using Next.js 15+:

1. **Cookie handling changed** - use `await cookies()` in server components
2. **Turbopack** might cache aggressively - try `pnpm dev --turbo-clear`
3. **Async request APIs** - middleware gets async request objects in some cases

---

## 🎯 Quick Checklist

- [ ] Supabase URL and keys are correct in `.env`
- [ ] Auth cookies are being set (check browser DevTools)
- [ ] No CORS or SameSite cookie issues
- [ ] Middleware matcher isn't too broad
- [ ] Using `@supabase/ssr` package (not `@supabase/auth-helpers`)
- [ ] Response object is properly returned with cookie modifications
- [ ] No token expiration issues

---

## 🔄 Reverting to Original Middleware

When done with diagnostics:

```bash
mv middleware.ts middleware.debug.ts
mv middleware.backup.ts middleware.ts
```
