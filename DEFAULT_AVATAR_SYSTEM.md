# Default Avatar Generation System

## Overview
This system automatically generates default avatars for users who don't upload a profile photo during signup. Each avatar displays the user's first initial on a randomly selected background color.

## Features

- **Automatic Generation**: Avatars are created automatically when a user account is created
- **User Initials**: Each avatar displays the first letter of the username
- **Random Colors**: Background colors are randomly selected from a curated palette of 15 colors
- **No Storage Required**: Uses external API (UI Avatars) - no server storage needed
- **Consistent**: Same URL format across the application
- **Fallback Ready**: Works seamlessly with the existing Avatar component

## Implementation

### 1. Database Layer (PostgreSQL)

**Location**: `supabase/migrations/006_add_default_avatar_generation.sql`

Two helper functions are created:

#### `get_random_avatar_color()`
Returns a random hex color from a predefined palette of 15 colors:
```sql
-- Colors include: Red, Teal, Blue, Salmon, Mint, Yellow, Purple, Orange, etc.
```

#### `generate_default_avatar(username)`
Generates a default avatar URL using the UI Avatars API:
```sql
-- Returns URL like:
-- https://ui-avatars.com/api/?name=J&background=FF6B6B&color=ffffff&size=200&bold=true&format=png
```

### 2. Database Triggers (Modified)

Two existing triggers are updated to use default avatar generation:

#### `handle_new_user()` - Email Verification Flow
Triggered when a user verifies their email:
- Checks if user provided an avatar_url in metadata
- If not, generates default avatar with username initial
- Creates account record with avatar URL

#### `handle_new_user_signup()` - Immediate Signup Flow
Triggered on new user creation:
- Same logic as above
- Handles cases where email confirmation is disabled

### 3. Utility Functions (TypeScript)

**Location**: `src/utils/avatar.ts`

#### `generateDefaultAvatar(name, backgroundColor?)`
Client-side function to generate avatar URLs:
```typescript
// Example usage:
const avatarUrl = generateDefaultAvatar('John');
// Returns: https://ui-avatars.com/api/?name=J&background=4ECDC4&color=ffffff...
```

#### `generateDiceBearAvatar(seed)`
Alternative implementation using DiceBear API:
```typescript
const avatarUrl = generateDiceBearAvatar('john@example.com');
// Returns DiceBear SVG avatar
```

#### `isDefaultAvatar(avatarUrl)`
Utility to check if an avatar URL is a default/generated one:
```typescript
if (isDefaultAvatar(user.avatar_url)) {
  // Show upload prompt
}
```

## Color Palette

15 carefully selected colors for visual variety:
```
FF6B6B - Red
4ECDC4 - Teal
45B7D1 - Blue
FFA07A - Light Salmon
98D8C8 - Mint
F7DC6F - Yellow
BB8FCE - Purple
F8B739 - Orange
52C7B8 - Turquoise
FF7979 - Pink Red
6C5CE7 - Purple Blue
A29BFE - Light Purple
FD79A8 - Pink
FDCB6E - Golden
74B9FF - Sky Blue
```

## UI Avatars API

