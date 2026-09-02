import "server-only";

import {and, eq} from "drizzle-orm";
import {db} from "@/db";

import {routines, type Routine} from "@/db/schema";

type RoutineValues = {
    name: string;
    description?: string | null;
};

function normalizeRoutineValues(values: RoutineValues) {
    const name = values.name.trim();
    const description = values.description?.trim() || null;

    if (!name) {
        throw new Error("Routine name is required");
    }

    return {
        name,
        description,
    };
}

export async function getRoutinesByUserId(
    userId: string,
): Promise<Routine[]> {
    return db
        .select()
        .from(routines)
        .where(eq(routines.userId, userId));
}

export async function getRoutineByIdForUser(routineId: string, userId: string) {
    const [routine] = await db
        .select()
        .from(routines)
        .where(
            and(
                eq(routines.id, routineId),
                eq(routines.userId, userId),
            ),
        )
        .limit(1);

    return routine ?? null;
}

export async function createRoutineForUser(userId: string, values: RoutineValues) {
    const normalisedValues = normalizeRoutineValues(values);

    const [routine] = await db
        .insert(routines)
        .values({
            userId,
            ...normalisedValues
        })
        .returning();

    return routine;
}

export async function updateRoutineForUser(routineId:string, userId:string, values: RoutineValues) {
    const normalisedValues = normalizeRoutineValues(values);

    const [routine] = await db
        .update(routines)
        .set({
            ...normalisedValues,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(routines.id, routineId),
                eq(routines.userId, userId),
            ),
        )
        .returning();

    return routine;
}

export async function deleteRoutineForUser(routineId: string, userId: string) {
    const [deletedRoutine] = await db
        .delete(routines)
        .where(
            and(
                eq(routines.id, routineId),
                eq(routines.userId, userId),
            ),
        )
        .returning();

    return deletedRoutine ?? null;
}

export async function activateRoutineForUser(
    routineId: string,
    userId: string,
) {
    const ownedRoutine = await getRoutineByIdForUser(
        routineId,
        userId,
    );

    if (!ownedRoutine) {
        return null;
    }

    const updatedAt = new Date();

    const [, activatedRoutines] = await db.batch([
        db
            .update(routines)
            .set({
                isActive: false,
                updatedAt,
            })
            .where(
                and(
                    eq(routines.userId, userId),
                    eq(routines.isActive, true),
                ),
            ),

        db
            .update(routines)
            .set({
                isActive: true,
                updatedAt,
            })
            .where(
                and(
                    eq(routines.id, routineId),
                    eq(routines.userId, userId),
                ),
            )
            .returning(),
    ]);

    return activatedRoutines[0] ?? null;
}
