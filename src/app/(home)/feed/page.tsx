import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { PostService } from "@/server/services/post.service";
import { formatRelativeTime } from "@/utils/date";
import { Avatar } from "@/components/ui/Avatar";

export const dynamic = "force-dynamic";

async function FeedContent() {
    const posts = await PostService.getFeed();

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <article
                    key={post.id}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <Avatar
                            src={post.user?.avatar_url}
                            alt={post.user?.username}
                            fallback={post.user?.username?.charAt(0).toUpperCase()}
                        />
                        <div>
                            <p className="font-semibold text-foreground">
                                {post.user?.full_name || post.user?.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatRelativeTime(post.created_at)}
                            </p>
                        </div>
                    </div>

                    <p className="mb-4 text-foreground">{post.content}</p>

                    {post.image_url && (
                        <img
                            src={post.image_url}
                            alt="Post"
                            className="mb-4 rounded-lg w-full"
                        />
                    )}

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <button className="flex items-center gap-2 hover:text-primary">
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
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span>{post.likes_count || 0}</span>
                        </button>

                        <button className="flex items-center gap-2 hover:text-primary">
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
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{post.comments_count || 0}</span>
                        </button>
                    </div>
                </article>
            ))}

            {posts.length === 0 && (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </div>
            )}
        </div>
    );
}

export default function FeedPage() {
    return (
        <div className="mx-auto max-w-2xl">
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
