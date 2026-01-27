"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Post, User } from "@/types";

export interface PostCardProps {
    post: Post;
    currentUser?: User | null;
    onEdit?: (post: Post) => void;
    onDelete?: (postId: string) => void;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    className?: string;
}

/**
 * PostCard component - displays a single post with text, images, and videos
 */
export function PostCard({
    post,
    currentUser,
    onEdit,
    onDelete,
    onLike,
    onComment,
    className,
}: PostCardProps) {
    const [showMenu, setShowMenu] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    const isOwner = currentUser?.id === post.user_id;

    // Get all images (support both old single image_url and new image_urls array)
    const images = React.useMemo(() => {
        const urls: string[] = [];
        if (post.image_urls && post.image_urls.length > 0) {
            urls.push(...post.image_urls);
        } else if (post.image_url) {
            urls.push(post.image_url);
        }
        return urls;
    }, [post.image_urls, post.image_url]);

    // Get all videos (support both old single video_url and new video_urls array)
    const videos = React.useMemo(() => {
        const urls: string[] = [];
        if (post.video_urls && post.video_urls.length > 0) {
            urls.push(...post.video_urls);
        } else if (post.video_url) {
            urls.push(post.video_url);
        }
        return urls;
    }, [post.video_urls, post.video_url]);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async () => {
        if (!onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(post.id);
        } finally {
            setIsDeleting(false);
            setShowMenu(false);
        }
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <article
            className={cn(
                "bg-white border border-slate-100 rounded-4xl shadow-sm p-8 transition-shadow hover:shadow-md",
                className
            )}
        >
            {/* Header - User Info & Menu */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={post.user?.avatar_url}
                        alt={post.user?.username}
                        fallback={post.user?.username?.charAt(0).toUpperCase()}
                        className="w-12 h-12"
                    />
                    <div>
                        <p className="font-bold text-slate-900 border-b border-transparent hover:border-slate-900 transition-all cursor-pointer">
                            {post.user?.full_name || post.user?.username || "Unknown User"}
                            <span className="ml-1 text-sm font-medium text-slate-400">
                                @{post.user?.username || "username"} · {formatRelativeTime(post.created_at)}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Menu Button (only for post owner) */}
                {isOwner && (onEdit || onDelete) && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            aria-label="Post options"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(post);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <p className="mb-6 whitespace-pre-wrap text-slate-700 leading-relaxed">{post.content}</p>

            {/* Images */}
            {images.length > 0 && (
                <div className="relative mb-6">
                    <div className="overflow-hidden rounded-3xl border border-slate-100">
                        <img
                            src={images[currentImageIndex]}
                            alt={`Post image ${currentImageIndex + 1}`}
                            className="w-full object-cover max-h-[500px]"
                        />
                    </div>

                    {/* Image Navigation (if multiple images) */}
                    {images.length > 1 && (
                        <>
                            {/* Navigation Arrows */}
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-800 shadow-lg hover:scale-110 active:scale-95 transition-all"
                                aria-label="Previous image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-800 shadow-lg hover:scale-110 active:scale-95 transition-all"
                                aria-label="Next image"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>

                            {/* Image Indicators */}
                            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 p-1.5 bg-black/10 backdrop-blur-md rounded-full">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "h-2 w-2 rounded-full transition-all duration-300",
                                            index === currentImageIndex
                                                ? "bg-white w-4"
                                                : "bg-white/50 hover:bg-white/80"
                                        )}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
                <div className="mb-6 space-y-4">
                    {videos.map((videoUrl, index) => (
                        <div key={index} className="overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
                            <video
                                src={videoUrl}
                                controls
                                className="w-full max-h-[500px] bg-black"
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => onComment?.(post.id)}
                        className="flex items-center gap-2.5 group transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-blue-500">{post.comments_count || 0}</span>
                    </button>

                    <button className="flex items-center gap-2.5 group transition-colors">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-500 transition-all">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m17 2 4 4-4 4" />
                                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                                <path d="m7 22-4-4 4-4" />
                                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-green-500">Retweet</span>
                    </button>

                    <button
                        onClick={() => onLike?.(post.id)}
                        className="flex items-center gap-2.5 group transition-colors"
                    >
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-rose-500">{post.likes_count || 0}</span>
                    </button>
                </div>

                <button className="flex items-center gap-2.5 group transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-900 transition-all">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" x2="12" y1="2" y2="15" />
                        </svg>
                    </div>
                </button>
            </div>
        </article>
    );
}
