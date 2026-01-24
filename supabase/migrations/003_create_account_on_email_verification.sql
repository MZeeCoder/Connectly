-- ============================================
-- AUTO-CREATE ACCOUNT ON EMAIL VERIFICATION
-- ============================================
-- This migration creates a trigger that automatically creates
-- an account record when a user verifies their email address
-- ============================================

-- Function to create accounts record after email verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create accounts if email is confirmed and accounts doesn't exist yet
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        -- Check if accounts already exists
        IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = NEW.id) THEN
            -- Insert new accounts record
            INSERT INTO public.accounts (id, email, username, avatar_url, bio, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
                NEW.raw_user_meta_data->>'avatar_url',
                NULL,
                NOW(),
                NOW()
            );
            
            RAISE LOG 'Created accounts for user: %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Also create accounts immediately on signup (for cases where email confirmation is disabled)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if accounts doesn't exist yet
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = NEW.id) THEN
        -- Insert new accounts record
        INSERT INTO public.accounts (id, email, username, avatar_url, bio, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'avatar_url',
            NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE LOG 'Created accounts for new user: %', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates account record when user email is verified';
COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Automatically creates account record when user signs up';
