import "server-only"

import {and, eq, inArray, isNull, or} from "drizzle-orm";
import {randomUUID} from "node:crypto";
import {db} from "@/db";

import {
    exercises,
    routines,
    workoutSessionExercises,
    workoutSessions,
    workoutSessionSets,
    workoutTemplateExercises,
    workoutTemplates,
} from "@/db/schema";

import type {CompletedWorkoutValues} from "@/types/workout-session";

export async function createWorkoutSessionForUser(
    userId: string,
    values: CompletedWorkoutValues,
) {
    const [ownedWorkout] = await db
        .select({
            workoutTemplateId: workoutTemplates.id,
            workoutName: workoutTemplates.name,
            routineId: routines.id,
            routineName: routines.name,
        })
        .from(workoutTemplates)
        .innerJoin(
            routines,
            eq(workoutTemplates.routineId, routines.id),
        )
        .where(
            and(
                eq(
                    workoutTemplates.id,
                    values.workoutTemplateId,
                ),
                eq(routines.userId, userId),
            ),
        )
        .limit(1);

    if (!ownedWorkout) {
        return null;
    }

    const submittedExerciseIds = values.exercises.map((exercise) => exercise.workoutTemplateExerciseId);

    if (
        new Set(submittedExerciseIds).size !==
        submittedExerciseIds.length
    ) {
        throw new Error("Duplicate workout exercises");
    }

    const configuredExercises = await db
        .select({
            id: workoutTemplateExercises.id,
        })
        .from(workoutTemplateExercises)
        .where(
            and(
                eq(
                    workoutTemplateExercises.workoutTemplateId,
                    ownedWorkout.workoutTemplateId,
                ),
                inArray(
                    workoutTemplateExercises.id,
                    submittedExerciseIds,
                )
            )
        );

    const configuredExercisesById = new Map(
        configuredExercises.map((exercise) => [
            exercise.id,
            exercise
        ])
    )

    const completedExerciseIds = [
        ...new Set(
            values.exercises.map((exercise) => exercise.exerciseId),
        ),
    ];
    const allowedExercises = await db
        .select({
            id: exercises.id,
            name: exercises.name,
        })
        .from(exercises)
        .where(
            and(
                inArray(exercises.id, completedExerciseIds),
                or(
                    isNull(exercises.userId),
                    eq(exercises.userId, userId),
                ),
            ),
        );
    const allowedExercisesById = new Map(
        allowedExercises.map((exercise) => [exercise.id, exercise]),
    );

    const workoutSessionId = randomUUID();

    const sessionRow: typeof workoutSessions.$inferInsert = {
        id: workoutSessionId,
        userId,
        routineId: ownedWorkout.routineId,
        workoutTemplateId: ownedWorkout.workoutTemplateId,
        routineName: ownedWorkout.routineName,
        workoutName: ownedWorkout.workoutName,
        startedAt: values.startedAt,
        completedAt: values.completedAt,
        durationSeconds: values.durationSeconds,
    };

    const sessionExerciseRows: (
        typeof workoutSessionExercises.$inferInsert
        )[] = [];

    const sessionSetRows: (
        typeof workoutSessionSets.$inferInsert
        )[] = [];

    for (const completedExercise of values.exercises) {
        const configuredExercise = configuredExercisesById.get(
            completedExercise.workoutTemplateExerciseId,
        );
        const completedExerciseDetails = allowedExercisesById.get(
            completedExercise.exerciseId,
        );

        if (!configuredExercise || !completedExerciseDetails) {
            throw new Error("Incorrect workout exercise");
        }

        const sessionExerciseId = randomUUID();

        sessionExerciseRows.push({
            id: sessionExerciseId,
            workoutSessionId,
            workoutTemplateExerciseId: configuredExercise.id,
            exerciseId: completedExerciseDetails.id,
            exerciseName: completedExerciseDetails.name,
            position: completedExercise.position,
        });

        for (const completedSet of completedExercise.sets) {
            sessionSetRows.push({
                workoutSessionExerciseId: sessionExerciseId,
                position: completedSet.position,
                weight: completedSet.weight === null ? null : completedSet.weight.toString(),
                reps: completedSet.reps,
            });
        }
    }

    const [createSessions] = await db.batch([
        db
            .insert(workoutSessions)
            .values(sessionRow)
            .returning(),

        db
            .insert(workoutSessionExercises)
            .values(sessionExerciseRows),

        db
            .insert(workoutSessionSets)
            .values(sessionSetRows),
    ]);

    return createSessions[0] ?? null;
}
