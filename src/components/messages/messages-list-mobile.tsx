"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar?: string;
}

const conversations: Conversation[] = [
    { id: "1", name: "Alice Freeman", lastMessage: "Sure thing, send them over.", time: "10:12 AM", unread: 0 },
    { id: "2", name: "John Doe", lastMessage: "Hey, how are you?", time: "2:30 PM", unread: 2 },
    { id: "3", name: "Jane Smith", lastMessage: "Thanks for the help!", time: "1:15 PM", unread: 0 },
    { id: "4", name: "Mike Johnson", lastMessage: "See you tomorrow", time: "Yesterday", unread: 0 },
    { id: "5", name: "Sarah Wilson", lastMessage: "That sounds great!", time: "Yesterday", unread: 1 },
    { id: "6", name: "Bob Smith", lastMessage: "Check out this new design I made!", time: "1h", unread: 1 },
    { id: "7", name: "Charlie Rose", lastMessage: "Sent a photo", time: "3h", unread: 0 },
    { id: "8", name: "David Green", lastMessage: "Can you send me the files?", time: "1d", unread: 0 },
    { id: "9", name: "Eva White", lastMessage: "Thanks for your help!", time: "2d", unread: 0 },
    { id: "10", name: "Frank Black", lastMessage: "Let's meet at 5pm.", time: "3d", unread: 0 },
    { id: "11", name: "Grace Blue", lastMessage: "Sounds good!", time: "4d", unread: 0 },
];

export function MessagesListMobile() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full bg-card">
            {/* Header */}
            <div className="px-4 py-4 border-b border-border bg-card sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-foreground mb-3">Messages</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full bg-accent border border-border rounded-lg px-4 py-2 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
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
                        className="absolute left-3 top-2.5 text-muted-foreground"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => router.push(`/messages?userId=${conv.id}`)}
                        className="w-full flex items-start gap-4 px-4 py-4 hover:bg-accent transition-all border-b border-border active:bg-accent/70"
                    >
                        <div className="relative shrink-0">
                            {conv.avatar ? (
                                <img
                                    src={conv.avatar}
                                    alt={conv.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground text-sm font-semibold">
                                        {conv.name.split(" ").map(n => n[0]).join("")}
                                    </span>
                                </div>
                            )}
                            {conv.unread > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                    {conv.unread}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "text-sm truncate",
                                    conv.unread > 0 ? "font-bold text-foreground" : "font-medium text-foreground"
                                )}>
                                    {conv.name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                                    {conv.time}
                                </span>
                            </div>
                            <p className={cn(
                                "text-sm truncate",
                                conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                                {conv.lastMessage}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
