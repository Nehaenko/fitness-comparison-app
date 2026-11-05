"use server";

import {head} from "@vercel/blob";
import {revalidatePath} from "next/cache";

import {auth} from "@/auth";
import {createProgressEntryForUser} from "@/db/progress";
import {getProfileByUserId} from "@/db/profile";
import type {ProgressEntrySaveInputValues} from "@/types/progress";
import {getProgressEntrySaveValues} from "@/validation/progress";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

export async function saveProgressEntryAction(
    input: ProgressEntrySaveInputValues,
) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const profile = await getProfileByUserId(
        session.user.id,
    );

    const values = getProgressEntrySaveValues(
        input,
        session.user.id,
        profile?.weightUnit ?? "kg",
    );

    await Promise.all(
        values.photos.map(async (photo) => {
            const metadata = await head(
                photo.storageKey,
            );

            if (
                metadata.pathname !== photo.storageKey ||
                metadata.size === 0 ||
                metadata.size > MAX_PHOTO_SIZE ||
                !ALLOWED_PHOTO_TYPES.has(
                    metadata.contentType,
                )
            ) {
                throw new Error(
                    "Invalid uploaded progress photo",
                );
            }
        }),
    );

    const savedEntry =
        await createProgressEntryForUser(
            session.user.id,
            values,
        );

    if (!savedEntry) {
        throw new Error(
            "Unable to save progress entry",
        );
    }

    revalidatePath("/progress");

    return {
        id: savedEntry.id,
        recordedOn: savedEntry.recordedOn,
    };
}