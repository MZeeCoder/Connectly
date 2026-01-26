import { Logger } from "@/utils/logger";
import type { PeopleUser } from "@/app/api/peoples/route";
import type { ApiResponse } from "@/types";

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
}