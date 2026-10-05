import "server-only";

import {and, eq, inArray, sql, asc, desc} from "drizzle-orm";
import type {BatchItem} from "drizzle-orm/batch";
import {db} from "@/db";
import {WorkoutTemplate} from "@/db/schema";

import {routines, workoutTemplates, type Routine} from "@/db/schema";
import {randomUUID} from "node:crypto";

type RoutineValues = {
    name: string;
    description?: string | null;
};

type WorkoutValues = {
    id: string;
    name: string;
    position: number;
}

type WorkoutSummary = Pick<
    WorkoutTemplate,
    "id" | "name" | "position"
>;

export type RoutineWithWorkouts = Routine & {
    workouts: WorkoutSummary[];
    workoutCount: number;
}

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

function normalizeWorkoutValues(workouts: WorkoutValues[]) {
    const workoutIds = new Set(workouts.map((workout) => workout.id));

    if (workoutIds.size !== workouts.length) {
        throw new Error("Duplicate workout IDs are not allowed");
    }

    return workouts.map((workout, index) => {
        const name = workout.name.trim();

        if (!name) {
            throw new Error("Workout name is required");
        }

        return {
            id: workout.id,
            name,
            position: index,
        };
    });
}

export async function getRoutinesWithWorkoutsByUserId(
    userId: string,
): Promise<RoutineWithWorkouts[]> {
    const userRoutines = await db
        .select()
        .from(routines)
        .where(eq(routines.userId, userId))
        .orderBy(
            desc(routines.isActive),
            desc(routines.createdAt),
        );

    if (userRoutines.length === 0) {
        return [];
    }

    const routineIds = userRoutines.map(
        (routine) => routine.id,
    );

    const workouts = await db
        .select({
            id: workoutTemplates.id,
            routineId: workoutTemplates.routineId,
            name: workoutTemplates.name,
            position: workoutTemplates.position,
        })
        .from(workoutTemplates)
        .where(
            inArray(
                workoutTemplates.routineId,
                routineIds,
            ),
        )
        .orderBy(
            asc(workoutTemplates.position),
        );

    return userRoutines.map((routine) => {
        const routineWorkouts = workouts.filter(
            (workout) =>
                workout.routineId === routine.id,
        );

        return {
            ...routine,
            workouts: routineWorkouts,
            workoutCount: routineWorkouts.length,
        };
    });
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

export async function createRoutineWithWorkoutsForUser(userId: string, values: RoutineValues, workouts: WorkoutValues[]) {
    const normalisedValues = normalizeRoutineValues(values);
    const routineId = randomUUID();

    const routineInsert = db
        .insert(routines)
        .values({
            id: routineId,
            userId,
            ...normalisedValues
        })
        .returning();

    const workoutRows = normalizeWorkoutValues(workouts).map(
        (workout) => ({
            routineId,
            name: workout.name,
            position: workout.position,
        }),
    );

    if (workoutRows.length === 0) {
        const [routine] = await routineInsert;
        return routine ?? null;
    }

    const [createdRoutines] = await db.batch([
        routineInsert,
        db
            .insert(workoutTemplates)
            .values(workoutRows)
    ]);

    return createdRoutines[0] ?? null;
}

export async function updateRoutineWithWorkoutsForUser(
    routineId: string,
    userId: string,
    values: RoutineValues,
    workouts: WorkoutValues[],
) {
    const ownedRoutine = await getRoutineByIdForUser(
        routineId,
        userId,
    );

    if (!ownedRoutine) {
        return null;
    }

    const normalisedValues = normalizeRoutineValues(values);
    const normalisedWorkouts = normalizeWorkoutValues(workouts);

    const existingWorkouts = await db
        .select()
        .from(workoutTemplates)
        .where(
            eq(workoutTemplates.routineId, routineId),
        );

    const existingWorkoutsById = new Map(
        existingWorkouts.map((workout) => [workout.id, workout]),
    );
    const submittedWorkoutIds = new Set(
        normalisedWorkouts.map((workout) => workout.id),
    );

    const workoutsToUpdate = normalisedWorkouts.filter((workout) =>
        existingWorkoutsById.has(workout.id),
    );
    const workoutsToInsert = normalisedWorkouts.filter((workout) =>
        !existingWorkoutsById.has(workout.id),
    );
    const workoutIdsToDelete = existingWorkouts
        .filter((workout) => !submittedWorkoutIds.has(workout.id))
        .map((workout) => workout.id);

    const updatedAt = new Date();
    const routineUpdate = db
        .update(routines)
        .set({
            ...normalisedValues,
            updatedAt,
        })
        .where(
            and(
                eq(routines.id, routineId),
                eq(routines.userId, userId),
            ),
        )
        .returning();

    const queries: [typeof routineUpdate, ...BatchItem<"pg">[]] = [
        routineUpdate,
    ];

    // Move saved workouts out of the final position range first. This avoids
    // unique-position conflicts when two workouts swap places.
    if (existingWorkouts.length > 0) {
        const highestPosition = Math.max(
            ...existingWorkouts.map((workout) => workout.position),
        );
        const temporaryPositionOffset =
            highestPosition + normalisedWorkouts.length + 1;

        queries.push(
            db
                .update(workoutTemplates)
                .set({
                    position: sql`${workoutTemplates.position} + ${temporaryPositionOffset}`,
                    updatedAt,
                })
                .where(eq(workoutTemplates.routineId, routineId)),
        );
    }

    if (workoutIdsToDelete.length > 0) {
        queries.push(
            db
                .delete(workoutTemplates)
                .where(
                    and(
                        eq(workoutTemplates.routineId, routineId),
                        inArray(workoutTemplates.id, workoutIdsToDelete),
                    ),
                ),
        );
    }

    for (const workout of workoutsToUpdate) {
        queries.push(
            db
                .update(workoutTemplates)
                .set({
                    name: workout.name,
                    position: workout.position,
                    updatedAt,
                })
                .where(
                    and(
                        eq(workoutTemplates.id, workout.id),
                        eq(workoutTemplates.routineId, routineId),
                    ),
                ),
        );
    }

    if (workoutsToInsert.length > 0) {
        queries.push(
            db
                .insert(workoutTemplates)
                .values(
                    workoutsToInsert.map((workout) => ({
                        routineId,
                        name: workout.name,
                        position: workout.position,
                    })),
                ),
        );
    }

    const results = await db.batch(queries);
    const updatedRoutines = results[0] as Routine[];

    return updatedRoutines[0] ?? null;
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
