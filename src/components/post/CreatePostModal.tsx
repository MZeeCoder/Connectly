"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/utils/cn";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE, POST_MAX_LENGTH } from "@/lib/constants";
import type { Post, CreatePostData, UpdatePostData } from "@/types";

// Icons as components for better animations
const PhotoIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const VideoIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface MediaPreview {
    id: string;
    file?: File;
    url: string;
    type: "image" | "video";
    isExisting?: boolean;
}

export interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePostData | UpdatePostData) => Promise<void>;
    editingPost?: Post | null;
}

/**
 * CreatePostModal - Modal for creating or editing posts with text, images, and videos
 */
export function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    editingPost,
}: CreatePostModalProps) {
    const [content, setContent] = React.useState("");
    const [media, setMedia] = React.useState<MediaPreview[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const isEditing = !!editingPost;

    // Reset form when modal opens/closes or when editing post changes
    React.useEffect(() => {
        if (isOpen) {
            if (editingPost) {
                setContent(editingPost.content || "");
                // Load existing media
                const existingMedia: MediaPreview[] = [];

                // Add existing images
                const imageUrls = editingPost.image_urls || (editingPost.image_url ? [editingPost.image_url] : []);
                imageUrls.forEach((url, index) => {
                    existingMedia.push({
                        id: `existing-image-${index}`,
                        url,
                        type: "image",
                        isExisting: true,
                    });
                });

                // Add existing videos
                const videoUrls = editingPost.video_urls || (editingPost.video_url ? [editingPost.video_url] : []);
                videoUrls.forEach((url, index) => {
                    existingMedia.push({
                        id: `existing-video-${index}`,
                        url,
                        type: "video",
                        isExisting: true,
                    });
                });

                setMedia(existingMedia);
            } else {
                setContent("");
                setMedia([]);
            }
            setError(null);
        }
    }, [isOpen, editingPost]);

    // Cleanup object URLs on unmount
    React.useEffect(() => {
        return () => {
            media.forEach((m) => {
                if (!m.isExisting && m.url.startsWith("blob:")) {
                    URL.revokeObjectURL(m.url);
                }
            });
        };
    }, [media]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setError(null);
        const newMedia: MediaPreview[] = [];

        Array.from(files).forEach((file) => {
            // Validate file type
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isVideo) {
                setError(`Invalid file type: ${file.name}. Allowed: images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM)`);
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                setError(`File too large: ${file.name}. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
                return;
            }

            newMedia.push({
                id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                file,
                url: URL.createObjectURL(file),
                type: isImage ? "image" : "video",
            });
        });

        setMedia((prev) => [...prev, ...newMedia]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveMedia = (id: string) => {
        setMedia((prev) => {
            const item = prev.find((m) => m.id === id);
            if (item && !item.isExisting && item.url.startsWith("blob:")) {
                URL.revokeObjectURL(item.url);
            }
            return prev.filter((m) => m.id !== id);
        });
    };

    const uploadFiles = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Upload failed");
        }

        return result.data.map((item: { url: string }) => item.url);
    };

    const handleSubmit = async () => {
        // Validate content
        if (!content.trim() && media.length === 0) {
            setError("Please add some content or media to your post");
            return;
        }

        if (content.length > POST_MAX_LENGTH) {
            setError(`Post content exceeds maximum length of ${POST_MAX_LENGTH} characters`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Separate new files and existing URLs
            const newFiles = media.filter((m) => !m.isExisting && m.file).map((m) => m.file!);
            const existingImages = media.filter((m) => m.isExisting && m.type === "image").map((m) => m.url);
            const existingVideos = media.filter((m) => m.isExisting && m.type === "video").map((m) => m.url);

            // Upload new files
            let uploadedUrls: string[] = [];
            if (newFiles.length > 0) {
                setIsUploading(true);
                uploadedUrls = await uploadFiles(newFiles);
                setIsUploading(false);
            }

            // Separate uploaded URLs by type
            const newImages: string[] = [];
            const newVideos: string[] = [];

            media.forEach((m, index) => {
                if (!m.isExisting && m.file) {
                    const uploadedIndex = newFiles.indexOf(m.file);
                    if (uploadedIndex !== -1 && uploadedUrls[uploadedIndex]) {
                        if (m.type === "image") {
                            newImages.push(uploadedUrls[uploadedIndex]);
                        } else {
                            newVideos.push(uploadedUrls[uploadedIndex]);
                        }
                    }
                }
            });

            // Combine existing and new URLs
            const imageUrls = [...existingImages, ...newImages];
            const videoUrls = [...existingVideos, ...newVideos];

            // Submit post data
            const postData: CreatePostData | UpdatePostData = {
                content: content.trim(),
                image_urls: imageUrls,
                video_urls: videoUrls,
            };

            await onSubmit(postData);

            // Reset form and close modal
            setContent("");
            setMedia([]);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create post");
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            // Cleanup blob URLs
            media.forEach((m) => {
                if (!m.isExisting && m.url.startsWith("blob:")) {
                    URL.revokeObjectURL(m.url);
                }
            });
            setContent("");
            setMedia([]);
            setError(null);
            onClose();
        }
    };

    const characterCount = content.length;
    const isOverLimit = characterCount > POST_MAX_LENGTH;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEditing ? "Edit Post" : "Create Post"}
            className="max-w-2xl rounded-2xl bg-[#632b98]"
            showCloseButton={!isSubmitting}
        >
            <div className="flex flex-col space-y-5">
                {/* Error Alert with animation */}
                {error && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300 rounded-xl border border-red-300 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3.5 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                )}

                {/* Enhanced Textarea Section */}
                <div className="group relative rounded-xl border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-white p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:border-purple-300/70 focus-within:ring-2 focus-within:ring-purple-400/30 focus-within:border-purple-400">
                    <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

                    <Textarea
                        placeholder="What's on your mind? ✨"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[160px] resize-none border-none bg-transparent p-0 text-base text-black placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                        disabled={isSubmitting}
                    />

                    {/* Character Counter with progress bar */}
                    <div className="mt-3 space-y-2">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-300 ease-out",
                                    isOverLimit
                                        ? "bg-red-500"
                                        : characterCount > POST_MAX_LENGTH * 0.9
                                            ? "bg-yellow-500"
                                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                                )}
                                style={{ width: `${Math.min((characterCount / POST_MAX_LENGTH) * 100, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-end">
                            <span
                                className={cn(
                                    "text-xs font-medium transition-colors duration-200",
                                    isOverLimit
                                        ? "text-red-600 font-semibold"
                                        : characterCount > POST_MAX_LENGTH * 0.9
                                            ? "text-yellow-600"
                                            : "text-gray-500"
                                )}
                            >
                                {characterCount} / {POST_MAX_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Media Grid */}
                {media.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {media.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-md hover:shadow-xl transition-all duration-300 animate-in fade-in zoom-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Media Content */}
                                    {item.type === "image" ? (
                                        <img
                                            src={item.url}
                                            alt="Preview"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <video
                                            src={item.url}
                                            muted
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    )}

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Video Badge */}
                                    {item.type === "video" && (
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/80 backdrop-blur-sm px-2.5 py-1 shadow-lg">
                                            <VideoIcon />
                                            <span className="text-xs font-medium text-white">Video</span>
                                        </div>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveMedia(item.id)}
                                        disabled={isSubmitting}
                                        className="absolute right-2 top-2 rounded-full bg-red-500/90 backdrop-blur-sm p-2 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Remove media"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Media Upload Button */}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4 border border-purple-100">
                    <input
                        ref={fileInputRef}
                        id="media-upload"
                        type="file"
                        accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
                        multiple
                        onChange={handleFileSelect}
                        disabled={isSubmitting}
                        className="hidden"
                    />
                    <label
                        htmlFor="media-upload"
                        className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg bg-white border-2 border-purple-200 px-5 py-2.5 text-sm font-medium text-purple-700 transition-all duration-300 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md hover:scale-105 active:scale-95",
                            isSubmitting && "opacity-50 cursor-not-allowed hover:scale-100"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <PhotoIcon />
                            <VideoIcon />
                        </div>
                        <span>Add Photos / Videos</span>
                    </label>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Max {MAX_FILE_SIZE / 1024 / 1024}MB per file</span>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-purple-100">
                    {/* Upload Progress Indicator */}
                    {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 animate-pulse">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="font-medium">Uploading media...</span>
                        </div>
                    )}

                    <div className={cn("flex gap-3", isUploading ? "ml-auto" : "ml-auto")}>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-6 hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                            disabled={
                                isSubmitting ||
                                isOverLimit ||
                                (!content.trim() && media.length === 0)
                            }
                            className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </span>
                            ) : isEditing ? (
                                "Save Changes"
                            ) : (
                                "Post"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
