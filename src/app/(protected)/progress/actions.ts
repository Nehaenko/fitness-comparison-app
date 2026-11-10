"use server";

import {del, head} from "@vercel/blob";
import {revalidatePath} from "next/cache";

import {auth} from "@/auth";
import {createProgressEntryForUser, deleteProgressEntryForUser} from "@/db/progress";
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

    if (values.weight !== null) {
        revalidatePath("/measurements");
        revalidatePath("/dashboard");
    }

    return {
        id: savedEntry.id,
        recordedOn: savedEntry.recordedOn,
    };
}

export async function deleteProgressAction(progressId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            progressId,
        )
    ) {
        throw new Error("Invalid progress entry");
    }

    const deletedEntry =
        await deleteProgressEntryForUser(progressId, session.user.id);

    if (!deletedEntry) {
        throw new Error(
            "Progress entry not found or cannot be removed",
        );
    }

    if (deletedEntry.storageKeys.length > 0) {
        try {
            await del(deletedEntry.storageKeys);
        } catch (cleanupError) {
            // The user-facing record is already deleted. Keep the action
            // successful and report the orphaned Blob cleanup for monitoring.
            console.error(
                "Unable to remove progress photo blobs",
                cleanupError,
            );
        }
    }

    revalidatePath("/progress");

    return {
        id: deletedEntry.id,
    };
}
