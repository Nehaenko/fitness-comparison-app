import {get} from "@vercel/blob";
import sharp from "sharp";

import {auth} from "@/auth";
import {getProgressPhotoForUser} from "@/db/progress";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_WIDTHS = new Set([480, 1200]);
const PHOTO_CACHE_CONTROL =
    "private, max-age=86400, must-revalidate";

export async function GET(
    request: Request,
    context: {
        params: Promise<{
            photoId: string;
        }>;
    },
) {
    const session = await auth();

    if (!session?.user?.id) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const {photoId} = await context.params;
    const widthValue = new URL(request.url).searchParams.get("width");
    const requestedWidth = widthValue === null
        ? null
        : Number(widthValue);

    if (!UUID_PATTERN.test(photoId)) {
        return new Response("Not found", {
            status: 404,
        });
    }

    if (
        requestedWidth !== null &&
        !ALLOWED_IMAGE_WIDTHS.has(requestedWidth)
    ) {
        return new Response("Invalid image width", {
            status: 400,
        });
    }

    const photo = await getProgressPhotoForUser(
        photoId,
        session.user.id,
    );

    if (!photo) {
        return new Response("Not found", {
            status: 404,
        });
    }

    const result = await get(
        photo.storageKey,
        requestedWidth === null
            ? {
                access: "private",
                ifNoneMatch:
                    request.headers.get("if-none-match") ?? undefined,
            }
            : {access: "private"},
    );

    if (!result) {
        return new Response("Not found", {
            status: 404,
        });
    }

    if (result.statusCode === 304) {
        return new Response(null, {
            status: 304,
            headers: {
                ETag: result.blob.etag,
                "Cache-Control": PHOTO_CACHE_CONTROL,
                Vary: "Cookie",
            },
        });
    }

    if (result.statusCode !== 200) {
        return new Response("Not found", {
            status: 404,
        });
    }

    if (requestedWidth !== null) {
        const optimizedEtag =
            `W/\"${result.blob.etag}-${requestedWidth}\"`;

        if (request.headers.get("if-none-match") === optimizedEtag) {
            return new Response(null, {
                status: 304,
                headers: {
                    ETag: optimizedEtag,
                    "Cache-Control": PHOTO_CACHE_CONTROL,
                    Vary: "Cookie",
                },
            });
        }

        const source = Buffer.from(
            await new Response(result.stream).arrayBuffer(),
        );
        const optimizedPhoto = await sharp(source)
            .rotate()
            .resize({
                width: requestedWidth,
                withoutEnlargement: true,
            })
            .webp({quality: 80})
            .toBuffer();

        return new Response(optimizedPhoto, {
            headers: {
                "Content-Type": "image/webp",
                "Content-Length": optimizedPhoto.length.toString(),
                "Content-Disposition": "inline",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": PHOTO_CACHE_CONTROL,
                ETag: optimizedEtag,
                Vary: "Cookie",
            },
        });
    }

    return new Response(result.stream, {
        headers: {
            "Content-Type":
            result.blob.contentType,
            "Content-Length":
                result.blob.size.toString(),
            "Content-Disposition": "inline",
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": PHOTO_CACHE_CONTROL,
            ETag: result.blob.etag,
            "Vary": "Cookie",
        },
    });
}
