import { MessageContent } from "@/components/messages/message-content";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MessagesContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");

    return (
        <div className="mx-auto h-full overflow-hidden">
            <MessageContent selectedUserId={userId} />
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
