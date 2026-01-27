    -- ============================================
    -- UPDATE EXISTING USERS WITH DEFAULT AVATARS
    -- ============================================
    -- Run this SQL to add default avatars to existing users
    -- who don't have an avatar_url set
    -- ============================================

    -- Update all existing accounts with null avatars
    UPDATE public.accounts
    SET 
        avatar_url = public.generate_default_avatar(username),
        updated_at = NOW()
    WHERE avatar_url IS NULL;

    -- View the results
    SELECT 
        id,
        username,
        avatar_url,
        created_at
    FROM public.accounts
    ORDER BY created_at DESC
    LIMIT 10;

    -- ============================================
    -- TEST DEFAULT AVATAR GENERATION
    -- ============================================

    -- Test 1: Generate avatar for a specific username
    SELECT public.generate_default_avatar('TestUser') as avatar_url;

    -- Test 2: Generate multiple avatars to see color variety
    SELECT 
        username,
        public.generate_default_avatar(username) as avatar_url
    FROM public.accounts
    LIMIT 10;

    -- Test 3: Check random color function
    SELECT public.get_random_avatar_color() as random_color
    FROM generate_series(1, 10);

    -- ============================================
    -- VERIFY TRIGGERS ARE WORKING
    -- ============================================

    -- Check if triggers exist
    SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement
    FROM information_schema.triggers
    WHERE trigger_name IN ('on_auth_user_verified', 'on_auth_user_created');

    -- Check if functions exist
    SELECT 
        routine_name,
        routine_type
    FROM information_schema.routines
    WHERE routine_name IN (
        'handle_new_user',
        'handle_new_user_signup',
        'generate_default_avatar',
        'get_random_avatar_color'
    )
    AND routine_schema = 'public';
