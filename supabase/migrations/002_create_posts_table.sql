-- ============================================
-- POSTS TABLE SETUP FOR SUPABASE
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste this entire SQL and run it
-- ============================================

-- ============================================
-- 1. CREATE THE POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to account table
    user_id UUID NOT NULL REFERENCES public."account"(id) ON DELETE CASCADE,
    
    -- Post content
    content TEXT NOT NULL,
    
    -- Optional fields
    image_url TEXT,
    
    -- Metadata
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE public.posts IS 'User posts and content';

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index on user_id for faster queries by user
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Policy: Anyone can view all posts (public feed)
CREATE POLICY "Anyone can view posts"
    ON public.posts
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create their own posts
CREATE POLICY "Authenticated users can create posts"
    ON public.posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts"
    ON public.posts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete own posts"
    ON public.posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE FUNCTION TO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE TRIGGER FOR AUTO-UPDATING updated_at
-- ============================================
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
