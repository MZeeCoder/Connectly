"use client";

import { useEffect, useState } from "react";
import { PeopleService } from "@/server/services/people.service";
import type { PeopleUser } from "@/app/api/peoples/route";
import { Spinner } from "../ui/Spinner";

export default function PeopleForm() {
    const [users, setUsers] = useState<PeopleUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPeoples() {
            try {
                setLoading(true);
                debugger;
                const result = await PeopleService.getAllPeoples();

                if (result.success && result.data) {
                    setUsers(result.data);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    // Empty state when no users found
    if (users.length === 0) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">People</h1>
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
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
                        className="text-gray-400 mb-4"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        No Users Found
                    </h2>
                    <p className="text-gray-500 max-w-md">
                        There are currently no users in the community. Be the first to invite people and start building your network!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">People</h1>

            <div className="flex flex-col gap-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="border rounded-xl p-4 flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <img
                            src={user.avatar_url || "/avatar.png"}
                            alt={user?.full_name || user?.username || "User"}
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        {/* Info */}
                        <div>
                            <p className="font-semibold">{user?.full_name || user?.username}</p>
                            <p className="text-sm text-gray-500">@{user?.email}</p>
                            {user.bio && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}