export default function MessagesPage() {
    return (
        <div className="mx-auto max-w-6xl">
            <h1 className="mb-6 text-3xl font-bold text-foreground">Messages</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Conversations List */}
                <div className="rounded-lg border border-border bg-card p-4 lg:col-span-1">
                    <h2 className="mb-4 font-semibold text-foreground">Conversations</h2>
                    <p className="text-center text-sm text-muted-foreground">
                        No conversations yet
                    </p>
                </div>

                {/* Message Thread */}
                <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
                    <div className="flex h-96 items-center justify-center">
                        <p className="text-muted-foreground">
                            Select a conversation to start messaging
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
