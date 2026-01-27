/**
 * Avatar generation utilities
 * Generates default avatar URLs with user initials and random background colors
 */

// Predefined background colors for avatars
const AVATAR_COLORS = [
    'FF6B6B', // Red
    '4ECDC4', // Teal
    '45B7D1', // Blue
    'FFA07A', // Light Salmon
    '98D8C8', // Mint
    'F7DC6F', // Yellow
    'BB8FCE', // Purple
    'F8B739', // Orange
    '52C7B8', // Turquoise
    'FF7979', // Pink Red
    '6C5CE7', // Purple Blue
    'A29BFE', // Light Purple
    'FD79A8', // Pink
    'FDCB6E', // Golden
    '74B9FF', // Sky Blue
];

/**
 * Get a random color from the predefined palette
 */
function getRandomColor(): string {
    return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Get the first letter of a name or username
 * @param name - The user's name or username
 * @returns The first letter in uppercase
 */
function getInitial(name: string): string {
    if (!name || name.trim().length === 0) {
        return 'U'; // Default to 'U' for User
    }
    return name.trim().charAt(0).toUpperCase();
}

/**
 * Generate a default avatar URL using UI Avatars API
 * @param name - The user's name or username
 * @param backgroundColor - Optional background color (hex without #)
 * @returns Avatar URL
 */
export function generateDefaultAvatar(
    name: string,
    backgroundColor?: string
): string {
    const initial = getInitial(name);
    const bgColor = backgroundColor || getRandomColor();

    // Using UI Avatars API - free service for generating avatars
    // https://ui-avatars.com/
    const params = new URLSearchParams({
        name: initial,
        background: bgColor,
        color: 'ffffff', // White text
        size: '200',
        bold: 'true',
        format: 'png',
    });

    return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Generate a default avatar URL using DiceBear API (alternative)
 * @param seed - Unique identifier (email or username) for consistent avatar generation
 * @returns Avatar URL
 */
export function generateDiceBearAvatar(seed: string): string {
    // Using DiceBear API - free service with various avatar styles
    // https://www.dicebear.com/
    const backgroundColor = getRandomColor();

    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}`;
}

/**
 * Check if a URL is a default/generated avatar
 * @param avatarUrl - The avatar URL to check
 * @returns True if it's a default avatar
 */
export function isDefaultAvatar(avatarUrl: string | null | undefined): boolean {
    if (!avatarUrl) return true;
    return avatarUrl.includes('ui-avatars.com') || avatarUrl.includes('dicebear.com');
}
