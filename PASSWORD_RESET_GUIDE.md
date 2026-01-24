# Password Reset Feature - Setup and Usage Guide

## Overview
This guide explains the complete password reset flow implemented with Supabase Auth in your Next.js application.

## Features Implemented

### 1. **Forgot Password Page** (`/forgot-password`)
- Public route accessible to all users
- Email input form
- Sends password reset email via Supabase
- Success confirmation message

### 2. **Reset Password Page** (`/reset-password`)
- Public route that validates recovery tokens
- Detects `PASSWORD_RECOVERY` event from Supabase
- Shows different UI states:
  - Loading: Verifying recovery link
  - Invalid: Shows error message for expired/invalid links
  - Valid: Shows password reset form
  - Success: Confirmation message after password update

### 3. **Integration with Login**
- "Forgot Password?" link added to login page
- Easy access for users who forgot their password

## File Structure

```
src/
├── app/(auth)/
│   ├── forgot-password/
│   │   └── page.tsx                    # Forgot password page
│   └── reset-password/
│       └── page.tsx                    # Reset password page
├── components/auth/
│   ├── ForgotPasswordForm.tsx          # Forgot password form component
│   └── ResetPasswordForm.tsx           # Reset password form component
├── middleware.ts                        # Updated with public routes
└── lib/constants.ts                    # Updated with route constants
```

## How It Works

### User Flow

1. **User Forgets Password**
   - User goes to `/login`
   - Clicks "Forgot Password?" link
   - Redirected to `/forgot-password`

2. **Request Password Reset**
   - User enters their email
   - System calls `supabase.auth.resetPasswordForEmail()`
   - Supabase sends email with recovery link
   - User sees success message

3. **Click Recovery Link**
   - User clicks link in email
   - Link format: `https://your-app.com/reset-password#access_token=...&type=recovery`
   - Browser navigates to `/reset-password`

4. **Reset Password**
   - Page listens for `PASSWORD_RECOVERY` event via `supabase.auth.onAuthStateChange()`
   - If valid token, shows password reset form
   - User enters new password (with confirmation)
   - System calls `supabase.auth.updateUser({ password })`
   - Success message displayed
   - Auto-redirects to `/login` after 2 seconds

### Technical Implementation

#### 1. Password Recovery Event Detection
```typescript
supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        // Valid recovery session - show reset form
    }
});
```

#### 2. Token Handling
- Supabase automatically extracts tokens from URL hash
- No manual token parsing needed
- Session is temporary and only valid for password reset

#### 3. Password Update
```typescript
const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
});
```

## Supabase Configuration

### Email Templates
You need to configure the password reset email template in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Email Templates**
3. Select **Reset Password** template
4. Ensure the redirect URL contains: `{{ .SiteURL }}/reset-password`

### Site URL Configuration
In your Supabase Dashboard:
1. Go to **Authentication > URL Configuration**
2. Set **Site URL**: Your production URL (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - `http://localhost:3000/reset-password` (development)
   - `https://yourdomain.com/reset-password` (production)

### Environment Variables
Ensure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Security Features

### 1. Token Expiration
- Reset tokens expire after 1 hour (Supabase default)
- Invalid/expired tokens show error message
- Users must request new reset link

### 2. Password Validation
- Minimum 6 characters required
- Password confirmation required
- Client-side validation before API call

### 3. Public Route Security
- Routes are public but token-protected
- Middleware allows access without authentication
- Invalid tokens cannot proceed with reset

### 4. Session Handling
- Temporary session created during reset
- Automatically cleared after password update
- User must login with new password

## Usage Examples

### Requesting Password Reset
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
});
```

### Updating Password
```typescript
const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
});
```

## UI States and Messages

### Loading State
```
Verifying recovery link...
```

### Invalid Link
```
Invalid or Expired Link
This password recovery link is invalid or has expired.
Please request a new one.
[Back to Login]
```

### Success State
```
Password Updated!
Your password has been successfully updated.
Redirecting to login...
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **react-icons** (FiLock, FiMail, FiAlertCircle, FiCheckCircle)
- Consistent design with existing auth pages
- Responsive, mobile-friendly layout
- Dark theme matching your app

## Testing the Feature

### Local Testing

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Request password reset**:
   - Navigate to `http://localhost:3000/login`
   - Click "Forgot Password?"
   - Enter email and submit

3. **Check email**:
   - Open email sent by Supabase
   - Click the reset link

4. **Reset password**:
   - Enter new password
   - Confirm password
   - Submit form
   - Verify redirect to login

### Production Testing

1. Update `NEXT_PUBLIC_SITE_URL` to production URL
2. Add production URL to Supabase redirect URLs
3. Test entire flow in production environment

## Troubleshooting

### Email Not Received
- Check spam folder
- Verify email in Supabase Auth users
- Check Supabase email logs in Dashboard

### Invalid Link Error
- Check Site URL configuration in Supabase
- Verify redirect URLs are properly set
- Ensure token hasn't expired (1 hour limit)

### Password Update Fails
- Check password meets minimum requirements (6+ characters)
- Verify Supabase connection
- Check browser console for errors

### Middleware Redirect Issues
- Ensure `/forgot-password` and `/reset-password` are in `publicRoutes` array
- Clear browser cache and cookies
- Check middleware logs

## Future Enhancements

Potential improvements:
- [ ] Add password strength indicator
- [ ] Implement rate limiting for reset requests
- [ ] Add CAPTCHA to prevent abuse
- [ ] Send confirmation email after password change
- [ ] Add password history (prevent reusing old passwords)
- [ ] Multi-factor authentication integration

## API Reference

### Supabase Auth Methods Used

#### `resetPasswordForEmail(email, options)`
Sends a password reset email to the user.

**Parameters:**
- `email` (string): User's email address
- `options.redirectTo` (string): URL to redirect after clicking link

#### `updateUser(attributes)`
Updates user attributes including password.

**Parameters:**
- `attributes.password` (string): New password

#### `onAuthStateChange(callback)`
Listens for auth state changes.

**Events:**
- `PASSWORD_RECOVERY`: User arrived via recovery link
- `SIGNED_IN`: User successfully signed in
- `SIGNED_OUT`: User signed out

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth/passwords
2. Review Supabase Dashboard logs
3. Check browser console for client-side errors
4. Review server logs for backend issues

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
