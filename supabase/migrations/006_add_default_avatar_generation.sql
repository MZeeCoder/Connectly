-- ============================================
-- ADD DEFAULT AVATAR GENERATION
-- ============================================
-- This migration adds a function to generate default avatars
-- with user initials and random background colors
-- ============================================

-- Function to generate a random color from predefined palette
CREATE OR REPLACE FUNCTION public.get_random_avatar_color()
RETURNS TEXT AS $$
DECLARE
    colors TEXT[] := ARRAY[
        'FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8',
        'F7DC6F', 'BB8FCE', 'F8B739', '52C7B8', 'FF7979',
        '6C5CE7', 'A29BFE', 'FD79A8', 'FDCB6E', '74B9FF'
    ];
BEGIN
    RETURN colors[1 + floor(random() * array_length(colors, 1))::int];
END;
$$ LANGUAGE plpgsql;

-- Function to generate default avatar URL with initials
CREATE OR REPLACE FUNCTION public.generate_default_avatar(username TEXT)
RETURNS TEXT AS $$
DECLARE
    initial TEXT;
    bg_color TEXT;
    avatar_url TEXT;
BEGIN
    -- Get first letter of username (default to 'U' if empty)
    initial := COALESCE(UPPER(LEFT(TRIM(username), 1)), 'U');
    
    -- Get random background color
    bg_color := public.get_random_avatar_color();
    
    -- Generate UI Avatars URL
    avatar_url := 'https://ui-avatars.com/api/?name=' || 
                  initial || 
                  '&background=' || bg_color || 
                  '&color=ffffff&size=200&bold=true&format=png';
    
    RETURN avatar_url;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to use default avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar_url TEXT;
BEGIN
    -- Only create accounts if email is confirmed and accounts doesn't exist yet
    IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
        -- Check if accounts already exists
        IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = NEW.id) THEN
            -- Get username from metadata or email
            v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
            
            -- Use provided avatar_url or generate default
            v_avatar_url := COALESCE(
                NEW.raw_user_meta_data->>'avatar_url',
                public.generate_default_avatar(v_username)
            );
            
            -- Insert new accounts record
            INSERT INTO public.accounts (id, email, username, avatar_url, bio, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                v_username,
                v_avatar_url,
                NULL,
                NOW(),
                NOW()
            );
            
            RAISE LOG 'Created accounts for user: % with avatar: %', NEW.id, v_avatar_url;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user_signup function to use default avatar
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar_url TEXT;
BEGIN
    -- Check if accounts doesn't exist yet
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = NEW.id) THEN
        -- Get username from metadata or email
        v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
        
        -- Use provided avatar_url or generate default
        v_avatar_url := COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            public.generate_default_avatar(v_username)
        );
        
        -- Insert new accounts record
        INSERT INTO public.accounts (id, email, username, avatar_url, bio, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            v_username,
            v_avatar_url,
            NULL,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE LOG 'Created accounts for new user: % with avatar: %', NEW.id, v_avatar_url;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON FUNCTION public.get_random_avatar_color() IS 'Returns a random color from predefined palette for avatar generation';
COMMENT ON FUNCTION public.generate_default_avatar(TEXT) IS 'Generates a default avatar URL with user initials and random background color';
