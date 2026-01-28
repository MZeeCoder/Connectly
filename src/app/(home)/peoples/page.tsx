"use client";

import { useEffect, useState } from "react";
import { PeopleService } from "@/server/services/people.service";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { FollowStatusMap } from "@/types";
import { PeopleSkeleton } from "@/components/people/PeopleSkeleton";

export default function PeoplePage() {
    const [users, setUsers] = useState<PeopleUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [followStatus, setFollowStatus] = useState<FollowStatusMap>({});
    const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.full_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

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
                        <path d="m21 21-4.35-4.35" />
                    </svg>
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
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground mb-4 opacity-50"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {searchQuery ? "No Results Found" : "No Users Yet"}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {searchQuery
                            ? "Try adjusting your search terms or filters."
                            : "Be the first to connect! Invite people to join Connectly."
                        }
                    </p>
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
                                        {user?.full_name || user?.username}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3 truncate w-full">
                                        @{user?.username || user?.email?.split('@')[0]}
                                    </p>

                                    {/* Bio */}
                                    {user.bio && (
                                        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 w-full">
                                            {user.bio}
                                        </p>
                                    )}

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
