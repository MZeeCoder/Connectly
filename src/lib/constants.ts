import { Sign } from "crypto";

export const APP_NAME = "Connectly";
export const APP_DESCRIPTION = "Connect with people around the world";

// API Routes
export const API_ROUTES = {
    AUTH: {
        SIGN_IN: "/api/auth/signin",
        SIGN_UP: "/api/auth/signup",
        LOGOUT: "/api/auth/logout",
        ME: "/api/auth/me",
    },
    POSTS: {
        LIST: "/api/posts",
        CREATE: "/api/posts",
        GET: (id: string) => `/api/posts/${id}`,
        UPDATE: (id: string) => `/api/posts/${id}`,
        DELETE: (id: string) => `/api/posts/${id}`,
        LIKE: (id: string) => `/api/posts/${id}/like`,
    },
    USERS: {
        GET: (id: string) => `/api/users/${id}`,
        UPDATE: (id: string) => `/api/users/${id}`,
    },
    MESSAGES: {
        LIST: "/api/messages",
        SEND: "/api/messages",
        CONVERSATION: (userId: string) => `/api/messages/${userId}`,
    },
    PEOPLES: {
        LIST: "/api/peoples",
    },
} as const;

// App Routes
export const APP_ROUTES = {
    HOME: "/",
    SIGN_IN: "/login",
    SIGN_UP: "/signup",
    DASHBOARD: "/feed",
    PROFILE: "/profile",
    MESSAGES: "/messages",
    PEOPLES: "/peoples",
    EXPLORE: "/explore",
    NOTIFICATIONS: "/notifications",
    SETTINGS: "/settings",
    PASSWORD_RESET: "/reset-password",
    FORGOT_PASSWORD: "/forgot-password",
    VERIFY_ACCOUNT: "/verify-account",
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

// Validation
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const POST_MAX_LENGTH = 5000;
export const COMMENT_MAX_LENGTH = 1000;
export const MESSAGE_MAX_LENGTH = 2000;

// Environment Configuration
// Automatically uses localhost:3000 in development, production URL in production
export const SITE_URL =
    process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL
        ? process.env.NEXT_PUBLIC_SITE_URL
        : "http://localhost:3000";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
