"use client";

import * as React from "react";
import { PostCard, CreatePostModal } from "@/components/post";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import type { Post, CreatePostData, UpdatePostData, User } from "@/types";

interface FeedClientProps {
    initialPosts: Post[];
}

/**
 * Client component for the Feed page with interactive functionality
 */
export function FeedClient({ initialPosts }: FeedClientProps) {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [posts, setPosts] = React.useState<Post[]>(initialPosts);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState<Post | null>(null);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    // Convert auth user to our User type
    const currentUser: User | null = user
        ? {
            id: user.id,
            email: user.email || "",
            username: user.user_metadata?.username || "",
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at || "",
            updated_at: "",
        }
        : null;

    // Refresh posts from server
    const refreshPosts = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch("/api/posts");
            const result = await response.json();
            if (result.success) {
                setPosts(result.data);
            }
        } catch (error) {
            console.error("Failed to refresh posts:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Create new post
    const handleCreatePost = async (data: CreatePostData | UpdatePostData) => {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to create post");
        }

        // Add new post to the top of the list
        setPosts((prev) => [result.data, ...prev]);
    };

    // Update existing post
    const handleUpdatePost = async (data: CreatePostData | UpdatePostData) => {
        if (!editingPost) return;

        const response = await fetch(`/api/posts/${editingPost.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Failed to update post");
        }

        // Update post in the list
        setPosts((prev) =>
            prev.map((post) => (post.id === editingPost.id ? result.data : post))
        );
        setEditingPost(null);
    };

    // Delete post
    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) {
            return;
        }

        const response = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.error || "Failed to delete post");
            return;
        }

        // Remove post from list
        setPosts((prev) => prev.filter((post) => post.id !== postId));
    };

    // Edit post
    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        setIsCreateModalOpen(true);
    };

    // Like post
    const handleLikePost = async (postId: string) => {
        if (!isAuthenticated) {
            alert("Please sign in to like posts");
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: "POST",
            });

            if (response.ok) {
                // Refresh to get updated like count
                refreshPosts();
            }
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    // Comment on post
    const handleCommentPost = (postId: string) => {
        // TODO: Implement comments functionality
        console.log("Comment on post:", postId);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingPost(null);
    };

    return (
        <div className="space-y-6">
            {/* Create Post Button */}
            {isAuthenticated && (
                <div className="rounded-lg border border-border bg-card p-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex w-full items-center gap-3 rounded-full border border-border bg-muted px-4 py-3 text-left text-muted-foreground transition-colors hover:bg-muted/80"
                    >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
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
                                className="text-primary"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </div>
                        <span>What&apos;s on your mind?</span>
                    </button>

                    <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
                                className="text-green-500"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Photo
                        </button>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
                                className="text-blue-500"
                            >
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            Video
                        </button>
                    </div>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshPosts}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <>
                            <Spinner size="sm" />
                            Refreshing...
                        </>
                    ) : (
                        <>
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
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            Refresh
                        </>
                    )}
                </Button>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        onLike={handleLikePost}
                        onComment={handleCommentPost}
                    />
                ))}

                {posts.length === 0 && (
                    <div className="rounded-lg border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                            No posts yet
                        </h3>
                        <p className="text-muted-foreground">
                            {isAuthenticated
                                ? "Be the first to share something!"
                                : "Sign in to see and create posts."}
                        </p>
                        {isAuthenticated && (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-4"
                            >
                                Create Post
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
                editingPost={editingPost}
            />
        </div>
    );
}
