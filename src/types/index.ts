// User Types
export interface User {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    created_at: string;
    updated_at: string;
}

// Follow Types
export interface FollowRelationship {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface FollowStatus {
    isFollowing: boolean;
    followId?: string;
}

export interface FollowStatusMap {
    [userId: string]: boolean;
}

export interface FollowerWithUser {
    id: string;
    created_at: string;
    follower: User;
}

export interface FollowingWithUser {
    id: string;
    created_at: string;
    following: User;
}

// Post Types
export interface Post {
    id: string;
    user_id: string;
    content: string;
    image_url?: string;
    video_url?: string;
    image_urls?: string[];
    video_urls?: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
    user?: User;
}

// Media Upload Types
export interface MediaUploadResult {
    url: string;
    path: string;
    type: 'image' | 'video';
}

export interface CreatePostData {
    content: string;
    image_urls?: string[];
    video_urls?: string[];
}

export interface UpdatePostData {
    content?: string;
    image_urls?: string[];
    video_urls?: string[];
}

// Comment Types
export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user?: User;
}

// Message Types
export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: User;
    receiver?: User;
}

// Conversation Types
export interface Conversation {
    id: string;
    user1_id: string;
    user2_id: string;
    last_message?: Message;
    created_at: string;
    updated_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
    success: boolean;
}

// Auth Types
export interface AuthUser {
    id: string;
    email: string;
    username: string;
    avatar_url?: string;
}

export interface SiginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
    username: string;
}
