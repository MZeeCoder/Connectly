import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/utils/logger";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

const STORAGE_BUCKET = "posts-media";

/**
 * POST /api/upload - Upload media files to Supabase Storage
 * Returns array of URLs for uploaded files
 */
export async function POST(request: NextRequest) {
    const timer = Logger.timer("UploadAPI", "POST /api/upload");

    try {
        Logger.request("UploadAPI", "POST", "/api/upload");

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("UploadAPI", "Unauthorized upload attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        Logger.auth("UploadAPI", "User authenticated", { userId: user.id });

        // Get form data
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            Logger.warn("UploadAPI", "No files provided");
            return NextResponse.json(
                { success: false, error: "No files provided" },
                { status: 400 }
            );
        }

        Logger.debug("UploadAPI", "Files received", { count: files.length });

        const uploadResults: { url: string; path: string; type: "image" | "video" }[] = [];
        const errors: string[] = [];

        for (const file of files) {
            // Validate file type
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isVideo) {
                errors.push(`Invalid file type: ${file.name} (${file.type})`);
                Logger.warn("UploadAPI", "Invalid file type", {
                    fileName: file.name,
                    fileType: file.type
                });
                continue;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                errors.push(`File too large: ${file.name} (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
                Logger.warn("UploadAPI", "File too large", {
                    fileName: file.name,
                    fileSize: file.size,
                    maxSize: MAX_FILE_SIZE,
                });
                continue;
            }

            // Generate unique file path: userId/timestamp-randomId.extension
            const fileExtension = file.name.split(".").pop() || "unknown";
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const filePath = `${user.id}/${timestamp}-${randomId}.${fileExtension}`;

            Logger.debug("UploadAPI", "Uploading file", {
                fileName: file.name,
                filePath,
                fileSize: file.size,
                fileType: file.type,
            });

            // Convert File to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false,
                });

            if (error) {
                errors.push(`Upload failed: ${file.name} - ${error.message}`);
                Logger.error("UploadAPI", "Upload failed", {
                    fileName: file.name,
                    error: error.message,
                });
                continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path);

            uploadResults.push({
                url: urlData.publicUrl,
                path: data.path,
                type: isImage ? "image" : "video",
            });

            Logger.success("UploadAPI", "File uploaded successfully", {
                fileName: file.name,
                url: urlData.publicUrl,
            });
        }

        timer.end("Upload completed");

        if (uploadResults.length === 0 && errors.length > 0) {
            return NextResponse.json(
                { success: false, error: errors.join("; ") },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: uploadResults,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        Logger.error("UploadAPI", "Unexpected error during upload", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Upload failed",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/upload - Delete media files from Supabase Storage
 */
export async function DELETE(request: NextRequest) {
    const timer = Logger.timer("UploadAPI", "DELETE /api/upload");

    try {
        Logger.request("UploadAPI", "DELETE", "/api/upload");

        // Authenticate user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            Logger.warn("UploadAPI", "Unauthorized delete attempt");
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { paths } = body as { paths: string[] };

        if (!paths || paths.length === 0) {
            return NextResponse.json(
                { success: false, error: "No file paths provided" },
                { status: 400 }
            );
        }

        // Validate that user can only delete their own files
        const invalidPaths = paths.filter(
            (path) => !path.startsWith(`${user.id}/`)
        );

        if (invalidPaths.length > 0) {
            Logger.warn("UploadAPI", "Attempted to delete files not owned by user", {
                userId: user.id,
                invalidPaths,
            });
            return NextResponse.json(
                { success: false, error: "You can only delete your own files" },
                { status: 403 }
            );
        }

        Logger.debug("UploadAPI", "Deleting files", { paths });

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(paths);

        if (error) {
            Logger.error("UploadAPI", "Delete failed", { error: error.message });
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        Logger.success("UploadAPI", "Files deleted successfully", {
            count: paths.length,
        });
        timer.end("Delete completed");

        return NextResponse.json({ success: true });
    } catch (error) {
        Logger.error("UploadAPI", "Unexpected error during delete", {
            error: error instanceof Error ? error.message : String(error),
        });

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Delete failed",
            },
            { status: 500 }
        );
    }
}
