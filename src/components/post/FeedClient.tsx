"use client";

import * as React from "react";
import { PostCard, CreatePostModal } from "@/components/post";
import { Avatar } from "@/components/ui/Avatar";
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
        <div className="relative flex h-full w-full flex-col ">
            <div className='flex flex-row gap-4'>
                {/* Fixed Create Post Button - Sticky at top with high z-index */}
                {isAuthenticated && (
                    <div className="bg-white border border-slate-100 rounded-4xl h-32 w-full shadow-sm p-3 mb-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={user?.user_metadata?.avatar_url}
                                alt={user?.user_metadata?.username}
                                fallback={user?.user_metadata?.username?.charAt(0).toUpperCase()}
                                className="w-12 h-12"
                            />
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex-1 text-left px-2 py-2 text-slate-400 text-lg font-medium hover:text-slate-500 transition-colors"
                            >
                                What&apos;s happening?
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="text-primary/80 hover:text-primary transition-colors"
                                    title="Add Image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="text-primary/80 hover:text-primary transition-colors"
                                    title="Add Video"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="text-primary/80 hover:text-primary transition-colors"
                                    title="Add Emoji"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
                                </button>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-primary text-primary-foreground px-8 py-2.5 rounded-2xl text-[15px] font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}
                {/* Refresh Button */}
                <div className="flex justify-center items-center  animate-in fade-in slide-in-from-top-6 duration-500">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshPosts}
                        disabled={isRefreshing}
                        className="h-9 px-4 rounded-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all flex items-center gap-2 group"
                    >
                        {isRefreshing ? (
                            <Spinner size="sm" />
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-transform duration-500 group-hover:rotate-180"
                            >
                                <polyline points="23 4 23 10 17 10" />
                                <polyline points="1 20 1 14 7 14" />
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider">Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="space-y-4 sm:space-y-6">


                    {/* Posts List */}
                    <div className="space-y-6 pb-6">
                        {posts.map((post, index) => (
                            <div
                                key={post.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <PostCard
                                    post={post}
                                    currentUser={currentUser}
                                    onEdit={handleEditPost}
                                    onDelete={handleDeletePost}
                                    onLike={handleLikePost}
                                    onComment={handleCommentPost}
                                />
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="animate-in fade-in zoom-in-95 duration-700 rounded-lg border border-border bg-card p-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-all duration-300 hover:scale-110">
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
                                        className="mt-4 transition-all duration-300 hover:scale-105 active:scale-95"
                                    >
                                        Create Post
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
