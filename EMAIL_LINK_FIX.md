# 📧 Email Confirmation Link - Fixed Version

## ❌ Your Original Link (INCORRECT)

```html
<a href="{{.RedirectTo}}/auth/confirm?token_hash={{.TokenHash}} &type= email&callback={{.RedirectTo}}" 
   target="_blank">
    Confirm Account
</a>
```

### Problems:
1. **Wrong URL structure**: Using `{{.RedirectTo}}/auth/confirm`
2. **Space in parameter**: `&type= email` has a space (should be `&type=email`)
3. **Wrong parameters**: Using `token_hash` directly in URL
4. **Unnecessary callback parameter**: Not needed for Supabase email verification

---

## ✅ Correct Link (FIXED)

```html
<a href="{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=email" 
   target="_blank"
   class="button"
   style="font-size: 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; border: 1px solid #BB86FC; display: inline-block; font-weight: bold;">
    Confirm Account
</a>
```

### What Changed:
1. ✅ **Use `{{ .SiteURL }}`** - Supabase provides this variable automatically
2. ✅ **Correct endpoint**: `/api/auth/callback` 
3. ✅ **Fixed spacing**: `&type=email` (no spaces)
4. ✅ **Simple parameters**: Only `token_hash` and `type`

---

## 🔍 How It Works

### Step-by-Step Flow:

1. **User signs up** → Your app calls Supabase `signUp()`
   
2. **Supabase generates** → `TokenHash` for email verification
   
3. **Email sent** with link:
   ```
   https://yourdomain.com/api/auth/callback?token_hash=abc123&type=email
   ```
   
4. **User clicks link** → Redirected to your `/api/auth/callback` route
   
5. **Callback handler** extracts `token_hash` from URL
   
6. **Verification** → Calls `supabase.auth.verifyOtp({ token_hash, type })`
   
7. **Session created** → Tokens stored in cookies
   
8. **Redirect** → User sent to `/feed` (dashboard)

---

## 📝 Supabase Template Variables

When creating email templates in Supabase, use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .SiteURL }}` | Your configured site URL | `http://localhost:3000` |
| `{{ .TokenHash }}` | Email verification token | `abc123def456...` |
| `{{ .Email }}` | User's email address | `user@example.com` |
| `{{ .ConfirmationURL }}` | Complete confirmation URL | Full URL with token |

---

## ⚙️ Configuration in Supabase

### 1. Set Site URL
Go to: **Authentication > URL Configuration**

**Development:**
```
Site URL: http://localhost:3000
```

**Production:**
```
Site URL: https://yourdomain.com
```

### 2. Set Redirect URLs
Add these allowed redirect URLs:
```
http://localhost:3000/api/auth/callback
http://localhost:3000/feed
https://yourdomain.com/api/auth/callback
https://yourdomain.com/feed
```

### 3. Update Email Template
Go to: **Authentication > Email Templates > Confirm signup**

Paste the corrected template from:
```
supabase/email_templates/confirm_signup.html
```

---

## 🧪 Testing the Link

### Manual Test:
1. Sign up with a test email
2. Check your email inbox
3. Right-click "Confirm Account" button → Copy link address
4. The URL should look like:
   ```
   http://localhost:3000/api/auth/callback?token_hash=LONG_HASH_HERE&type=email
   ```
5. Click the button - should redirect to `/feed` after verification

### Check in Browser DevTools:
1. Open DevTools (F12)
2. Go to Application tab → Cookies
3. After clicking email link, you should see:
   - `token` cookie with JWT
   - `refresh_token` cookie with refresh token

---

## 🐛 Troubleshooting Email Links

### Link doesn't work:
- ✅ Check that Site URL is configured correctly in Supabase
- ✅ Verify redirect URLs are whitelisted
- ✅ Make sure email template uses `{{ .SiteURL }}` not `{{.RedirectTo}}`
- ✅ Check for spaces in URL parameters

### "Invalid token" error:
- ✅ Token might be expired (default: 24 hours)
- ✅ User might have already verified
- ✅ Check Supabase logs: Authentication > Logs

### Redirect loop:
- ✅ Clear browser cookies
- ✅ Check middleware.ts is not blocking callback route
- ✅ Verify callback handler is working (check console logs)

---

## 📋 Checklist

Before deploying:
- [ ] Email template updated in Supabase
- [ ] Site URL configured (both dev and prod)
- [ ] Redirect URLs whitelisted
- [ ] `/api/auth/callback` route implemented
- [ ] Test signup → email → click link → verify flow
- [ ] Check cookies are set after verification
- [ ] Verify redirect to dashboard works

---

## 🎯 Quick Reference

**Environment Variable:**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Callback Route:**
```
/src/app/api/auth/callback/route.ts
```

**Email Template:**
```
supabase/email_templates/confirm_signup.html
```

**Verification Process:**
```typescript
const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'email'
});
```

---

## ✨ Summary

Your email link is now fixed and will:
- ✅ Use the correct Supabase template variables
- ✅ Point to your callback handler
- ✅ Pass the correct parameters
- ✅ Verify the user's email
- ✅ Create a session automatically
- ✅ Redirect to the dashboard

The corrected template is ready to use in `supabase/email_templates/confirm_signup.html`! 🎉
