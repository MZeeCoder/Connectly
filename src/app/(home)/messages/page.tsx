"use client";
import { MessageContent } from "@/components/messages/message-content";
import { MessagesListMobile } from "@/components/messages/messages-list-mobile";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MessagesContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    return (
        <>
            {/* Mobile: Show list or chat based on userId */}
            <div className="lg:hidden h-[calc(100vh-7rem)]">
                {userId ? (
                    <MessageContent selectedUserId={userId} />
                ) : (
                    <MessagesListMobile />
                )}
            </div>

            {/* Desktop: Always show chat */}
            <div className="hidden lg:block h-[calc(100vh-3.5rem)]">
                <MessageContent selectedUserId={userId} />
            </div>
        </>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
}

