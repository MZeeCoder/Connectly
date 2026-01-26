"use client";

import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { ProfileService } from "@/server/services/profile.service";
import type { ProfileUser } from "@/app/api/profile/route";
import LogoutButton from "@/components/auth/LogoutButton";

interface ContentPanelProps {
    section: "feed" | "messages" | "profile" | null;
}

export function ContentPanel({ section }: ContentPanelProps) {
    if (!section) return null;

    return (
        <aside
            className={cn(
                "fixed left-14 top-14 h-[calc(100vh-3.5rem)] w-72 bg-[#131314] rounded-tl-xl border-r border-[#3A3B3C] hidden lg:block overflow-y-auto"
            )}
        >
            {section === "feed" && <FeedPanel />}
            {section === "messages" && <MessagesPanel />}
            {section === "profile" && <ProfilePanel />}
        </aside>
    );
}

function FeedPanel() {
    return (
        <div className="p-4 rounded-tl-xl ">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white mb-2">Feed</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full bg-[#131314] border border-[#3A3B3C] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    />
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
                        className="absolute right-3 top-2.5 text-gray-400"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Categories
                </div>
                {["All Posts", "Trending", "Following", "Saved"].map((item) => (
                    <button
                        key={item}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#2A2B2C] rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-xs font-semibold">
                                {item.charAt(0)}
                            </span>
                        </div>
                        <span>{item}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function MessagesPanel() {
    const conversations = [
        { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", time: "2:30 PM", unread: 2 },
        { id: 2, name: "Jane Smith", lastMessage: "Thanks for the help!", time: "1:15 PM", unread: 0 },
        { id: 3, name: "Mike Johnson", lastMessage: "See you tomorrow", time: "Yesterday", unread: 0 },
        { id: 4, name: "Sarah Wilson", lastMessage: "That sounds great!", time: "Yesterday", unread: 1 },
        { id: 5, name: "Team Chat", lastMessage: "Meeting at 3 PM", time: "Monday", unread: 5 },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#3A3B3C]">
                <h2 className="text-lg font-semibold text-white mb-3">Messages</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full bg-[#2A2B2C] border border-[#3A3B3C] rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    />
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
                        className="absolute right-3 top-2.5 text-gray-400"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#2A2B2C] transition-colors border-b border-[#3A3B3C]"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                                {conv.name.split(" ").map(n => n[0]).join("")}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-white truncate">
                                    {conv.name}
                                </span>
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                    {conv.time}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 truncate">
                                    {conv.lastMessage}
                                </p>
                                {conv.unread > 0 && (
                                    <span className="ml-2 flex-shrink-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {conv.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ProfilePanel() {
    const [profile, setProfile] = useState<ProfileUser | null>(null);
    const [postsCount, setPostsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            const result = await ProfileService.getCurrentUserProfile();
            if (result.success && result.data) {
                setProfile(result.data);
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    useEffect(() => {
        async function fetchPostsCount() {
            try {
                const response = await fetch("/api/profile/posts");
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setPostsCount(result.data.length);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch posts count:", err);
            }
        }
        fetchPostsCount();
    }, []);

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
                <div className="flex flex-col items-center">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name || profile.username}
                            className="w-20 h-20 rounded-full object-cover mb-3"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-3">
                            <span className="text-white text-2xl font-semibold">
                                {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
                            </span>
                        </div>
                    )}
                    <h3 className="text-white font-medium">
                        {profile?.full_name || profile?.username || "User"}
                    </h3>
                    <p className="text-sm text-gray-400">@{profile?.username || "username"}</p>
                    {profile?.bio && (
                        <p className="text-xs text-gray-500 mt-2 text-center line-clamp-2">
                            {profile.bio}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Quick Actions
                </div>
                {[
                    { label: "Edit Profile", icon: "✏️" },
                    { label: "View Activity", icon: "📊" },
                    { label: "Saved Posts", icon: "🔖" },
                    { label: "Settings", icon: "⚙️" },
                ].map((item) => (
                    <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-[#2A2B2C] rounded-lg transition-colors"
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6 p-4 bg-[#2A2B2C] rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Account Stats</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Posts</span>
                        <span className="text-white font-medium">{postsCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Followers</span>
                        <span className="text-white font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Following</span>
                        <span className="text-white font-medium">0</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#3A3B3C]">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
