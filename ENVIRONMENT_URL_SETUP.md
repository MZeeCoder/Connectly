# Environment URL Configuration Guide

This guide explains how your project automatically handles different URLs for development and production environments.

## 🎯 How It Works

Your project now automatically uses the correct URL based on the environment:

- **Development** (`NODE_ENV=development`): Uses `http://localhost:3000`
- **Production** (`NODE_ENV=production`): Uses `NEXT_PUBLIC_SITE_URL` from environment variables

## 📁 Configuration Files

### 1. Local Development (.env)

```env
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=https://connectly-fbrc8j1mx-zeeshans-projects-136cd6a5.vercel.app
```

**Note**: In development, `NEXT_PUBLIC_SITE_URL` is set but the app will use `http://localhost:3000` automatically.

### 2. Vercel Production Environment

Set these environment variables in your Vercel dashboard:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://connectly-fbrc8j1mx-zeeshans-projects-136cd6a5.vercel.app
```

Or your custom domain:

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🔧 Code Implementation

The logic is centralized in `src/lib/constants.ts`:

```typescript
export const SITE_URL =
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : "http://localhost:3000";
```

This constant is used throughout your app for:
- Email confirmation redirects
- Password reset links
- Authentication callbacks
- Magic link redirects

## 🔗 Supabase Configuration

### Development Setup

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL**:
```
http://localhost:3000
```

**Redirect URLs** (Add all of these):
```
http://localhost:3000/*
http://localhost:3000/api/auth/callback
https://connectly-fbrc8j1mx-zeeshans-projects-136cd6a5.vercel.app/*
https://connectly-fbrc8j1mx-zeeshans-projects-136cd6a5.vercel.app/api/auth/callback
```

### Production Setup

When you're ready for production:

1. **Update Site URL in Supabase** to your production URL:
   ```
   https://connectly-fbrc8j1mx-zeeshans-projects-136cd6a5.vercel.app
   ```
   
2. **Keep both localhost and production URLs** in Redirect URLs for flexibility.

## ✅ Testing

### Test in Development

1. Run your app locally:
   ```bash
   pnpm dev
   ```

2. Test signup/login - you should receive emails with links to `http://localhost:3000`

### Test in Production

1. Deploy to Vercel:
   ```bash
   git push
   ```

2. Verify Vercel environment variables are set correctly

3. Test signup/login - you should receive emails with your production URL

## 🚀 Where URLs Are Used

Your app uses `SITE_URL` in these locations:

1. **Sign Up** ([src/server/actions/auth.actions.ts](src/server/actions/auth.actions.ts))
   ```typescript
   emailRedirectTo: `${siteUrl}/api/auth/callback`
   ```

2. **Password Reset** ([src/components/auth/ForgotPasswordForm.tsx](src/components/auth/ForgotPasswordForm.tsx))
   ```typescript
   redirectTo: `${SITE_URL}/reset-password`
   ```

3. **Magic Link Login** ([src/server/actions/auth.actions.ts](src/server/actions/auth.actions.ts))
   ```typescript
   emailRedirectTo: `${siteUrl}/api/auth/callback`
   ```

## 🔍 Debugging

If you're getting wrong URLs in emails:

1. **Check your environment**:
   ```typescript
   console.log('Environment:', process.env.NODE_ENV);
   console.log('Site URL:', SITE_URL);
   ```

2. **Verify Vercel environment variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure `NODE_ENV=production` and `NEXT_PUBLIC_SITE_URL` is set

3. **Check Supabase redirect URLs**:
   - Make sure your production URL is in the allowed redirect URLs list

## 📌 Important Notes

1. **NEXT_PUBLIC prefix**: This makes the variable available on the client side
2. **NODE_ENV**: Automatically set by Vercel (production) and Next.js dev server (development)
3. **No trailing slashes**: URLs should not end with `/` (already fixed in your .env)
4. **Supabase wildcard**: Use `/*` to allow all paths under your domain

## ✨ Benefits of This Setup

✅ No code changes needed between environments  
✅ Automatic URL selection based on NODE_ENV  
✅ Consistent behavior across all auth flows  
✅ Easy to add custom domains later  
✅ Centralized configuration in one constant  

## 🎉 You're All Set!

Your project now automatically handles environment-specific URLs. Just make sure:

- ✅ Local `.env` has the variables
- ✅ Vercel has the production variables
- ✅ Supabase has both URLs in redirect list
- ✅ Deploy and test!
