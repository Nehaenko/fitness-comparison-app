const MAX_PROGRESS_PHOTO_DIMENSION = 1600;
const PROGRESS_PHOTO_QUALITY = 0.82;

function getOptimizedDimensions(width: number, height: number) {
    const scale = Math.min(
        1,
        MAX_PROGRESS_PHOTO_DIMENSION / Math.max(width, height),
    );

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

export async function optimizeProgressPhoto(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file);
        const dimensions = getOptimizedDimensions(
            bitmap.width,
            bitmap.height,
        );
        const canvas = document.createElement("canvas");
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const context = canvas.getContext("2d");

        if (!context) {
            bitmap.close();
            return file;
        }

        context.drawImage(
            bitmap,
            0,
            0,
            dimensions.width,
            dimensions.height,
        );
        bitmap.close();

        const optimizedBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(
                resolve,
                "image/webp",
                PROGRESS_PHOTO_QUALITY,
            );
        });

        if (!optimizedBlob || optimizedBlob.size >= file.size) {
            return file;
        }

        const nameWithoutExtension = file.name.replace(/\.[^.]+$/, "");

        return new File(
            [optimizedBlob],
            `${nameWithoutExtension}.webp`,
            {
                type: "image/webp",
                lastModified: file.lastModified,
            },
        );
    } catch {
        // Older browsers can still upload the validated original image.
        return file;
    }
}
