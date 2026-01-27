"use client";

import { useEffect, useState } from "react";
import { ProfileService } from "@/server/services/profile.service";
import type { ProfileUser } from "@/app/api/profile/route";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import LogoutButton from "@/components/auth/LogoutButton";
import { Spinner } from "@/components/ui/Spinner";
import { PostCard } from "@/components/post/PostCard";
import type { Post } from "@/types";

export default function ProfileClient() {
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const result = await ProfileService.getCurrentUserProfile();

                if (result.success && result.data) {
                    setProfile(result.data);
                } else {
                    setError(result.error || "Failed to load profile");
                }
            } catch (err) {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    useEffect(() => {
        async function fetchPosts() {
            try {
                setPostsLoading(true);
                const response = await fetch("/api/profile/posts", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setPosts(result.data);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            } finally {
                setPostsLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-muted-foreground">Profile not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl">
            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <div className="flex items-start gap-6">
                    <Avatar
                        src={profile.avatar_url || undefined}
                        alt={profile.full_name || profile.username}
                        size="lg"
                    />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground">
                            {profile.full_name || profile.username}
                        </h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                        {profile.bio && (
                            <p className="mt-2 text-foreground">{profile.bio}</p>
                        )}
                        <div className="flex gap-6 mt-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {posts.length}
                                </p>
                                <p className="text-sm text-muted-foreground">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.followers_count}
                                </p>
                                <p className="text-sm text-muted-foreground">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.following_count}
                                </p>
                                <p className="text-sm text-muted-foreground">Following</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Posts Section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">My Posts</h2>

                {postsLoading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <Spinner />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-8 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mx-auto mb-4 text-muted-foreground"
                        >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Posts Yet</h3>
                        <p className="text-muted-foreground">
                            You haven't created any posts yet. Start sharing your thoughts!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={profile ? {
                                    id: profile.id,
                                    username: profile.username,
                                    full_name: profile.full_name ?? undefined,
                                    email: profile.email,
                                    avatar_url: profile.avatar_url ?? undefined,
                                    created_at: profile.created_at,
                                    updated_at: profile.created_at,
                                } : null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
