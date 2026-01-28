import { Skeleton } from "@/components/ui/skeleton";

export function PeopleSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {/* Who to follow skeleton */}
            <div className="flex flex-col gap-4">
                <Skeleton className="h-7 w-40 px-1" />
                <div className="flex flex-col gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-2 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Trending skeleton */}
            <div className="flex flex-col gap-4 mt-2">
                <Skeleton className="h-7 w-32 px-1" />
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-2xl bg-accent/20 space-y-2">
                            <Skeleton className="h-2 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
