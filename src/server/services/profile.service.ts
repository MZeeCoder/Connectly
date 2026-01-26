import { Logger } from "@/utils/logger";
import type { ProfileUser } from "@/app/api/profile/route";
import type { ApiResponse } from "@/types";

export class ProfileService {
    /**
     * Get current user's profile from the API
     */
    static async getCurrentUserProfile(): Promise<ApiResponse<ProfileUser>> {
        const timer = Logger.timer("ProfileService", "getCurrentUserProfile");

        try {
            Logger.debug("ProfileService", "Fetching current user profile via API");

            const response = await fetch("/api/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

            if (!response.ok) {
                Logger.error("ProfileService", "API request failed", {
                    status: response.status,
                    statusText: response.statusText,
                });
                return {
                    success: false,
                    error: "Failed to fetch profile",
                };
            }

            const result: ApiResponse<ProfileUser> = await response.json();

            if (!result.success) {
                Logger.warn("ProfileService", "Failed to fetch profile", {
                    error: result.error,
                });
            } else {
                Logger.success("ProfileService", "Profile fetched successfully");
            }

            return result;
        } catch (error) {
            Logger.error("ProfileService", "Unexpected error in getCurrentUserProfile", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: "An unexpected error occurred",
            };
        } finally {
            timer.end("getCurrentUserProfile completed");
        }
    }
}
