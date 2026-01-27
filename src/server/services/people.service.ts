import { Logger } from "@/utils/logger";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { ApiResponse, FollowStatus, FollowStatusMap } from "@/types";

export class PeopleService {
    /**
     * Get all peoples from the API
     */
    static async getAllPeoples(): Promise<ApiResponse<PeopleUser[]>> {
        const timer = Logger.timer("PeopleService", "getAllPeoples");

        try {
            Logger.debug("PeopleService", "Fetching all peoples via API");

            const response = await fetch("/api/peoples", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                Logger.error("PeopleService", "API request failed", {
                    status: response.status,
                    statusText: response.statusText,
                });
                return {
                    success: false,
                    error: "Failed to fetch peoples",
                };
            }

            const result: ApiResponse<PeopleUser[]> = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to fetch peoples", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "Peoples fetched successfully", {
                    count: result.data?.length || 0,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in getAllPeoples", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("getAllPeoples completed");
        }
    }

    /**
     * Follow a user
     */
    static async followUser(followingId: string): Promise<ApiResponse> {
        const timer = Logger.timer("PeopleService", "followUser");

        try {
            Logger.debug("PeopleService", "Following user", { followingId });

            const response = await fetch("/api/follows", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ following_id: followingId }),
            });

            const result: ApiResponse = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to follow user", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "User followed successfully", {
                    followingId,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in followUser", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("followUser completed");
        }
    }

    /**
     * Unfollow a user
     */
    static async unfollowUser(followingId: string): Promise<ApiResponse> {
        const timer = Logger.timer("PeopleService", "unfollowUser");

        try {
            Logger.debug("PeopleService", "Unfollowing user", { followingId });

            const response = await fetch(`/api/follows?following_id=${followingId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result: ApiResponse = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to unfollow user", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "User unfollowed successfully", {
                    followingId,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in unfollowUser", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("unfollowUser completed");
        }
    }

    /**
     * Check if current user is following a specific user
     */
    static async checkFollowStatus(userId: string): Promise<ApiResponse<FollowStatus>> {
        const timer = Logger.timer("PeopleService", "checkFollowStatus");

        try {
            Logger.debug("PeopleService", "Checking follow status", { userId });

            const response = await fetch(`/api/follows?user_id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result: ApiResponse<FollowStatus> = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to check follow status", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "Follow status checked", {
                    userId,
                    isFollowing: result.data?.isFollowing,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in checkFollowStatus", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("checkFollowStatus completed");
        }
    }

    /**
     * Get follow status for multiple users
     */
    static async getFollowStatusMap(userIds: string[]): Promise<ApiResponse<FollowStatusMap>> {
        const timer = Logger.timer("PeopleService", "getFollowStatusMap");

        try {
            Logger.debug("PeopleService", "Getting follow status for multiple users", {
                count: userIds.length,
            });

            const response = await fetch("/api/follows/status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_ids: userIds }),
            });

            const result: ApiResponse<FollowStatusMap> = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to get follow status map", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "Follow status map retrieved", {
                    count: userIds.length,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in getFollowStatusMap", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("getFollowStatusMap completed");
        }
    }

    /**
     * Get followers of a user
     */
    static async getFollowers(userId: string): Promise<ApiResponse<any[]>> {
        const timer = Logger.timer("PeopleService", "getFollowers");

        try {
            Logger.debug("PeopleService", "Getting followers", { userId });

            const response = await fetch(`/api/follows?type=followers&target_user_id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result: ApiResponse<any[]> = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to get followers", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "Followers retrieved", {
                    count: result.data?.length || 0,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in getFollowers", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("getFollowers completed");
        }
    }

    /**
     * Get users that a user is following
     */
    static async getFollowing(userId: string): Promise<ApiResponse<any[]>> {
        const timer = Logger.timer("PeopleService", "getFollowing");

        try {
            Logger.debug("PeopleService", "Getting following", { userId });

            const response = await fetch(`/api/follows?type=following&target_user_id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result: ApiResponse<any[]> = await response.json();

            if (!result.success) {
                Logger.warn("PeopleService", "Failed to get following", {
                    error: result.error,
                });
            } else {
                Logger.success("PeopleService", "Following retrieved", {
                    count: result.data?.length || 0,
                });
            }

            return result;
        } catch (error) {
            Logger.error("PeopleService", "Unexpected error in getFollowing", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("getFollowing completed");
        }
    }
}