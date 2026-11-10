import "server-only";

import {randomUUID} from "node:crypto";

import {db} from "@/db";
import {bodyMeasurements, progressEntries, progressPhotos} from "@/db/schema";
import {and, desc, eq, inArray} from "drizzle-orm";
import type {ProgressEntryRecord, ProgressPhotoView, SaveProgressEntryValues} from "@/types/progress";

export async function createProgressEntryForUser(
    userId: string,
    values: SaveProgressEntryValues,
) {
    if (values.photos.length === 0) {
        throw new Error("At least one progress photo is required");
    }

    const progressEntryId = randomUUID();

    const entryInsert = db
        .insert(progressEntries)
        .values({
            id: progressEntryId,
            userId,
            recordedOn: values.recordedOn,
        })
        .returning();

    const photoInsert = db
        .insert(progressPhotos)
        .values(
            values.photos.map((photo) => ({
                progressEntryId,
                view: photo.view,
                storageKey: photo.storageKey,
            })),
        );

    if (values.weight === null) {
        const [createdEntries] = await db.batch([
            entryInsert,
            photoInsert,
        ]);

        return createdEntries[0] ?? null;
    }

    const measurementUpsert = db
        .insert(bodyMeasurements)
        .values({
            userId,
            measuredOn: values.recordedOn,
            weight: values.weight.toString(),
        })
        .onConflictDoUpdate({
            target: [
                bodyMeasurements.userId,
                bodyMeasurements.measuredOn,
            ],
            set: {
                weight: values.weight.toString(),
                updatedAt: new Date(),
            },
        });

    const [createdEntries] = await db.batch([
        entryInsert,
        photoInsert,
        measurementUpsert,
    ]);

    return createdEntries[0] ?? null;
}

export async function getProgressEntriesForUser(
    userId: string,
): Promise<ProgressEntryRecord[]> {
    const entries = await db
        .select({
            id: progressEntries.id,
            recordedOn: progressEntries.recordedOn,
            weight: bodyMeasurements.weight,
        })
        .from(progressEntries)
        .leftJoin(
            bodyMeasurements,
            and(
                eq(
                    bodyMeasurements.userId,
                    progressEntries.userId,
                ),
                eq(
                    bodyMeasurements.measuredOn,
                    progressEntries.recordedOn,
                ),
            ),
        )
        .where(eq(progressEntries.userId, userId))
        .orderBy(
            desc(progressEntries.recordedOn),
            desc(progressEntries.createdAt),
        );

    if (entries.length === 0) {
        return [];
    }

    const photoRows = await db
        .select({
            id: progressPhotos.id,
            progressEntryId:
            progressPhotos.progressEntryId,
            view: progressPhotos.view,
        })
        .from(progressPhotos)
        .where(
            inArray(
                progressPhotos.progressEntryId,
                entries.map((entry) => entry.id),
            ),
        );

    const viewOrder: Record<ProgressPhotoView, number> = {
        front: 0,
        side: 1,
        back: 2,
    };

    const photosByEntryId = new Map<
        string,
        ProgressEntryRecord["photos"]
    >();

    for (const photo of photoRows) {
        const entryPhotos =
            photosByEntryId.get(
                photo.progressEntryId,
            ) ?? [];

        entryPhotos.push({
            id: photo.id,
            view: photo.view,
            imageUrl:
                `/api/progress-photos/${photo.id}`,
        });

        photosByEntryId.set(
            photo.progressEntryId,
            entryPhotos,
        );
    }

    return entries.map((entry) => ({
        id: entry.id,
        recordedOn: entry.recordedOn,
        weight:
            entry.weight === null
                ? null
                : Number(entry.weight),
        photos: (
            photosByEntryId.get(entry.id) ?? []
        ).sort(
            (first, second) =>
                viewOrder[first.view] -
                viewOrder[second.view],
        ),
    }));
}

export async function getProgressPhotoForUser(
    photoId: string,
    userId: string,
) {
    const [photo] = await db
        .select({
            id: progressPhotos.id,
            storageKey: progressPhotos.storageKey,
        })
        .from(progressPhotos)
        .innerJoin(
            progressEntries,
            eq(
                progressPhotos.progressEntryId,
                progressEntries.id,
            ),
        )
        .where(
            and(
                eq(progressPhotos.id, photoId),
                eq(progressEntries.userId, userId),
            ),
        )
        .limit(1);

    return photo ?? null;
}

export async function deleteProgressEntryForUser(
    entryId: string,
    userId: string,
) {
    const photoRows = await db
        .select({
            storageKey: progressPhotos.storageKey,
        })
        .from(progressPhotos)
        .innerJoin(
            progressEntries,
            eq(
                progressPhotos.progressEntryId,
                progressEntries.id,
            ),
        )
        .where(
            and(
                eq(progressEntries.id, entryId),
                eq(progressEntries.userId, userId),
            ),
        );

    const [deletedEntry] = await db
        .delete(progressEntries)
        .where(
            and(
                eq(progressEntries.id, entryId),
                eq(progressEntries.userId, userId),
            ),
        )
        .returning({
            id: progressEntries.id,
        });

    if (!deletedEntry) {
        return null;
    }

    return {
        id: deletedEntry.id,
        storageKeys: photoRows.map(
            (photo) => photo.storageKey,
        ),
    };
}