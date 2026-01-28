"use client";

import { useEffect, useState } from "react";
import { PeopleService } from "@/server/services/people.service";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { FollowStatusMap } from "@/types";
import { Spinner } from "../ui/Spinner";

import { PeopleSkeleton } from "./PeopleSkeleton";

export default function PeopleForm() {
    const [users, setUsers] = useState<PeopleUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followStatus, setFollowStatus] = useState<FollowStatusMap>({});
    const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        async function fetchPeoples() {
            try {
                setLoading(true);
                const result = await PeopleService.getAllPeoples();

                if (result.success && result.data) {
                    setUsers(result.data);

                    // Fetch follow status for all users
                    const userIds = result.data.map(user => user.id);
                    if (userIds.length > 0) {
                        const statusResult = await PeopleService.getFollowStatusMap(userIds);
                        if (statusResult.success && statusResult.data) {
                            setFollowStatus(statusResult.data);
                        }
                    }
                } else {
                    setError(result.error || "Failed to load users");
                }
            } catch (err) {
                setError("An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchPeoples();
    }, []);

    const handleFollowToggle = async (userId: string) => {
        try {
            setFollowLoading(prev => ({ ...prev, [userId]: true }));

            const isCurrentlyFollowing = followStatus[userId];

            let result;
            if (isCurrentlyFollowing) {
                result = await PeopleService.unfollowUser(userId);
            } else {
                result = await PeopleService.followUser(userId);
            }

            if (result.success) {
                // Update follow status
                setFollowStatus(prev => ({
                    ...prev,
                    [userId]: !isCurrentlyFollowing
                }));
            } else {
                setError(result.error || "Failed to update follow status");
                setTimeout(() => setError(null), 3000);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setTimeout(() => setError(null), 3000);
        } finally {
            setFollowLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const renderContent = () => {
        if (loading) {
            return <PeopleSkeleton />;
        }

        if (error) {
            return (
                <div className="p-4">
                    <p className="text-destructive text-sm font-medium">Error: {error}</p>
                </div>
            );
        }

        // Empty state when no users found
        if (users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
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
                        className="text-muted-foreground mb-3 opacity-50"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                        No Users Found
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Invite people to build your network!
                    </p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-foreground px-1">Who to follow</h2>
                <div className="flex flex-col gap-5">
                    {users.slice(0, 3).map((user) => {
                        const isFollowing = followStatus[user.id] || false;
                        const isLoading = followLoading[user.id] || false;

                        return (
                            <div key={user.id} className="flex items-center gap-3 justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="relative shrink-0">
                                        <img
                                            src={user.avatar_url || "/avatar.png"}
                                            alt={user?.full_name || user?.username || "User"}
                                            className="w-10 h-10 rounded-full object-cover border border-border"
                                        />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-sidebar rounded-full"></div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm text-foreground truncate leading-tight">
                                            {user?.full_name || user?.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            @{user?.username || user?.email?.split('@')[0]}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleFollowToggle(user.id)}
                                    disabled={isLoading}
                                    className={`
                                        text-sm font-bold transition-all duration-200
                                        ${isFollowing
                                            ? 'text-muted-foreground hover:text-foreground'
                                            : 'text-primary hover:text-primary/80'
                                        }
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        shrink-0
                                    `}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : isFollowing ? (
                                        'Following'
                                    ) : (
                                        'Follow'
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Trending */}
                <div className="flex flex-col gap-4 mt-6">
                    <h2 className="text-xl font-bold text-foreground px-1">Trending</h2>
                    <div className="flex flex-col gap-3">
                        {[
                            { topic: "Tech", hashtag: "#FigmaAI", posts: "12.5k" },
                            { topic: "Tech", hashtag: "#WebDesign", posts: "12.5k" },
                            { topic: "Tech", hashtag: "#ReactJS", posts: "12.5k" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-accent/40 hover:bg-accent/60 p-4 rounded-2xl transition-colors cursor-pointer">
                                <p className="text-xs text-muted-foreground mb-1">Trending in {item.topic}</p>
                                <p className="text-base font-bold text-foreground mb-1">{item.hashtag}</p>
                                <p className="text-xs text-muted-foreground">{item.posts} posts</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <aside className="w-80 xl:w-96 hidden lg:flex flex-col gap-6 p-4 bg-sidebar border-l border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
            {/* Search Bar */}
            <div className="sticky top-0 bg-sidebar z-20 pb-4 -mx-4 px-4 pt-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Connectly..."
                        className="w-full bg-accent border border-border rounded-full px-11 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
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
                        className="absolute left-4 top-3 text-muted-foreground"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>

            {renderContent()}
        </aside>
    );
}