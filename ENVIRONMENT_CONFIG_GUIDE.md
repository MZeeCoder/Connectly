# 🔧 Environment Configuration Guide

## ✅ Automatic Development/Production Detection

Your app now **automatically detects** whether you're in development or production and uses the correct URL!

---

## 🏠 Development Mode (localhost)

### When You Run:
```bash
npm run dev
# or
pnpm dev
```

### What Happens:
✅ **Automatically uses `http://localhost:3000`**  
✅ No need to set `NEXT_PUBLIC_SITE_URL` in `.env`  
✅ Just works out of the box!

### Your `.env` File (Development):
```bash
# .env or .env.local
NEXT_PUBLIC_SUPABASE_URL=https://smwgkugtkmlpldcpfzmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# ⚠️ DON'T SET THIS IN DEVELOPMENT:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000  ← Not needed!
```

---

## 🌐 Production Mode (Cloudflare/Vercel)

### When Deployed:
✅ **Uses your production URL** (e.g., `https://your-app.pages.dev`)  
✅ Set in hosting platform environment variables  
✅ Falls back to localhost if not set (safe)

### Cloudflare Pages Environment Variables:
```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://smwgkugtkmlpldcpfzmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# ✅ SET THIS IN PRODUCTION:
NEXT_PUBLIC_SITE_URL=https://your-app.pages.dev
```

---

## 🔍 How It Works

### Code Logic (in `src/lib/constants.ts`):
```typescript
export const SITE_URL = 
    process.env.NODE_ENV === "development" 
        ? "http://localhost:3000"              // 🏠 Dev: Always localhost
        : (process.env.NEXT_PUBLIC_SITE_URL    // 🌐 Prod: Use env variable
            || "http://localhost:3000");       // 🛡️ Fallback: Localhost
```

### What This Means:
| Environment | NODE_ENV | SITE_URL Used | Why |
|-------------|----------|---------------|-----|
| `npm run dev` | `development` | `http://localhost:3000` | Auto-detected ✅ |
| `npm run build` | `production` | From env var | For deployment ✅ |
| Not set | `production` | `http://localhost:3000` | Safe fallback ✅ |

---

## 📋 Quick Setup Guide

### For Local Development:
```bash
# 1. Copy .env.example to .env.local
cp .env.example .env.local

# 2. Add your Supabase credentials
# Edit .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# 3. Run development server
pnpm dev

# ✅ App will use http://localhost:3000 automatically!
```

### For Production (Cloudflare Pages):
```bash
# 1. Go to Cloudflare Pages → Settings → Environment Variables

# 2. Add these for Production AND Preview:
NEXT_PUBLIC_SUPABASE_URL=https://smwgkugtkmlpldcpfzmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key (mark as encrypted)

# 3. Add production URL:
NEXT_PUBLIC_SITE_URL=https://your-project.pages.dev

# 4. Deploy!
```

---

## ✅ Benefits of This Setup

1. **🚀 Zero Configuration for Development**
   - No need to set SITE_URL locally
   - Just run `pnpm dev` and it works

2. **🔒 Secure Production**
   - Production URLs set in hosting platform
   - Not hardcoded in code

3. **🛡️ Safe Fallback**
   - If env var missing, falls back to localhost
   - Prevents errors

4. **📦 Portable**
   - Same code works everywhere
   - Team members don't need to configure URLs

---

## 🧪 Testing

### Test Development:
```bash
pnpm dev
# Open http://localhost:3000
# Check password reset emails use localhost:3000 ✅
```

### Test Production Build:
```bash
# Without NEXT_PUBLIC_SITE_URL
pnpm build
# Should build successfully ✅

# With production URL
NEXT_PUBLIC_SITE_URL=https://my-app.pages.dev pnpm build
# Should use production URL ✅
```

---

## 🔧 Troubleshooting

### Issue: Password reset emails go to wrong URL
**Solution:** Check that `NEXT_PUBLIC_SITE_URL` is set correctly in production

### Issue: localhost:3000 not working
**Solution:** Check that port 3000 is not in use: `lsof -i :3000` (Mac/Linux) or `netstat -ano | findstr :3000` (Windows)

### Issue: Production still uses localhost
**Solution:** Verify `NEXT_PUBLIC_SITE_URL` is set in hosting platform environment variables

---

## 📚 Files Modified

- ✅ `src/lib/constants.ts` - Auto-detection logic
- ✅ `src/server/actions/auth.actions.ts` - Uses centralized SITE_URL
- ✅ `src/components/auth/ForgotPasswordForm.tsx` - Uses centralized SITE_URL
- ✅ `.env.example` - Updated documentation

---

**Status:** ✅ **Working**  
**Build Verified:** ✅ **Success**  
**Auto-Detection:** ✅ **Enabled**

Now you can run `pnpm dev` and it will automatically use `localhost:3000`! 🎉
