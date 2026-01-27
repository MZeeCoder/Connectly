-- ============================================
-- LIKES TABLE SETUP FOR SUPABASE
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste this entire SQL and run it
-- ============================================

-- ============================================
-- 1. CREATE THE LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure a user can only like a post once
    UNIQUE(post_id, user_id)
);

-- Add comment to table
COMMENT ON TABLE public.likes IS 'User likes on posts';

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON public.likes;

-- Policy: Anyone can view likes
CREATE POLICY "Anyone can view likes"
    ON public.likes
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can create likes
CREATE POLICY "Authenticated users can like posts"
    ON public.likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own likes
CREATE POLICY "Users can remove own likes"
    ON public.likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 5. CREATE HELPER FUNCTIONS FOR LIKE COUNTS
-- ============================================

-- Function to increment likes_count
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement likes_count
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_likes_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_likes_count(UUID) TO authenticated;
