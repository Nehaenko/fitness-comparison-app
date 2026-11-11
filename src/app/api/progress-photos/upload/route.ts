import {issueSignedToken} from "@vercel/blob";
import {
    handleUploadPresigned,
    type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import {NextResponse} from "next/server";

import {auth} from "@/auth";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export async function POST(
    request: Request,
): Promise<NextResponse> {
    const body = await request.json() as HandleUploadPresignedBody;

    try {
        const response = await handleUploadPresigned({
            body, request,

            getSignedToken: async (pathname) => {
                const session = await auth();

                if (!session?.user?.id) {
                    throw new Error("Unauthorized");
                }

                const expectedPrefix = `progress-photos/${session.user.id}/`;

                if (!pathname.startsWith(expectedPrefix)) {
                    throw new Error("invalid upload path");
                }

                return {
                    token: await issueSignedToken({
                        pathname,
                        operations: ["put"],
                        allowedContentTypes: ALLOWED_PHOTO_TYPES,
                        maximumSizeInBytes: MAX_PHOTO_SIZE,
                    }),
                    urlOptions: {
                        allowedContentTypes: ALLOWED_PHOTO_TYPES,
                        maximumSizeInBytes: MAX_PHOTO_SIZE,
                        addRandomSuffix: true,
                    },
                };
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
