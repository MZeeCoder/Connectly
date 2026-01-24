# Next.js 13+ Protected Routes with Built-in Features

This is a complete implementation of protected routes in Next.js 13+ using **only built-in features** - no external authentication libraries required.

## 🔐 Security Architecture

This implementation uses a **defense-in-depth** approach with multiple layers of protection:

### Layer 1: Edge Middleware (First Defense)
- **File**: [`middleware.ts`](middleware.ts)
- **When**: Runs before EVERY request at the edge
- **What**: Checks for authentication token cookie
- **Action**: Redirects unauthenticated users to `/login`
- **Benefit**: Blocks unauthorized access before any code runs

### Layer 2: Server Components (Second Defense)
- **Files**: [`/app/dashboard/page.tsx`](src/app/dashboard/page.tsx), [`/app/profile/page.tsx`](src/app/profile/page.tsx)
- **When**: During server-side rendering
- **What**: Re-validates authentication token
- **Action**: Uses `redirect()` to send unauthorized users to login
- **Benefit**: Protects data fetching and sensitive operations

### Layer 3: Client Components (Third Defense - Optional)
- **File**: [`/components/auth/ClientAuthCheck.tsx`](src/components/auth/ClientAuthCheck.tsx)
- **When**: After page loads on client
- **What**: Checks authentication state for UI features
- **Action**: Client-side redirect using `useRouter()`
- **Benefit**: Better UX, handles client-side edge cases

## 📁 Project Structure

```
├── middleware.ts                           # Edge authentication check
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx                    # Login form (client component)
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Protected page (server component)
│   │   ├── profile/
│   │   │   └── page.tsx                    # Protected page (server component)
│   │   └── api/
│   │       └── auth/
│   │           └── login/
│   │               └── route.ts            # Login API endpoint
│   └── components/
│       └── auth/
│           ├── ClientAuthCheck.tsx         # Client-side auth check
│           └── LogoutButton.tsx            # Logout functionality
```

## 🚀 How It Works

### 1. **User Visits Protected Page** (`/dashboard` or `/profile`)

```
Request → Middleware → Check Cookie → Has Token?
                                      ├─ Yes → Allow Request → Server Component
                                      └─ No  → Redirect to /login
```

### 2. **Middleware Check** ([`middleware.ts`](middleware.ts))

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const isProtectedRoute = ['/dashboard', '/profile'].some(
        route => pathname.startsWith(route)
    );

    if (isProtectedRoute && !token) {
        // REDIRECT: No access without token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}
```

**Why this is secure:**
- ✅ Runs at the Edge (fast, before any server code)
- ✅ Blocks request completely if unauthorized
- ✅ Single source of truth for route protection
- ✅ Can't be bypassed by client-side code

### 3. **Server Component Check** ([`/app/dashboard/page.tsx`](src/app/dashboard/page.tsx))

```typescript
// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    // Server-side validation (backup check)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login"); // Built-in Next.js redirect
    }

    // Fetch protected data securely on the server
    const user = await getUserData(token);

    return <div>{/* Protected content */}</div>;
}
```

**Why this is secure:**
- ✅ Validates auth before rendering
- ✅ Fetches data on server (database credentials safe)
- ✅ No sensitive data exposed to client
- ✅ Defense in depth (second layer)

### 4. **Login Flow** ([`/app/login/page.tsx`](src/app/login/page.tsx) + [`/app/api/auth/login/route.ts`](src/app/api/auth/login/route.ts))

```typescript
// Client Component (login/page.tsx)
async function handleSubmit(event: FormEvent) {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
        router.push("/dashboard"); // Cookie is now set
    }
}

// API Route (api/auth/login/route.ts)
export async function POST(request: NextRequest) {
    // Validate credentials (would check database in production)
    const { email, password } = await request.json();
    
    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("token", generatedToken, {
        httpOnly: true,    // ✅ Can't be accessed by JavaScript
        secure: true,      // ✅ HTTPS only in production
        sameSite: "lax",   // ✅ CSRF protection
        maxAge: 604800,    // ✅ 7 days expiration
    });

    return NextResponse.json({ success: true });
}
```

**Why this is secure:**
- ✅ Credentials validated server-side only
- ✅ HttpOnly cookies (protected from XSS)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite protection (CSRF prevention)

### 5. **Logout Flow** ([`/components/auth/LogoutButton.tsx`](src/components/auth/LogoutButton.tsx))

```typescript
async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
}

