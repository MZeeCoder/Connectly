"use client";

import { useEffect, useState } from "react";
import { PeopleService } from "@/server/services/people.service";
import { ProfileService } from "@/server/services/profile.service";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { FollowStatusMap } from "@/types";
import { Spinner } from "../ui/Spinner";

import { PeopleSkeleton } from "./PeopleSkeleton";

export default function PeopleForm() {
    const [users, setUsers] = useState<PeopleUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followStatus, setFollowStatus] = useState<FollowStatusMap>({});
    const [followerStatus, setFollowerStatus] = useState<FollowStatusMap>({});
    const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});
    const [filter, setFilter] = useState<'following' | 'followers' | 'all'>('following');
    const [searchQuery, setSearchQuery] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPeoples() {
            try {
                setLoading(true);

                // Get current user profile first
                const profileResult = await ProfileService.getCurrentUserProfile();
                let myId = "";
                if (profileResult.success && profileResult.data) {
                    myId = profileResult.data.id;
                    setCurrentUserId(myId);
                }

                const result = await PeopleService.getAllPeoples();

                if (result.success && result.data) {
                    setUsers(result.data);

                    // Fetch follow status (people I am following)
                    const userIds = result.data.map(user => user.id);
                    if (userIds.length > 0) {
                        const statusResult = await PeopleService.getFollowStatusMap(userIds);
                        if (statusResult.success && statusResult.data) {
                            setFollowStatus(statusResult.data);
                        }
                    }

                    // Fetch followers (people following me)
                    if (myId) {
                        const followersResult = await PeopleService.getFollowers(myId);
                        if (followersResult.success && followersResult.data) {
                            const fStatus: FollowStatusMap = {};
                            followersResult.data.forEach((item: any) => {
                                if (item.follower && item.follower.id) {
                                    fStatus[item.follower.id] = true;
                                }
                            });
                            setFollowerStatus(fStatus);
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

    const followingCount = Object.values(followStatus).filter(Boolean).length;
    const followersCount = Object.values(followerStatus).filter(Boolean).length;

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedHighlight})`, "gi");
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <span key={i} style={{ color: "#FF9632" }}>{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    const filteredUsers = users.filter((user) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            user.full_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );

        const isFollowing = followStatus[user.id] || false;
        const isFollower = followerStatus[user.id] || false;

        let matchesFilter = true;
        if (filter === 'following') matchesFilter = isFollowing;
        else if (filter === 'followers') matchesFilter = isFollower;

        return matchesSearch && matchesFilter;
    });

    const renderListArea = () => {
        if (loading) return <PeopleSkeleton />;

        if (error) {
            return (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">Error: {error}</p>
                </div>
            );
        }

        if (users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground mb-3 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <h3 className="text-base font-semibold text-foreground mb-1">No Users Found</h3>
                    <p className="text-xs text-muted-foreground">Invite people to build your network!</p>
                </div>
            );
        }

        if (filteredUsers.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-primary opacity-50">
                        {filter === 'following' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
                        ) : filter === 'followers' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M17 11l2 2 4-4" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                        {filter === 'following' ? "You aren't following anyone" : filter === 'followers' ? "No followers yet" : "No users found"}
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-[180px]">
                        {filter === 'following' ? "Connect with others to see their updates here." : filter === 'followers' ? "Start sharing your thoughts to gain followers!" : "Try adjusting your filters or search."}
                    </p>
                    <button onClick={() => setFilter('all')} className="mt-4 text-[11px] font-bold text-primary hover:underline uppercase tracking-tighter">Discover People</button>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-5">
                {filteredUsers.slice(0, 20).map((user) => {
                    const isFollowing = followStatus[user.id] || false;
                    const isLoading = followLoading[user.id] || false;
                    return (
                        <div key={user.id} className="flex items-center gap-3 justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="relative shrink-0">
                                    <img src={user.avatar_url || "/avatar.png"} alt={user?.full_name || user?.username || "User"} className="w-10 h-10 rounded-full object-cover border border-border" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-sidebar rounded-full"></div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm text-foreground truncate leading-tight">
                                        {highlightText(user?.full_name || user?.username || "", searchQuery)}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        @{highlightText(user?.username || user?.email?.split('@')[0] || "", searchQuery)}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => handleFollowToggle(user.id)} disabled={isLoading} className={`w-1/3 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${isFollowing ? 'bg-accent text-foreground hover:bg-accent/70 border border-border' : 'bg-primary text-primary-foreground hover:bg-primary/90'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2"><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>Loading...</span></div>
                                ) : isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <aside className="w-80 xl:w-96 hidden lg:flex flex-col bg-sidebar border-l border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-hidden">
            {/* Header Section (Fixed) */}
            <div className="p-4 bg-sidebar z-20 border-b border-border shadow-sm flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Connectly..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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

                {/* Filters */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2 ">
                        <button
                            onClick={() => setFilter('following')}
                            className={`w-1/2 px-2 py-2 cursor-pointer rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${filter === 'following'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-white text-primary border border-primary hover:bg-primary/5'
                                }`}
                        >
                            Following
                        </button>
                        <button
                            onClick={() => setFilter('followers')}
                            className={`w-1/2 px-2 py-2 cursor-pointer rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${filter === 'followers'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-white text-primary border border-primary hover:bg-primary/5'
                                }`}
                        >
                            Followers
                        </button>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        {/* Count */}
                        <p className="text-sm text-muted-foreground">
                            {filter === "following" && (
                                <>
                                    <span className="font-medium text-foreground">
                                        {followingCount}
                                    </span>{" "}
                                    Following
                                </>
                            )}

                            {filter === "followers" && (
                                <>
                                    <span className="font-medium text-foreground">
                                        {followersCount}
                                    </span>{" "}
                                    Followers
                                </>
                            )}
                        </p>

                        {/* See all */}
                        <button
                            onClick={() => setFilter("all")}
                            className={`text-sm font-medium transition-colors underline underline-offset-4
      ${filter === "all"
                                    ? "text-primary decoration-primary"
                                    : "text-muted-foreground hover:text-primary hover:decoration-primary"
                                }`}
                        >
                            {`See all (999+)`}
                        </button>
                    </div>

                </div>
            </div>

            {/* Scrollable List Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {renderListArea()}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: transparent;
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: hsl(var(--muted-foreground) / 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--primary)) !important;
                }
            ` }} />
        </aside>
    );
}