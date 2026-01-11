# OTP Email Verification Setup Guide

## Overview
This guide explains the OTP email verification flow that has been implemented in your Connectly application.

## Flow Description

1. **Signup** → User creates account
2. **Email Sent** → 6-digit OTP code sent to user's email
3. **Verify Page** → User redirected to verification page
4. **Enter OTP** → User enters the 6-digit code
5. **Auto Login** → Upon successful verification, user is logged in and redirected to dashboard

## Files Modified/Created

### 1. Backend Actions (`src/server/actions/auth.actions.ts`)

#### `SignupAction` - Updated
- Now sends OTP email after user registration
- Redirects to verify-account page instead of dashboard
- Uses Supabase's built-in email confirmation

#### `VerifyAccountAction` - New
- Verifies the 6-digit OTP code
- Logs user in automatically upon successful verification
- Redirects to dashboard

#### `ResendOTPAction` - New
- Allows users to request a new OTP code
- Useful when the original code expires or wasn't received

### 2. Email Template (`src/lib/email/templates.ts`)

#### `generateOTPEmail()` - New
- Beautiful HTML email template with:
  - Professional design with gradient header
  - Large, clear OTP display
  - Validity timer (10 minutes)
  - Security warning
  - Responsive design for mobile devices

#### `generateOTPEmailText()` - New
- Plain text version for email clients that don't support HTML

### 3. Frontend Components

#### `signup-form.tsx` - Updated
- Passes email as query parameter to verify page
- Enables resend functionality

#### `verify-account-form.tsx` - Updated
- Integrated with `VerifyAccountAction`
- Auto-verifies when all 6 digits are entered
- Shows success/error messages
- Resend code functionality
- Paste support for copying OTP from email
- Smooth animations and user feedback

## Supabase Configuration Required

To use the email templates and customize the OTP email, you need to configure Supabase:

### Step 1: Enable Email Confirmations

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable **Confirm email**
4. Set **Confirm email template** (optional, as we're using custom template)

### Step 2: Configure Email Templates (Optional)

If you want to use the custom HTML template created in `src/lib/email/templates.ts`:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Replace the template with content from `generateOTPEmail()`

**Note:** Supabase uses its own template system, so you might need to adapt the template to their format. The template provided is ready to use with services like:
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP server

### Step 3: Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4: Configure OTP Expiration (Optional)

In Supabase Dashboard:
1. Go to **Authentication** → **Settings**
2. Adjust **OTP expiration time** (default is 3600 seconds / 1 hour)
3. For this app, 600 seconds (10 minutes) is recommended

## How to Use Custom Email Template with External Email Service

If you want to use the beautiful email template created, you'll need to:

1. Set up an email service (SendGrid, Mailgun, etc.)
2. Create a webhook or API endpoint to send emails
3. Modify `SignupAction` to send the email using your service

Example with SendGrid:

```typescript
import { generateOTPEmail } from "@/lib/email/templates";
import sgMail from "@sendgrid/mail";

// In SignupAction, after user creation:
const otp = "123456"; // Get OTP from Supabase or generate your own

const emailHtml = generateOTPEmail({
    username: credentials.username,
    otp: otp,
});

await sgMail.send({
    to: credentials.email,
    from: "noreply@connectly.com",
    subject: "Verify Your Account - Connectly",
    html: emailHtml,
});
```

## Testing the Flow

1. **Signup:**
   ```
   Navigate to /sign-up
   Fill in the form
   Submit
   ```

2. **Check Email:**
   - Check your email inbox
   - Find the 6-digit OTP code
   - The code is valid for 10 minutes

3. **Verify:**
   ```
   You'll be redirected to /verify-account
   Enter the 6-digit code
   Or paste it (it will auto-populate)
   Submit or wait for auto-verification
   ```

4. **Success:**
   ```
   Upon successful verification:
   - You'll see a success message
   - You'll be logged in automatically
   - You'll be redirected to /feed (dashboard)
   ```

## Resend Code Feature

If the user doesn't receive the code:
1. Click "Resend code" button
2. A new OTP will be sent to their email
3. The previous code will be invalidated

## Security Features

✅ OTP expires after 10 minutes
✅ Automatic code clearing on error
✅ Rate limiting (handled by Supabase)
✅ Email verification required before login
✅ Secure OTP generation by Supabase

## Troubleshooting

### Email not received?
- Check spam/junk folder
- Verify email is correct
- Use "Resend code" button
- Check Supabase logs for email delivery issues

### Invalid code error?
- Code may have expired (10 minutes)
- Request a new code using "Resend"
- Ensure you're entering all 6 digits correctly

### Auto-verification not working?
- Clear browser cache
- Check browser console for errors
- Manually click "Verify Account" button

## Next Steps

1. **Configure Supabase email settings**
2. **Test the complete flow**
3. **Customize email template styling** (optional)
4. **Set up production email service** (for custom templates)
5. **Add rate limiting** (optional, for extra security)

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs/guides/auth
- Supabase email templates: https://supabase.com/docs/guides/auth/auth-email-templates
