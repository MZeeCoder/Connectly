import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { PostService } from "@/server/services/post.service";
import { FeedClient } from "@/components/post";

export const dynamic = "force-dynamic";

async function FeedContent() {
    const posts = await PostService.getFeed();

    return <FeedClient initialPosts={posts} />;
}

export default function FeedPage() {
    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-3xl font-bold text-foreground">Feed</h1>
            <Suspense
                fallback={
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                }
            >
                <FeedContent />
            </Suspense>
        </div>
    );
}
