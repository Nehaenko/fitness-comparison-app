import "server-only";

import {and, eq, inArray, sql, asc, desc, count} from "drizzle-orm";
import type {BatchItem} from "drizzle-orm/batch";
import {db} from "@/db";
import {routines, workoutTemplates, workoutTemplateExercises, type Routine} from "@/db/schema";
import {randomUUID} from "node:crypto";
import type {RoutineValues, WorkoutValues, WorkoutSummary, ExerciseValues, RoutineWithWorkouts} from "@/types/routine-builder";

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

function normalizeExerciseValues(
    exercise: ExerciseValues,
    position: number,
) {
    return {
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        targetReps: exercise.targetReps,
        targetWeight: exercise.targetWeight,
        restSeconds: exercise.restSeconds,
        position,
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
            exercises: workout.exercises.map((normalizeExerciseValues)),
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
            exerciseCount: count(workoutTemplateExercises.id),
        })
        .from(workoutTemplates)
        .leftJoin(
            workoutTemplateExercises,
            eq(
                workoutTemplateExercises.workoutTemplateId,
                workoutTemplates.id,
            ),
        )
        .where(inArray(workoutTemplates.routineId, routineIds))
        .groupBy(
            workoutTemplates.id,
            workoutTemplates.routineId,
            workoutTemplates.name,
            workoutTemplates.position,
        )
        .orderBy(asc(workoutTemplates.position));

    const workoutsByRoutineId = new Map<string, WorkoutSummary[]>();

    for (const {routineId, ...workout} of workouts) {
        const routineWorkouts = workoutsByRoutineId.get(routineId) ?? [];
        routineWorkouts.push(workout);
        workoutsByRoutineId.set(routineId, routineWorkouts);
    }

    return userRoutines.map((routine) => {
        const routineWorkouts = workoutsByRoutineId.get(routine.id) ?? [];

        return {
            ...routine,
            workouts: routineWorkouts,
            workoutCount: routineWorkouts.length,
        };
    });
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
    const normalisedWorkouts = normalizeWorkoutValues(workouts);
    const routineId = randomUUID();

    // Query 1: create the routine
    const routineInsert = db
        .insert(routines)
        .values({
            id: routineId,
            userId,
            ...normalisedValues
        })
        .returning();

    // Query 2 data: create the workouts
    const workoutRows = normalisedWorkouts.map((workout) => ({
        id: workout.id,
        routineId,
        name: workout.name,
        position: workout.position,
    }));

    // Query 3 data: create the configured exercises
    const configuredExerciseRows = normalisedWorkouts.flatMap(
        (workout) =>
            workout.exercises.map((exercise) => ({
                ...exercise,
                workoutTemplateId: workout.id,
                targetWeight:
                    exercise.targetWeight === null
                        ? null
                        : exercise.targetWeight.toString(),
            })),
    );

    // A routine is allowed to have no workouts
    if (workoutRows.length === 0) {
        const [routine] = await routineInsert;
        return routine ?? null;
    }

    const queries: [
        typeof routineInsert,
        ...BatchItem<"pg">[],
    ] = [
        routineInsert,

        db
            .insert(workoutTemplates)
            .values(workoutRows),
    ];

    // Drizzle cannot insert an empty array, so only add this
    // query when at least one configured exercise exists.
    if (configuredExerciseRows.length > 0) {
        queries.push(
            db
                .insert(workoutTemplateExercises)
                .values(configuredExerciseRows),
        );
    }

    const results = await db.batch(queries);
    const createdRoutines = results[0] as Routine[];

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

    const existingConfiguredExercises = existingWorkouts.length === 0
        ? []
        : await db
            .select()
            .from(workoutTemplateExercises)
            .where(
                inArray(
                    workoutTemplateExercises.workoutTemplateId,
                    existingWorkouts.map((workout) => workout.id),
                ),
            );

    const existingWorkoutsById = new Map(
        existingWorkouts.map((workout) => [workout.id, workout]),
    );
    const submittedWorkoutIds = new Set(
        normalisedWorkouts.map((workout) => workout.id),
    );

    const submittedExistingWorkouts = normalisedWorkouts.filter((workout) =>
        existingWorkoutsById.has(workout.id),
    );
    const workoutPositionsChanged = submittedExistingWorkouts.some(
        (workout) =>
            existingWorkoutsById.get(workout.id)?.position !== workout.position,
    );
    const workoutsToUpdate = workoutPositionsChanged
        ? submittedExistingWorkouts
        : submittedExistingWorkouts.filter(
            (workout) =>
                existingWorkoutsById.get(workout.id)?.name !== workout.name,
        );
    const workoutsToInsert = normalisedWorkouts.filter((workout) =>
        !existingWorkoutsById.has(workout.id),
    );
    const workoutIdsToDelete = existingWorkouts
        .filter((workout) => !submittedWorkoutIds.has(workout.id))
        .map((workout) => workout.id);
    const configuredExerciseRows = normalisedWorkouts.flatMap(
        (workout) =>
            workout.exercises.map((exercise) => ({
                ...exercise,
                workoutTemplateId: workout.id,
                targetWeight:
                    exercise.targetWeight === null
                        ? null
                        : exercise.targetWeight.toString(),
            })),
    );
    const existingConfiguredExercisesById = new Map(
        existingConfiguredExercises.map((exercise) => [exercise.id, exercise]),
    );
    const submittedConfiguredExerciseIds = new Set(
        configuredExerciseRows.map((exercise) => exercise.id),
    );

    for (const exercise of configuredExerciseRows) {
        const existingExercise = existingConfiguredExercisesById.get(
            exercise.id,
        );

        if (
            existingExercise &&
            existingExercise.workoutTemplateId !== exercise.workoutTemplateId
        ) {
            throw new Error("Configured exercises cannot move between workouts");
        }
    }

    const submittedExistingExercises = configuredExerciseRows.filter(
        (exercise) => existingConfiguredExercisesById.has(exercise.id),
    );
    const configuredExercisePositionsChanged =
        submittedExistingExercises.some(
            (exercise) =>
                existingConfiguredExercisesById.get(exercise.id)?.position !==
                exercise.position,
        );
    const configuredExercisesToUpdate = configuredExercisePositionsChanged
        ? submittedExistingExercises
        : submittedExistingExercises.filter((exercise) => {
            const existingExercise = existingConfiguredExercisesById.get(
                exercise.id,
            );

            return (
                existingExercise?.exerciseId !== exercise.exerciseId ||
                existingExercise.sets !== exercise.sets ||
                existingExercise.targetReps !== exercise.targetReps ||
                (
                    existingExercise.targetWeight === null
                        ? null
                        : Number(existingExercise.targetWeight)
                ) !== (
                    exercise.targetWeight === null
                        ? null
                        : Number(exercise.targetWeight)
                ) ||
                existingExercise.restSeconds !== exercise.restSeconds
            );
        });
    const configuredExercisesToInsert = configuredExerciseRows.filter(
        (exercise) => !existingConfiguredExercisesById.has(exercise.id),
    );
    const configuredExerciseIdsToDelete = existingConfiguredExercises
        .filter(
            (exercise) => !submittedConfiguredExerciseIds.has(exercise.id),
        )
        .map((exercise) => exercise.id);

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
    if (workoutPositionsChanged) {
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

    if (configuredExercisePositionsChanged) {
        const highestExercisePosition = Math.max(
            ...existingConfiguredExercises.map((exercise) => exercise.position),
        );
        const temporaryExercisePositionOffset =
            highestExercisePosition + configuredExerciseRows.length + 1;

        queries.push(
            db
                .update(workoutTemplateExercises)
                .set({
                    position: sql`${workoutTemplateExercises.position} + ${temporaryExercisePositionOffset}`,
                    updatedAt,
                })
                .where(
                    inArray(
                        workoutTemplateExercises.workoutTemplateId,
                        existingWorkouts.map((workout) => workout.id),
                    ),
                ),
        );
    }

    if (configuredExerciseIdsToDelete.length > 0) {
        queries.push(
            db
                .delete(workoutTemplateExercises)
                .where(
                    inArray(
                        workoutTemplateExercises.id,
                        configuredExerciseIdsToDelete,
                    ),
                ),
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
                        id: workout.id,
                        routineId,
                        name: workout.name,
                        position: workout.position,
                    })),
                ),
        );
    }

    for (const exercise of configuredExercisesToUpdate) {
        queries.push(
            db
                .update(workoutTemplateExercises)
                .set({
                    exerciseId: exercise.exerciseId,
                    position: exercise.position,
                    sets: exercise.sets,
                    targetReps: exercise.targetReps,
                    targetWeight: exercise.targetWeight,
                    restSeconds: exercise.restSeconds,
                    updatedAt,
                })
                .where(
                    and(
                        eq(workoutTemplateExercises.id, exercise.id),
                        inArray(
                            workoutTemplateExercises.workoutTemplateId,
                            existingWorkouts.map((workout) => workout.id),
                        ),
                    ),
                ),
        );
    }

    if (configuredExercisesToInsert.length > 0) {
        queries.push(
            db
                .insert(workoutTemplateExercises)
                .values(configuredExercisesToInsert),
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
