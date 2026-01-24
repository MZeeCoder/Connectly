# ✅ Pre-Launch Checklist

Use this checklist before testing your authentication system.

## 🔧 Environment Setup

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Fill in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `NEXT_PUBLIC_SITE_URL` (http://localhost:3000 for dev)
- [ ] Restart dev server after changing env variables

## 🗄️ Supabase Database Setup

- [ ] Go to Supabase SQL Editor
- [ ] Copy content from `supabase/migrations/001_initial_schema.sql`
- [ ] Run the SQL query
- [ ] Verify all tables created (users, posts, comments, likes, follows, messages)
- [ ] Check that RLS is enabled on all tables

## 📧 Email Configuration

- [ ] Go to Supabase → Authentication → Email Templates
- [ ] Click on "Confirm signup" template
- [ ] Replace HTML with content from `supabase/email_templates/confirm_signup.html`
- [ ] Verify the link uses: `{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=email`
- [ ] Save the template

## ⚙️ Supabase Auth Settings

- [ ] Go to Authentication → Settings
- [ ] Set Site URL to `http://localhost:3000`
- [ ] Add redirect URL: `http://localhost:3000/api/auth/callback`
- [ ] Add redirect URL: `http://localhost:3000/feed`
- [ ] Enable Email provider
- [ ] Enable "Confirm email" option
- [ ] Save settings

## 🎨 Code Review

- [ ] [auth.actions.ts](src/server/actions/auth.actions.ts) - Check SignupAction, SigninAction, LogoutAction exist
- [ ] [callback/route.ts](src/app/api/auth/callback/route.ts) - Verify email verification handler
- [ ] [middleware.ts](middleware.ts) - Check route protection logic
- [ ] [signup-form.tsx](src/components/layout/signup/_lib/signup-form.tsx) - Verify form calls SignupAction
- [ ] [signin-form.tsx](src/components/layout/login/_lib/signin-form.tsx) - Verify form uses email field
- [ ] [LogoutButton.tsx](src/components/auth/LogoutButton.tsx) - Check uses LogoutAction

## 🧪 Testing - Signup Flow

- [ ] Start dev server: `pnpm dev`
- [ ] Navigate to http://localhost:3000/signup
- [ ] Fill in signup form with test email
- [ ] Click "Create account"
- [ ] See success message: "Account created! Please check your email..."
- [ ] Check email inbox (or Supabase logs if using default SMTP)
- [ ] Verify email received with "Confirm Account" button
- [ ] Click confirmation button
- [ ] Verify redirect to http://localhost:3000/feed
- [ ] Check browser DevTools → Application → Cookies
- [ ] Verify `token` cookie exists
- [ ] Verify `refresh_token` cookie exists

## 🧪 Testing - Login Flow

- [ ] Navigate to http://localhost:3000/login
- [ ] Enter verified email and password
- [ ] Click "Sign in"
- [ ] Verify redirect to /feed
- [ ] Verify cookies are set
- [ ] Verify can access dashboard pages

## 🧪 Testing - Middleware Protection

### Test Protected Routes:
- [ ] Log out (clear cookies)
- [ ] Try to access http://localhost:3000/feed directly
- [ ] Should redirect to /login
- [ ] Try http://localhost:3000/messages
- [ ] Should redirect to /login
- [ ] Try http://localhost:3000/profile
- [ ] Should redirect to /login

### Test Auth Route Protection:
- [ ] Log in successfully
- [ ] Try to access http://localhost:3000/login
- [ ] Should redirect to /feed
- [ ] Try to access http://localhost:3000/signup
- [ ] Should redirect to /feed

## 🧪 Testing - Logout Flow

- [ ] While logged in, click logout button
- [ ] Verify redirect to /login
- [ ] Check DevTools → Cookies
- [ ] Verify cookies are cleared
- [ ] Try to access /feed
- [ ] Should redirect to /login

## 🔍 Debugging Checklist

If something doesn't work, check:

### Email not received:
- [ ] Check Supabase → Authentication → Logs for errors
- [ ] Check spam folder
- [ ] For dev, check Supabase → Authentication → Users (user should appear as unconfirmed)
- [ ] Verify SMTP settings in Supabase

### Login fails:
- [ ] Email must be verified first
- [ ] Check password meets requirements (min 6 characters)
- [ ] Check browser console for errors
- [ ] Check Supabase logs

### Redirect loops:
- [ ] Clear all browser cookies
- [ ] Verify .env.local variables are correct
- [ ] Restart dev server
- [ ] Check middleware.ts config.matcher

### Session not persisting:
- [ ] Check cookies are being set (DevTools → Application → Cookies)
- [ ] Verify middleware is running (add console.log if needed)
- [ ] Check NEXT_PUBLIC_SUPABASE_URL is correct
- [ ] Ensure running on http://localhost:3000 (not 127.0.0.1)

## 🚀 Production Checklist

Before deploying to production:

### Environment:
- [ ] Update NEXT_PUBLIC_SITE_URL to production domain
- [ ] Update Supabase Site URL to production domain
- [ ] Add production redirect URLs in Supabase
- [ ] Set secure: true for cookies (already done in code)

### Email:
- [ ] Configure custom SMTP service (SendGrid, AWS SES, etc.)
- [ ] Update email template with production URLs
- [ ] Test email delivery in production

### Security:
- [ ] Enable rate limiting in Supabase
- [ ] Review RLS policies
- [ ] Enable CORS if needed
- [ ] Consider adding 2FA
- [ ] Review cookie security settings

### Performance:
- [ ] Test with real users
- [ ] Monitor Supabase usage
- [ ] Check database indexes are working
- [ ] Monitor auth logs for errors

## 📝 Notes

### Common Issues:
1. **"Invalid credentials"** - User email not verified yet
2. **"Session expired"** - Refresh token expired, user needs to login again
3. **Email link expired** - Default 24 hours, user needs new email
4. **Redirect loop** - Usually cookies issue, clear and retry

### Useful Commands:
```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Check for errors
pnpm lint
```

### Useful URLs:
- Supabase Dashboard: https://app.supabase.com
- Local Signup: http://localhost:3000/signup
- Local Login: http://localhost:3000/login
- Local Dashboard: http://localhost:3000/feed

## ✅ Final Check

All done? Verify:
- [x] Environment variables configured
- [x] Database schema deployed
- [x] Email template updated
- [x] Supabase auth settings configured
- [x] Signup flow works end-to-end
- [x] Login flow works
- [x] Logout flow works
- [x] Middleware protects routes
- [x] Cookies are set correctly
- [x] Email verification works

---

**🎉 If all checkboxes are checked, your authentication system is ready!**

For detailed help, see:
- [AUTH_COMPLETE_SETUP.md](AUTH_COMPLETE_SETUP.md) - Complete setup guide
- [EMAIL_LINK_FIX.md](EMAIL_LINK_FIX.md) - Email link explanation
- [AUTHENTICATION_SUMMARY.md](AUTHENTICATION_SUMMARY.md) - Quick summary

Happy coding! 🚀
