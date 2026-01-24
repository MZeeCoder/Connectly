# 🚀 Connectly Authentication Setup Guide

## Overview
This guide will help you set up complete authentication for Connectly with:
- ✅ Email/Password signup with email verification
- ✅ Email/Password login
- ✅ Session management with tokens
- ✅ Middleware protection
- ✅ Logout functionality

---

## 📋 Prerequisites
- Supabase account and project
- Node.js installed
- pnpm package manager

---

## 🔧 Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**How to get these values:**
- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🗄️ Step 2: Set Up Database

Run the SQL migration file in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire content of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click "Run"

This will create:
- ✅ All necessary tables (users, posts, comments, likes, follows, messages)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic updates

---

## 📧 Step 3: Configure Email Templates in Supabase

1. Go to your Supabase dashboard
2. Navigate to Authentication > Email Templates
3. Find "Confirm signup" template
4. Replace the HTML content with the template from:
   `supabase/email_templates/confirm_signup.html`

**Important:** The email confirmation link should be:
```html
{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=email
```

---

## 🔐 Step 4: Configure Supabase Auth Settings

1. Go to Authentication > Settings in Supabase dashboard
2. Configure the following:

### Site URL
- Set to `http://localhost:3000` for development
- Set to your production URL (e.g., `https://yourdomain.com`) for production

### Redirect URLs
Add the following URLs:
- `http://localhost:3000/api/auth/callback`
- `http://localhost:3000/feed`
- Your production URLs (if applicable)

### Email Auth
- ✅ Enable Email provider
- ✅ Enable "Confirm email" (this requires users to verify their email)
- ✅ Disable "Secure email change" if you want simpler flow

### Email Settings
- Configure SMTP settings or use Supabase's built-in email service
- For production, it's recommended to use your own SMTP service (SendGrid, AWS SES, etc.)

---

## 📦 Step 5: Install Dependencies

```bash
pnpm install
```

Make sure you have these packages:
- `@supabase/supabase-js`
- `@supabase/ssr`
- `next`
- `react`
- `react-dom`

---

## 🎯 Step 6: Test the Authentication Flow

### Testing Signup:
1. Start your development server:
```bash
pnpm dev
```

2. Navigate to `http://localhost:3000/signup`
3. Fill in the form with:
   - Username
   - Full Name
   - Email
   - Password
4. Click "Create account"
5. You should see: "Account created! Please check your email to verify your account."
6. Check your email inbox
7. Click the "Confirm Account" button
8. You should be redirected to `/feed` with a verified session

### Testing Login:
1. Navigate to `http://localhost:3000/login`
2. Enter your verified email and password
3. Click "Sign in"
4. You should be redirected to `/feed`

### Testing Protected Routes:
1. Try accessing `/feed`, `/messages`, or `/profile` without logging in
2. You should be redirected to `/login`
3. After logging in, you can access these routes

### Testing Logout:
1. While logged in, click the logout button
2. You should be logged out and redirected to `/login`
3. Session tokens should be cleared

---

## 🔒 How It Works

### Signup Flow:
```
1. User fills signup form
   ↓
2. SignupAction calls Supabase signUp()
   ↓
3. Supabase creates auth user and sends verification email
   ↓
4. User receives email with confirmation link
   ↓
5. User clicks link → /api/auth/callback
   ↓
6. Callback verifies token_hash with Supabase
   ↓
7. Session created and stored in cookies
   ↓
8. User redirected to /feed (dashboard)
```

### Login Flow:
```
1. User enters email and password
   ↓
2. SigninAction calls Supabase signInWithPassword()
   ↓
3. Supabase validates credentials
   ↓
4. Session tokens stored in cookies
   ↓
5. User redirected to /feed
```

### Middleware Protection:
```
Every request
   ↓
Middleware checks Supabase session
   ↓
If accessing protected route without session → redirect to /login
If accessing auth routes with session → redirect to /feed
Otherwise → allow access
```

---

## 🎨 Files Changed/Created

### Authentication Logic:
- ✅ `/src/server/actions/auth.actions.ts` - Server actions for auth
- ✅ `/src/app/api/auth/callback/route.ts` - Email confirmation handler
- ✅ `/middleware.ts` - Route protection

### Forms:
- ✅ `/src/components/layout/signup/_lib/signup-form.tsx` - Signup form
- ✅ `/src/components/layout/login/_lib/signin-form.tsx` - Login form

### Database:
- ✅ `/supabase/migrations/001_initial_schema.sql` - Complete database schema

### Email:
- ✅ `/supabase/email_templates/confirm_signup.html` - Email template

---

## 🐛 Troubleshooting

### Email not received:
- Check Supabase Authentication > Logs for any errors
- Check spam folder
- Verify SMTP settings in Supabase
- For development, you can view emails in Supabase Authentication > Email templates > Preview

### "Invalid credentials" error:
- Make sure the email is verified
- Check that the password meets requirements (min 6 characters)
- Verify the email exists in Supabase Authentication > Users

### Middleware redirect loop:
- Clear browser cookies
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- Restart the development server

### Session not persisting:
- Check browser console for errors
- Verify cookies are being set (DevTools > Application > Cookies)
- Make sure middleware is running (check middleware.ts config.matcher)

---

## 🔑 Security Best Practices

✅ **What we're doing right:**
- Using HttpOnly cookies for tokens (prevents XSS attacks)
- Row Level Security (RLS) enabled on all tables
- Middleware protection for routes
- Secure password hashing by Supabase
- Email verification required

⚠️ **For Production:**
- Change `NEXT_PUBLIC_SITE_URL` to your production domain
- Use custom SMTP service (not Supabase default)
- Enable rate limiting in Supabase
- Set secure: true for cookies in production
- Add CORS configuration
- Enable 2FA (optional)

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

## ✅ Checklist

Before going to production:
- [ ] All environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Email templates configured in Supabase
- [ ] Site URL and Redirect URLs configured
- [ ] SMTP service configured (production)
- [ ] Tested signup, login, and logout flows
- [ ] Tested email verification
- [ ] Tested middleware protection
- [ ] RLS policies verified
- [ ] Rate limiting configured

---

## 🎉 You're Done!

Your authentication system is now fully set up and working!

Users can:
- ✅ Sign up with email verification
- ✅ Log in with email and password
- ✅ Access protected dashboard routes
- ✅ Log out securely

The system automatically:
- ✅ Sends verification emails
- ✅ Manages session tokens
- ✅ Protects routes with middleware
- ✅ Refreshes expired tokens
- ✅ Enforces Row Level Security

Happy coding! 🚀
