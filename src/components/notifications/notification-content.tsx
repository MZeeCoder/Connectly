"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

type NotificationType = "like" | "follow" | "comment" | "star";

interface Notification {
    id: string;
    type: NotificationType;
    user: {
        name: string;
        username: string;
        avatar: string;
    };
    content?: string;
    time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "like",
        user: { name: "Alice Freeman", username: "alice", avatar: "A" },
        content: "liked your post",
        time: "2m",
    },
    {
        id: "2",
        type: "follow",
        user: { name: "Bob Smith", username: "bob", avatar: "B" },
        content: "followed you",
        time: "1h",
    },
    {
        id: "3",
        type: "comment",
        user: { name: "Charlie Rose", username: "charlie", avatar: "C" },
        content: 'commented: "Great work!"',
        time: "3h",
    },
    {
        id: "4",
        type: "star",
        user: { name: "David Green", username: "david", avatar: "D" },
        content: "starred your repository",
        time: "1d",
    },
    {
        id: "5",
        type: "like",
        user: { name: "Eva White", username: "eva", avatar: "E" },
        content: "liked your comment",
        time: "2d",
    },
    {
        id: "6",
        type: "comment",
        user: { name: "Frank Miller", username: "frank", avatar: "F" },
        content: 'commented: "This is a great tutorial, thanks for sharing!"',
        time: "3d",
    },
    {
        id: "7",
        type: "follow",
        user: { name: "Grace Hopper", username: "grace", avatar: "G" },
        content: "followed you",
        time: "4d",
    },
];

export function NotificationContent() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setNotifications(MOCK_NOTIFICATIONS);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "like":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-red-500"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                );
            case "follow":
                return (
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
                        className="text-blue-500"
                    >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" x2="19" y1="8" y2="14" />
                        <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                );
            case "comment":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-blue-400"
                    >
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                    </svg>
                );
            case "star":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-yellow-500"
                    >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a.53.53 0 0 0 .402.292l5.163.75a.53.53 0 0 1 .294.904l-3.736 3.642a.53.53 0 0 0-.153.47l.882 5.141a.53.53 0 0 1-.77.559l-4.618-2.428a.53.53 0 0 0-.494 0l-4.618 2.428a.53.53 0 0 1-.77-.559l.882-5.141a.53.53 0 0 0-.153-.47L2.858 9.875a.53.53 0 0 1 .294-.904l5.163-.75a.53.53 0 0 0 .402-.292z" />
                    </svg>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Sticky Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(loading && "animate-spin")}
                        >
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                            <path d="M3 21v-5h5" />
                        </svg>
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Scrollable List container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
                <div className="max-w-3xl mx-auto space-y-4 pb-10">
                    {loading ? (
                        // Skeleton State
                        Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center gap-6 shadow-sm"
                            >
                                <Skeleton className="w-5 h-5 rounded-full shrink-0 bg-slate-100" />
                                <Skeleton className="w-12 h-12 rounded-full shrink-0 bg-slate-100" />
                                <div className="flex-1 min-w-0 space-y-2">
                                    <Skeleton className="h-5 w-1/4 rounded-full bg-slate-100" />
                                    <Skeleton className="h-4 w-1/2 rounded-full bg-slate-50" />
                                </div>
                                <Skeleton className="h-3 w-8 rounded-full bg-slate-100 shrink-0" />
                            </div>
                        ))
                    ) : (
                        // Data State
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="bg-white hover:border-primary/20 border border-slate-100 rounded-[2rem] px-8 py-6 flex items-center gap-6 transition-all group cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
                            >
                                <div className="shrink-0 flex items-center justify-center">{getIcon(notif.type)}</div>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/5 text-primary text-lg font-bold">
                                    {notif.user.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-slate-900 leading-tight">
                                        {notif.user.name}
                                    </p>
                                    <p className="text-[15px] text-slate-500 mt-1">
                                        {notif.content}
                                    </p>
                                </div>
                                <div className="text-sm text-slate-400 shrink-0 tabular-nums font-medium">
                                    {notif.time}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