// API Route DELETE handler
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return NextResponse.json({ success: true });
}
```

## 🔒 Cookie Security Explained

The authentication uses cookies with these security flags:

| Flag | Purpose | Why It's Secure |
|------|---------|-----------------|
| `httpOnly: true` | Cookie not accessible via JavaScript | Prevents XSS attacks - even if attacker injects malicious script, they can't steal the token |
| `secure: true` | Cookie only sent over HTTPS | Prevents man-in-the-middle attacks - token can't be intercepted over unsecure connections |
| `sameSite: "lax"` | Cookie not sent on cross-site requests | Prevents CSRF attacks - malicious sites can't make authenticated requests |
| `path: "/"` | Cookie available on all routes | Simplifies cookie management |
| `maxAge: 604800` | Cookie expires after 7 days | Forces periodic re-authentication |

## 🎯 Usage Examples

### Protect a New Route

1. **Add route to middleware**:
```typescript
// middleware.ts
const protectedRoutes = ['/dashboard', '/profile', '/settings']; // Add here
```

2. **Create server component with auth check**:
```typescript
// app/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) redirect("/login");
    
    return <div>Settings Page</div>;
}
```

### Add Logout Button

```typescript
// In any page or component
import LogoutButton from "@/components/auth/LogoutButton";

export function Header() {
    return (
        <header>
            <LogoutButton />
        </header>
    );
}
```

### Use Client-Side Auth Check

```typescript
// In a client component
"use client";
import { useClientAuth } from "@/components/auth/ClientAuthCheck";

export function MyComponent() {
    const { isAuthenticated } = useClientAuth();
    
    if (!isAuthenticated) {
        return <div>Loading...</div>;
    }
    
    return <div>Protected Content</div>;
}
```

## ⚙️ Production Considerations

### 1. **Use Real JWT Tokens**

Replace the demo token with proper JWT:

```typescript
import jwt from 'jsonwebtoken';

// Signing
const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
);

// Verifying
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

### 2. **Hash Passwords**

Never store plain passwords:

```typescript
import bcrypt from 'bcrypt';

// When user signs up
const hashedPassword = await bcrypt.hash(password, 10);

// When user logs in
const isValid = await bcrypt.compare(password, user.passwordHash);
```

### 3. **Add Rate Limiting**

Prevent brute force attacks:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
    redis: /* your redis instance */,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

// In API route
const { success } = await ratelimit.limit(email);
if (!success) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
}
```

### 4. **Connect to Real Database**

Replace mock data with actual database queries:

```typescript
import { db } from "@/lib/database";

const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true }
});
```

### 5. **Add Environment Variables**

```env
# .env.local
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=production
```

## 🧪 Testing

### Test Protected Routes

1. Visit `/dashboard` without logging in → Should redirect to `/login`
2. Visit `/profile` without logging in → Should redirect to `/login`
3. Visit `/login` → Should show login form

### Test Login

1. Enter any email/password (demo accepts all)
2. Click "Sign in"
3. Should redirect to `/dashboard`
4. Cookie `token` should be set (check DevTools → Application → Cookies)

### Test Middleware

1. Log in and visit `/dashboard`
2. Open DevTools → Application → Cookies
3. Delete the `token` cookie
4. Refresh the page → Should redirect to `/login`

### Test Server Component Auth

1. Log in
2. Disable JavaScript in DevTools
3. Visit `/dashboard` → Still should work (server-rendered)
4. Delete cookie and refresh → Should redirect (server-side check)

## 🎨 UI Customization

All pages include minimal Tailwind CSS styling. Customize as needed:

- **Login Page**: [`src/app/login/page.tsx`](src/app/login/page.tsx)
- **Dashboard**: [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)
- **Profile**: [`src/app/profile/page.tsx`](src/app/profile/page.tsx)

## 📚 Key Built-in Features Used

| Feature | Purpose | Import From |
|---------|---------|-------------|
| `middleware` | Edge authentication check | `next/server` |
| `NextResponse.redirect()` | Redirect in middleware | `next/server` |
| `cookies()` | Read/write cookies | `next/headers` |
| `redirect()` | Redirect in server components | `next/navigation` |
| `useRouter()` | Client-side navigation | `next/navigation` |
| Server Components | Server-side rendering + auth | Default in app/ |
| Client Components | Interactive UI | `"use client"` |
| API Routes | Backend endpoints | `app/api/*/route.ts` |

## 🚨 Common Pitfalls to Avoid

1. ❌ **Don't set cookies client-side**
   - ✅ Use API routes to set HttpOnly cookies

2. ❌ **Don't skip middleware checks**
   - ✅ Always validate in middleware + server components

3. ❌ **Don't expose sensitive data to client**
   - ✅ Fetch data in server components

4. ❌ **Don't use localStorage for tokens**
   - ✅ Use HttpOnly cookies (protected from XSS)

5. ❌ **Don't trust client-side auth checks**
   - ✅ Always validate on server

## 🔗 Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- [OWASP Cookie Security](https://owasp.org/www-community/controls/SecureCookieAttribute)

## 📄 License

This is a demonstration project for educational purposes.

---

**Built with ❤️ using Next.js 13+ built-in features only**
