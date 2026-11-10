import {get} from "@vercel/blob";

import {auth} from "@/auth";
import {getProgressPhotoForUser} from "@/db/progress";

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
    _request: Request,
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

    if (!UUID_PATTERN.test(photoId)) {
        return new Response("Not found", {
            status: 404,
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

    const result = await get(photo.storageKey, {
        access: "private",
    });

    if (!result || result.statusCode !== 200) {
        return new Response("Not found", {
            status: 404,
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
            "Cache-Control": "private, no-store",
        },
    });
}