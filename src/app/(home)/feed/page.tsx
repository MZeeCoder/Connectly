import { Suspense } from "react";
import { PostService } from "@/server/services/post.service";
import { FeedClient } from "@/components/post";
import { FeedSkeleton } from "@/components/post/PostSkeleton";

export const dynamic = "force-dynamic";

async function FeedContent() {
    const posts = await PostService.getFeed();

    return <FeedClient initialPosts={posts} />;
}

export default function FeedPage() {
    return (
        <div className="mx-auto max-w-2xl lg:max-w-3xl xl:max-w-4xl">
            <Suspense fallback={<FeedSkeleton />}>
                <FeedContent />
            </Suspense>
        </div>
    );
}
