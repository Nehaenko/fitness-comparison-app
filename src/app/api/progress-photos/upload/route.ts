import {handleUpload, type HandleUploadBody} from "@vercel/blob/client";
import {NextRequest, NextResponse} from "next/server";

import {auth} from "@/auth";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

export async function POST(
    request: Request,
): Promise<NextResponse> {
    const body = await request.json() as HandleUploadBody;

    try {
        const response = await handleUpload({
            body, request,

            onBeforeGenerateToken: async (pathname) => {
                const session = await auth();

                if (!session?.user?.id) {
                    throw new Error("Unauthorized");
                }

                const expectedPrefix = `progress-photos/${session.user.id}/`;

                if (!pathname.startsWith(expectedPrefix)) {
                    throw new Error("invalid upload path");
                }

                return {
                    allowedContentTypes: [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ],
                    maximumSizeInBytes: MAX_PHOTO_SIZE,
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },

            onUploadCompleted: async () => {
                // The database entry will be created later
                // by the authenticated save action.
            },
        });
        return NextResponse.json(response);
    } catch {
        return NextResponse.json(
            {error: "Unable to authorize upload"},
            {status: 400},
        );
    }
}