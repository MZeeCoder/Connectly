/**
 * Tests and examples for avatar generation utilities
 */

import { generateDefaultAvatar, generateDiceBearAvatar, isDefaultAvatar } from './avatar';

// Example 1: Generate default avatar for a user
console.log('Example 1: Default avatar for "John"');
console.log(generateDefaultAvatar('John'));
// Output: https://ui-avatars.com/api/?name=J&background=<random>&color=ffffff&size=200&bold=true&format=png

// Example 2: Generate avatar with specific background color
console.log('\nExample 2: Avatar with specific color');
console.log(generateDefaultAvatar('Sarah', 'FF6B6B'));
// Output: https://ui-avatars.com/api/?name=S&background=FF6B6B&color=ffffff&size=200&bold=true&format=png

// Example 3: Generate DiceBear avatar
console.log('\nExample 3: DiceBear avatar');
console.log(generateDiceBearAvatar('john@example.com'));
// Output: https://api.dicebear.com/7.x/initials/svg?seed=john@example.com&backgroundColor=<random>

// Example 4: Check if avatar is default
console.log('\nExample 4: Check if avatar is default');
console.log(isDefaultAvatar('https://ui-avatars.com/api/?name=J&background=FF6B6B'));
// Output: true
console.log(isDefaultAvatar('https://example.com/my-photo.jpg'));
// Output: false
console.log(isDefaultAvatar(null));
// Output: true

// Example 5: Generate avatars for multiple users
console.log('\nExample 5: Multiple users');
const users = ['Alice', 'Bob', 'Charlie', 'Diana'];
users.forEach(name => {
    console.log(`${name}: ${generateDefaultAvatar(name)}`);
});

// Example 6: Handle edge cases
console.log('\nExample 6: Edge cases');
console.log('Empty string:', generateDefaultAvatar(''));
// Output: Uses 'U' as default
console.log('Spaces only:', generateDefaultAvatar('   '));
// Output: Uses 'U' as default
console.log('Special chars:', generateDefaultAvatar('@#$%'));
// Output: Uses '@' as initial

// Example Usage in Component
console.log('\n=== Component Usage Example ===');
console.log(`
// In your React component:
import { generateDefaultAvatar, isDefaultAvatar } from '@/utils/avatar';

function UserProfile({ user }) {
  // Show upload prompt if using default avatar
  const showUploadPrompt = isDefaultAvatar(user.avatar_url);
  
  return (
    <div>
      <img src={user.avatar_url} alt={user.username} />
      {showUploadPrompt && (
        <button>Upload your photo</button>
      )}
    </div>
  );
}

// When creating a user without avatar:
const newUserData = {
  username: 'johndoe',
  email: 'john@example.com',
  avatar_url: generateDefaultAvatar('johndoe'), // Generate on client if needed
};
`);

export { };
