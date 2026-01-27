-- ============================================
-- POSTS TABLE UPDATE - MULTIPLE MEDIA SUPPORT
-- ============================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create a new query
-- 3. Paste this entire SQL and run it
-- ============================================

-- ============================================
-- 1. ADD COLUMNS FOR MULTIPLE MEDIA URLS
-- ============================================
-- Add columns for multiple images and videos (stored as JSON arrays)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single image_url to image_urls array (if column exists)
UPDATE public.posts 
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND image_url != '';

-- Add comment for new columns
COMMENT ON COLUMN public.posts.image_urls IS 'Array of image URLs for the post';
COMMENT ON COLUMN public.posts.video_urls IS 'Array of video URLs for the post';

-- ============================================
-- 2. CREATE STORAGE BUCKET FOR POST MEDIA
-- ============================================
-- Note: Run this in Supabase Dashboard → Storage → Create new bucket
-- Or use the SQL below:

-- Create storage bucket for posts media (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'posts-media',
    'posts-media', 
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. CREATE STORAGE POLICIES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Anyone can view post media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload post media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;

-- Policy: Anyone can view media files (public bucket)
CREATE POLICY "Anyone can view post media"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts-media');

-- Policy: Authenticated users can upload media
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'posts-media' 
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own media
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'posts-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own media
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'posts-media' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 4. CREATE INDEX FOR BETTER QUERY PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_posts_image_urls ON public.posts USING GIN (image_urls);
CREATE INDEX IF NOT EXISTS idx_posts_video_urls ON public.posts USING GIN (video_urls);
