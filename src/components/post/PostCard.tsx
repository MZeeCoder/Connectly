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
                "rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md",
                className
            )}
        >
            {/* Header - User Info & Menu */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={post.user?.avatar_url}
                        alt={post.user?.username}
                        fallback={post.user?.username?.charAt(0).toUpperCase()}
                    />
                    <div>
                        <p className="font-semibold text-foreground">
                            {post.user?.full_name || post.user?.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {formatRelativeTime(post.created_at)}
                        </p>
                    </div>
                </div>

                {/* Menu Button (only for post owner) */}
                {isOwner && (onEdit || onDelete) && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
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
                            <div className="absolute right-0 top-full z-10 mt-1 min-w-[120px] rounded-md border border-border bg-card py-1 shadow-lg">
                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            onEdit(post);
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
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
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted disabled:opacity-50"
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
            <p className="mb-4 whitespace-pre-wrap text-foreground">{post.content}</p>

            {/* Images */}
            {images.length > 0 && (
                <div className="relative mb-4">
                    <div className="overflow-hidden rounded-lg">
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
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-foreground/50 p-2 text-background hover:bg-foreground/70"
                                aria-label="Previous image"
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
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-foreground/50 p-2 text-background hover:bg-foreground/70"
                                aria-label="Next image"
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
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>

                            {/* Image Indicators */}
                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "h-2 w-2 rounded-full transition-colors",
                                            index === currentImageIndex
                                                ? "bg-foreground"
                                                : "bg-foreground/50 hover:bg-foreground/75"
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
                <div className="mb-4 space-y-4">
                    {videos.map((videoUrl, index) => (
                        <div key={index} className="overflow-hidden rounded-lg">
                            <video
                                src={videoUrl}
                                controls
                                className="w-full max-h-[500px]"
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button
                    onClick={() => onLike?.(post.id)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                >
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
                    <span>{post.likes_count || 0}</span>
                </button>

                <button
                    onClick={() => onComment?.(post.id)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                >
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
                    <span>{post.comments_count || 0}</span>
                </button>

                <button className="flex items-center gap-2 hover:text-primary transition-colors">
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
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>Share</span>
                </button>
            </div>
        </article>
    );
}
