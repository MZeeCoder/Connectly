# 🗄️ Supabase SQL Queries - Quick Reference

## 📋 How to Run These Queries

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the SQL from the migration file
5. Click "Run" (or press Cmd/Ctrl + Enter)

---

## 📂 Main Migration File

**Location:** `supabase/migrations/001_initial_schema.sql`

This file contains:
- ✅ All table definitions
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers and functions
- ✅ Permissions

**Run this entire file in Supabase SQL Editor.**

---

## 📊 Tables Overview

### 1. users
Stores user profile information (extends Supabase auth.users)

```sql
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. posts
Stores user posts/updates

```sql
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. comments
Stores comments on posts

```sql
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. likes
Tracks post likes

```sql
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
```

### 5. follows
Tracks user follows/followers

```sql
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
```

### 6. messages
Stores direct messages between users

```sql
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **users**: Anyone can view, users can update their own profile
- **posts**: Anyone can view, users can CRUD their own posts
- **comments**: Anyone can view, authenticated users can create, users can manage their own
- **likes**: Anyone can view, users can like/unlike
- **follows**: Anyone can view, users can follow/unfollow
- **messages**: Users can only see their own messages

---

## 🎯 Key Features

### Automatic Triggers:
- `updated_at` columns auto-update on record changes
- `likes_count` auto-increments/decrements
- `comments_count` auto-increments/decrements

### Constraints:
- Email must be unique
- Username must be unique
- Can't like same post twice
- Can't follow same user twice
- Can't follow yourself
- Can't create duplicate messages

### Indexes:
- All foreign keys indexed
- Username and email indexed for fast lookups
- Created dates indexed for chronological queries
- Optimized for common query patterns

---

## 🧪 Test Queries

After running the migration, test with these queries:

### Check tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### View RLS policies:
```sql
SELECT * 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check triggers:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

---

## 🔧 Useful Supabase Queries

### View all users:
```sql
SELECT id, email, username, created_at 
FROM public.users 
ORDER BY created_at DESC;
```

### View unverified users:
```sql
SELECT email, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL;
```

### View recent posts:
```sql
SELECT p.*, u.username 
FROM public.posts p
JOIN public.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### Check user's post count:
```sql
SELECT u.username, COUNT(p.id) as post_count
FROM public.users u
LEFT JOIN public.posts p ON u.id = p.user_id
GROUP BY u.username;
```

---

## 🚨 Troubleshooting

### If migration fails:

1. **Check existing tables:**
```sql
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

2. **Then run the migration again**

### If RLS blocks queries:

Check you're authenticated:
```sql
SELECT auth.uid();  -- Should return your user ID
```

If null, you're not authenticated. RLS will block queries.

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/trigger-definition.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## ✅ Verification Checklist

After running the migration:
- [ ] All 6 tables created
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] All triggers created
- [ ] Test queries work
- [ ] Can insert test user
- [ ] Can insert test post
- [ ] Policies work correctly

---

**🎉 Your database schema is now complete!**

Return to [AUTH_COMPLETE_SETUP.md](AUTH_COMPLETE_SETUP.md) to continue setup.
