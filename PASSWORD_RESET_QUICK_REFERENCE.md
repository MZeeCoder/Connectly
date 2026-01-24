# Password Reset - Quick Reference

## Routes

- **Forgot Password**: `/forgot-password`
- **Reset Password**: `/reset-password`
- **Login**: `/login` (includes "Forgot Password?" link)

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ForgotPasswordForm` | `src/components/auth/ForgotPasswordForm.tsx` | Request password reset email |
| `ResetPasswordForm` | `src/components/auth/ResetPasswordForm.tsx` | Reset password with token validation |

## User Flow

```
1. User clicks "Forgot Password?" on login page
   ↓
2. Enter email → Submit
   ↓
3. Receive email from Supabase
   ↓
4. Click reset link in email
   ↓
5. Enter new password → Confirm → Submit
   ↓
6. Success → Auto-redirect to login
```

## Quick Setup Checklist

### Supabase Dashboard
- [ ] Configure Site URL in Authentication settings
- [ ] Add redirect URLs (localhost and production)
- [ ] Verify email template includes correct reset URL
- [ ] Test email delivery

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`

### Code Configuration
- [x] Public routes added to middleware
- [x] Routes added to constants
- [x] "Forgot Password?" link in login form
- [x] Reset password form with validation
- [x] Forgot password form with email sending

## Testing Steps

1. **Navigate**: Go to `/login`
2. **Click**: "Forgot Password?" link
3. **Enter**: Valid email address
4. **Check**: Email inbox/spam
5. **Click**: Reset link in email
6. **Enter**: New password (min 6 chars)
7. **Confirm**: Re-enter password
8. **Verify**: Redirected to login
9. **Login**: Test with new password

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not received | Check spam, verify Supabase email logs |
| Invalid link error | Check Site URL and redirect URLs in Supabase |
| Password update fails | Verify minimum 6 characters, check console |
| Middleware redirects | Ensure routes in `publicRoutes` array |

## API Calls

```typescript
// Request reset email
await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
});

// Update password
await supabase.auth.updateUser({
    password: newPassword,
});

// Listen for recovery event
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        // Show reset form
    }
});
```

## Files Modified/Created

### Created
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `PASSWORD_RESET_GUIDE.md`
- `PASSWORD_RESET_QUICK_REFERENCE.md`

### Modified
- `src/middleware.ts` - Added public routes
- `src/lib/constants.ts` - Fixed typos, added routes
- `src/components/layout/login/_lib/signin-form.tsx` - Added "Forgot Password?" link

## UI States

### Forgot Password Form
1. **Input Form** → Email field
2. **Success** → "Check Your Email" message

### Reset Password Form
1. **Loading** → "Verifying recovery link..."
2. **Invalid** → "Invalid or Expired Link"
3. **Valid** → Password reset form
4. **Success** → "Password Updated!"

## Security Notes

- ✅ Tokens expire in 1 hour
- ✅ Password minimum 6 characters
- ✅ Password confirmation required
- ✅ Public routes but token-protected
- ✅ Temporary session during reset
- ✅ Auto-redirect after success

---

For detailed documentation, see `PASSWORD_RESET_GUIDE.md`
