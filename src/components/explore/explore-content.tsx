"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

const CATEGORIES = [
    "For You",
    "Design",
    "Technology",
    "Art",
    "Photography",
    "Travel",
    "Architecture",
    "Fashion",
    "Food",
    "Gaming",
];

export function ExploreContent() {
    const [activeCategory, setActiveCategory] = useState("For You");

    return (
        <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-6 max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto w-full">
                <input
                    type="text"
                    placeholder="Search for people, tags, and inspiration..."
                    className="w-full bg-card border border-border rounded-full px-10 sm:px-12 py-3 sm:py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
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
                    className="absolute left-3 sm:left-5 top-3 sm:top-4 text-muted-foreground"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            </div>

            {/* Category Tabs */}
            <div className="relative flex items-center group">
                <button className="absolute left-0 z-10 p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-md text-muted-foreground hover:text-foreground transition-colors -ml-3 hidden sm:block">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>

                <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-1 sm:px-2 py-1 flex-1">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "whitespace-nowrap px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border",
                                activeCategory === category
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <button className="absolute right-0 z-10 p-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-md text-muted-foreground hover:text-foreground transition-colors -mr-3 hidden sm:block">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Masonry-style Skeleton Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-3 gap-4 space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="break-inside-avoid">
                        <div className="relative group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                            <Skeleton
                                className={cn(
                                    "w-full flex items-center justify-center bg-accent/20",
                                    i % 3 === 0 ? "h-64" : i % 2 === 0 ? "h-80" : "h-96"
                                )}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-muted-foreground/40 group-hover:scale-110 transition-transform duration-300"
                                >
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                            </Skeleton>

                            {/* Optional footer info in skeleton */}
                            <div className="p-4 flex flex-col gap-2">
                                <Skeleton className="h-4 w-3/4 rounded-full bg-accent/30" />
                                <Skeleton className="h-3 w-1/2 rounded-full bg-accent/20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
