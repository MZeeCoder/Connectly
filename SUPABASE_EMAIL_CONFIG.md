# 📧 Supabase Email Template Configuration

## Step-by-Step Configuration Guide

### 1. Access Email Templates

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates** (in left sidebar)

### 2. Configure "Reset Password" Template

#### Select Template
- Click on **"Reset Password"** from the template list

#### Email Subject
```
Reset Your Password
```

#### Email Content (HTML)

```html
<h2>Reset Password</h2>

<p>Hi there,</p>

<p>Someone requested a password reset for your account. If this was you, click the link below to reset your password:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password">Reset Password</a>
</p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/reset-password</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>Thanks,<br>
The {{ .AppName }} Team</p>
```

#### Important Variables
- `{{ .SiteURL }}` - Your application URL (configured in URL settings)
- `{{ .AppName }}` - Your app name (from project settings)
- `{{ .Token }}` - Auto-appended to URL by Supabase
- `{{ .TokenHash }}` - Auto-appended to URL by Supabase

> **Note**: You don't need to manually add token parameters. Supabase automatically appends `#access_token=...&type=recovery` to the URL.

#### Preview Template
- Use the "Send Test Email" feature to test
- Check formatting and links

#### Save
- Click **Save** to apply changes

---

### 3. Configure URL Settings

#### Access URL Configuration
1. In Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**

#### Site URL
Set your primary application URL:

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://yourdomain.com
```

#### Redirect URLs
Add the following URLs (one per line):

**Development URLs:**
```
http://localhost:3000/reset-password
http://localhost:3000/forgot-password
http://localhost:3000/api/auth/callback
```

**Production URLs (when deployed):**
```
https://yourdomain.com/reset-password
https://yourdomain.com/forgot-password
https://yourdomain.com/api/auth/callback
```

#### Save Changes
- Click **Save** after adding all URLs

---

### 4. Email Provider Configuration

#### Option A: Use Supabase Default (Free Tier)
- ✅ No configuration needed
- ⚠️ Limited to 3 emails per hour
- ⚠️ May go to spam
- ✅ Good for development/testing

#### Option B: Custom SMTP (Recommended for Production)
1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your provider:

**Example: Gmail SMTP**
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Sender Email: noreply@yourdomain.com
Sender Name: Your App Name
```

**Example: SendGrid**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
Sender Email: noreply@yourdomain.com
Sender Name: Your App Name
```

**Popular Providers:**
- [SendGrid](https://sendgrid.com/) - 100 emails/day free
- [Mailgun](https://www.mailgun.com/) - 5,000 emails/month free
- [AWS SES](https://aws.amazon.com/ses/) - 62,000 emails/month free
- [Postmark](https://postmarkapp.com/) - 100 emails/month free

---

### 5. Email Rate Limiting

#### Configure Rate Limits
1. Go to **Authentication** → **Rate Limits**
2. Set appropriate limits:

**Recommended Settings:**
```
Password Reset Requests: 3 per hour per user
Password Reset Requests: 10 per hour per IP
```

This prevents abuse while allowing legitimate retries.

---

### 6. Testing Configuration

#### Test Email Delivery
1. In **Authentication** → **Email Templates**
2. Select "Reset Password" template
3. Click **Send Test Email**
4. Enter your email
5. Click **Send**
6. Check inbox/spam for email

#### Verify Links
1. Click the link in test email
2. Should redirect to: `http://localhost:3000/reset-password#access_token=...`
3. Verify your app shows the reset form

---

## 🔍 Verification Checklist

### Email Template
- [ ] Template contains `{{ .SiteURL }}/reset-password`
- [ ] Subject line is clear
- [ ] HTML formatting looks good
- [ ] Test email sent successfully
- [ ] Test email received (check spam too)

### URL Configuration
- [ ] Site URL is correct for environment
- [ ] All redirect URLs added
- [ ] URLs use correct protocol (http/https)
- [ ] No trailing slashes in URLs

### SMTP (if using custom)
- [ ] SMTP credentials entered correctly
- [ ] Sender email configured
- [ ] Test email sends successfully
- [ ] Emails don't go to spam

---

## 🐛 Troubleshooting

### Email Not Received

**Check:**
1. Spam/Junk folder
2. Supabase email logs: **Authentication** → **Logs**
3. SMTP configuration (if custom)
4. Email address is verified
5. Rate limits not exceeded

### Invalid Link Error

**Check:**
1. Site URL matches your app URL exactly
2. Redirect URL includes `/reset-password`
3. Token hasn't expired (1 hour limit)
4. Link hasn't been used already

### Link Goes to Wrong URL

**Check:**
1. `NEXT_PUBLIC_SITE_URL` in `.env.local`
2. Site URL in Supabase matches
3. No typos in template URL
4. Correct environment (dev vs prod)

### Emails Go to Spam

**Solutions:**
1. Use custom SMTP with verified domain
2. Add SPF/DKIM records to DNS
3. Use reputable email provider
4. Don't use Supabase default in production

---

## 📋 Quick Reference

### Email Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .SiteURL }}` | Your app URL | `https://yourdomain.com` |
| `{{ .AppName }}` | Project name | `Connectly` |
| `{{ .Email }}` | User's email | `user@example.com` |
| `{{ .Token }}` | Reset token | Auto-appended |
| `{{ .TokenHash }}` | Token hash | Auto-appended |

### URL Format

**Email Link:**
```
{{ .SiteURL }}/reset-password
```

**Actual URL (after Supabase):**
```
https://yourdomain.com/reset-password#access_token=abc123...&type=recovery&...
```

### Token Lifespan
- **Expiration**: 1 hour from request
- **Usage**: One-time use only
- **Scope**: Limited to password update

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Switch to custom SMTP provider
- [ ] Update Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Set proper rate limits
- [ ] Test with multiple email providers
- [ ] Configure DNS records (SPF, DKIM)
- [ ] Test email deliverability
- [ ] Monitor email logs

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-email
- **Email Troubleshooting**: https://supabase.com/docs/guides/auth/auth-smtp
- **Rate Limiting**: https://supabase.com/docs/guides/auth/auth-rate-limits

---

**Configuration Status**: ⏳ PENDING - FOLLOW STEPS ABOVE  
**Last Updated**: January 25, 2026  
**Required For**: Password Reset Feature
