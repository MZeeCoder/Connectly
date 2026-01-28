"use client";

import { useEffect, useState } from "react";
import { PeopleService } from "@/server/services/people.service";
import { ProfileService } from "@/server/services/profile.service";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { FollowStatusMap } from "@/types";
import { PeopleSkeleton } from "@/components/people/PeopleSkeleton";

export default function PeoplePage() {
    const [users, setUsers] = useState<PeopleUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followStatus, setFollowStatus] = useState<FollowStatusMap>({});
    const [followerStatus, setFollowerStatus] = useState<FollowStatusMap>({});
    const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'following' | 'followers' | 'all'>('following');
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

    const filteredUsers = users.filter(user => {
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

    const followingCount = Object.values(followStatus).filter(Boolean).length;
    const followersCount = Object.values(followerStatus).filter(Boolean).length;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Discover People</h1>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search people..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-accent border border-border rounded-lg px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
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
                        className="absolute left-4 top-3.5 text-muted-foreground"
                    >
                        <circle cx="11" cy="11" r="8" />
                    </svg>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setFilter('followers')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${filter === 'followers'
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                    >
                        Followers ({followersCount})
                    </button>
                    <button
                        onClick={() => setFilter('following')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${filter === 'following'
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                    >
                        Following ({followingCount})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${filter === 'all'
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                    >
                        See All (999+)
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <PeopleSkeleton />
            ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-4 bg-accent/10 rounded-3xl border-2 border-dashed border-border/50 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 text-primary border border-border/50">
                        {filter === 'following' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
                        ) : filter === 'followers' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M17 11l2 2 4-4" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        )}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                        {filter === 'following' ? "You aren't following anyone yet" : filter === 'followers' ? "No followers yet" : "No users found"}
                    </h3>
                    <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                        {filter === 'following' ? "Connections make your experience better! Follow people to see their latest posts and activities here." : filter === 'followers' ? "Don't worry, keep posting great content and people will start following you soon!" : "We couldn't find anyone matching your current search or filter. Try something else!"}
                    </p>
                    <button
                        onClick={() => { setFilter('all'); setSearchQuery(''); }}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all"
                    >
                        Explore Discoveries
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => {
                        const isFollowing = followStatus[user.id] || false;
                        const isLoading = followLoading[user.id] || false;

                        return (
                            <div
                                key={user.id}
                                className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="relative mb-4">
                                        <img
                                            src={user.avatar_url || "/avatar.png"}
                                            alt={user?.full_name || user?.username || "User"}
                                            className="w-20 h-20 rounded-full object-cover border-2 border-border"
                                        />
                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full"></div>
                                    </div>

                                    {/* User Info */}
                                    <h3 className="font-bold text-base text-foreground mb-1 truncate w-full">
                                        {highlightText(user?.full_name || user?.username || "", searchQuery)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 truncate w-full">
                                        @{highlightText(user?.username || user?.email?.split('@')[0] || "", searchQuery)}
                                    </p>

                                    {/* Follow Button */}
                                    <button
                                        onClick={() => handleFollowToggle(user.id)}
                                        disabled={isLoading}
                                        className={`
                                            w-full py-2.5 px-4 rounded-lg font-semibold text-sm
                                            transition-all duration-200
                                            ${isFollowing
                                                ? 'bg-accent text-foreground hover:bg-accent/70 border border-border'
                                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                <span>Loading...</span>
                                            </div>
                                        ) : isFollowing ? (
                                            'Following'
                                        ) : (
                                            'Follow'
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
