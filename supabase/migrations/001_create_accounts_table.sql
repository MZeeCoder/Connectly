-- ============================================
-- ACCOUNTS TABLE SETUP FOR SUPABASE
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste this entire SQL and run it
-- ============================================

-- Drop existing table if needed (uncomment if you want to reset)
-- DROP TABLE IF EXISTS public."Accounts" CASCADE;

-- ============================================
-- 1. CREATE THE ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public."Accounts" (
    -- Primary key - matches auth.users.id
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User information
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    
    -- Profile fields (add more as needed)
    avatar_url TEXT,
    bio TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public."Accounts" IS 'User profile data - linked to auth.users';

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public."Accounts" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own account"
    ON public."Accounts"
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own account"
    ON public."Accounts"
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Allow insert for authenticated users (for their own profile)
CREATE POLICY "Users can insert own account"
    ON public."Accounts"
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (optional)
CREATE POLICY "Users can delete own account"
    ON public."Accounts"
    FOR DELETE
    USING (auth.uid() = id);

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_accounts_email ON public."Accounts"(email);
CREATE INDEX IF NOT EXISTS idx_accounts_username ON public."Accounts"(username);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public."Accounts"(created_at DESC);

-- ============================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ============================================
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
DROP TRIGGER IF EXISTS set_updated_at ON public."Accounts";
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public."Accounts"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. (OPTIONAL) AUTO-CREATE ACCOUNT ON SIGNUP
-- ============================================
-- This trigger automatically creates an Account when a user signs up
-- Uncomment if you want automatic account creation instead of manual

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."Accounts" (id, email, username, full_name, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Account already exists, ignore
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create account when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
*/

-- ============================================
-- 7. VERIFY SETUP
-- ============================================
-- Check if table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Accounts'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'Accounts';

-- ============================================
-- DONE! Your Accounts table is ready.
-- ============================================
