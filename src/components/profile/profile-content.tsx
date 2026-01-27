"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post/PostCard";
import type { Post } from "@/types";
import { ProfileService } from "@/server/services/profile.service";
import type { ProfileUser } from "@/app/api/profile/route";

type Tab = "posts" | "media" | "likes";

export function ProfileContent() {
    const [activeTab, setActiveTab] = useState<Tab>("posts");
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const result = await ProfileService.getCurrentUserProfile();
                if (result.success && result.data) {
                    setProfile(result.data);
                }
            } catch (err) {
                console.error("Failed to load profile:", err);
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
                // Simulating tab-specific fetching
                const response = await fetch("/api/profile/posts", {
                    method: "GET",
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
    }, [activeTab]);

    const renderSkeletons = () => (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-4xl border border-slate-100 p-8 space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-20 w-full rounded-2xl" />
                    <div className="flex gap-8">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden mb-12">
            {/* Cover Image */}
            <div className="h-64 w-full bg-slate-200 relative">
                <img
                    src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000"
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                {/* Avatar */}
                <div className="absolute -bottom-16 left-8">
                    <div className="p-1 bg-white rounded-full">
                        <Avatar
                            src={profile?.avatar_url || undefined}
                            alt={profile?.username || "User"}
                            className="w-32 h-32 border-4 border-white"
                            fallback={profile?.username?.charAt(0).toUpperCase()}
                        />
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-8 pb-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                            {profile?.full_name || profile?.username || "Loading..."}
                        </h1>
                        <p className="text-slate-400 font-medium tracking-tight">@{profile?.username}</p>
                    </div>
                    <button className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-[15px] hover:bg-slate-50 transition-all">
                        Edit Profile
                    </button>
                </div>

                {/* Bio */}
                <p className="text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl">
                    {profile?.bio || "Digital Product Designer & Developer. Creating minimal and functional interfaces. 🎨 ✨"}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        San Francisco, CA
                    </div>
                    <a href="#" className="flex items-center gap-1.5 text-primary font-bold text-sm hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        johndoe.design
                    </a>
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        Joined March 2021
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mb-8 border-b border-slate-50 pb-8">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{profile?.following_count || 542}</span>
                        <span className="text-slate-400 font-medium text-[15px]">Following</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{profile?.followers_count || "12.5k"}</span>
                        <span className="text-slate-400 font-medium text-[15px]">Followers</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex -mx-8 px-8 border-b border-slate-100">
                    {(["posts", "media", "likes"] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "py-4 px-8 text-[15px] font-bold capitalize transition-all relative",
                                activeTab === tab ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="pt-8 -mx-4 px-4 min-h-[400px]">
                    {postsLoading ? (
                        renderSkeletons()
                    ) : posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    className="bg-white rounded-4xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No {activeTab} yet</h3>
                            <p className="text-slate-400 font-medium max-w-[240px]">
                                When you share {activeTab}, they'll show up here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
