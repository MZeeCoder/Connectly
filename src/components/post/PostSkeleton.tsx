import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

export function PostSkeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "bg-white border border-slate-100 rounded-4xl shadow-sm p-8",
                className
            )}
        >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-8">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-9 h-9 rounded-full" />
            </div>
        </div>
    );
}

export function FeedSkeleton() {
    return (
        <div className="space-y-6 pb-6">
            <PostSkeleton />
            <PostSkeleton className="opacity-70" />
            <PostSkeleton className="opacity-40" />
        </div>
    );
}