### Service Details
- **Provider**: UI Avatars (https://ui-avatars.com/)
- **Cost**: Free
- **Rate Limit**: None specified
- **CDN**: Cloudflare
- **Format**: PNG or SVG

### Parameters Used
- `name`: User's initial (1 character)
- `background`: Hex color (6 characters, no #)
- `color`: Text color (ffffff - white)
- `size`: 200px
- `bold`: true
- `format`: png

### Example URL
```
https://ui-avatars.com/api/?name=J&background=FF6B6B&color=ffffff&size=200&bold=true&format=png
```

## Usage Examples

### During Signup
```typescript
// User signs up without providing avatar
const { data, error } = await supabase.auth.signUp({
  email: 'john@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'johndoe'
      // No avatar_url provided
    }
  }
});

// Database trigger automatically generates:
// avatar_url: https://ui-avatars.com/api/?name=J&background=<random>&...
```

### In Components
```tsx
import { Avatar } from "@/components/ui/Avatar";

// Avatar component automatically handles default avatars
<Avatar
  src={user.avatar_url} // May be default avatar URL
  alt={user.username}
  fallback={user.username?.charAt(0)}
/>
```

### Checking if Avatar is Default
```typescript
import { isDefaultAvatar } from "@/utils/avatar";

if (isDefaultAvatar(user.avatar_url)) {
  // Show "Upload your photo" prompt
}
```

## Migration

### Applying the Migration

1. **Development (Local Supabase)**:
```bash
supabase db reset
# Or apply specific migration
supabase migration up
```

2. **Production**:
```bash
supabase db push
```

### Update Existing Users
To add default avatars to existing users without avatars:

```sql
-- Update existing accounts with null avatars
UPDATE public.accounts
SET avatar_url = public.generate_default_avatar(username)
WHERE avatar_url IS NULL;
```

## Testing

### Test Default Avatar Generation
```sql
-- Test the function directly
SELECT public.generate_default_avatar('TestUser');

-- Should return URL like:
-- https://ui-avatars.com/api/?name=T&background=45B7D1&color=ffffff&size=200&bold=true&format=png
```

### Test Signup Flow
1. Create a new account without providing avatar_url
2. Verify email
3. Check accounts table - avatar_url should be populated with UI Avatars URL
4. Open the URL in browser - should show colored square with initial

### Test in UI
1. Navigate to People page
2. Check that all users have visible avatars
3. New users without photos should show colorful initials
4. Existing users with photos should show their uploaded images

## Customization

### Change Colors
Edit the color array in the migration file:
```sql
-- In 006_add_default_avatar_generation.sql
colors TEXT[] := ARRAY[
    'YOUR_COLOR_1',
    'YOUR_COLOR_2',
    -- Add more colors
];
```

### Change Avatar Style
Switch to DiceBear for more avatar styles:
```sql
-- Replace generate_default_avatar function
avatar_url := 'https://api.dicebear.com/7.x/initials/svg?seed=' || 
              username || 
              '&backgroundColor=' || bg_color;
```

### Change Avatar Size
Modify the size parameter:
```sql
-- In generate_default_avatar function
'&size=400' -- Change from 200 to 400
```

## Alternative Services

### DiceBear API
- Multiple avatar styles (initials, avataaars, bottts, etc.)
- SVG format (scalable)
- More customization options
- https://www.dicebear.com/

### Gravatar
- Based on email hash
- Widely used
- User can update globally
- https://gravatar.com/

### Boring Avatars
- React-based
- Requires self-hosting or client-side generation
- https://boringavatars.com/

## Troubleshooting

### Avatar Not Showing
1. Check if avatar_url is populated in database
2. Verify URL is accessible (open in browser)
3. Check browser console for CORS errors
4. Ensure Avatar component is receiving src prop

### Random Colors Not Random
- PostgreSQL's `random()` is seeded per session
- For true randomness, consider using timestamp-based seed

### Migration Fails
1. Check if functions already exist: `DROP FUNCTION IF EXISTS`
2. Verify PostgreSQL version supports used features
3. Check permissions on auth.users table

## Performance

- **No Storage Cost**: Images served from UI Avatars CDN
- **No Database Storage**: Only URL string stored (~100 bytes)
- **Fast Loading**: CDN-delivered, cached images
- **No Processing**: No server-side image generation

## Security

- **External Service**: Relies on third-party availability
- **No PII**: Only first initial sent to UI Avatars
- **HTTPS**: All requests over secure connection
- **No Auth**: Public API, no credentials required

## Future Enhancements

1. **Custom Upload**: Allow users to replace default avatar
2. **Profile Completion**: Track users with default vs custom avatars
3. **Multiple Initials**: Show first + last name initials
4. **Gradient Backgrounds**: Use CSS gradients instead of solid colors
5. **Self-Hosted**: Generate avatars server-side with Canvas API
6. **Avatar Picker**: Let users choose their color on signup

## Resources

- UI Avatars Documentation: https://ui-avatars.com/
- DiceBear Documentation: https://www.dicebear.com/
- Supabase Triggers: https://supabase.com/docs/guides/database/postgres/triggers
- PostgreSQL Random: https://www.postgresql.org/docs/current/functions-math.html
