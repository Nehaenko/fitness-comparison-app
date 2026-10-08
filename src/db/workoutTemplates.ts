import "server-only"

import {asc, eq, inArray, and} from "drizzle-orm";

import {db} from "@/db";
import {
    routines,
    exercises,
    workoutTemplates,
    workoutTemplateExercises,
} from "@/db/schema";
import {getRoutineByIdForUser} from "@/db/routines";
import type {ConfiguredExercise, Workout, WorkoutTemplateWithExercises} from "@/types/routine-builder";

async function getWorkoutTemplatesByRoutineId(
    routineId: string,
): Promise<WorkoutTemplateWithExercises[]> {
    const workouts = await db
        .select()
        .from(workoutTemplates)
        .where(
            eq(workoutTemplates.routineId, routineId),
        )
        .orderBy(
            asc(workoutTemplates.position),
        );

    if (workouts.length === 0) {
        return [];
    }

    const configuredExercises = await db
        .select({
            id: workoutTemplateExercises.id,
            workoutTemplateId:
                workoutTemplateExercises.workoutTemplateId,
            exerciseId: workoutTemplateExercises.exerciseId,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
            sets: workoutTemplateExercises.sets,
            targetReps: workoutTemplateExercises.targetReps,
            targetWeight: workoutTemplateExercises.targetWeight,
            restSeconds: workoutTemplateExercises.restSeconds,
        })
        .from(workoutTemplateExercises)
        .innerJoin(
            exercises,
            eq(
                workoutTemplateExercises.exerciseId,
                exercises.id,
            ),
        )
        .where(
            inArray(
                workoutTemplateExercises.workoutTemplateId,
                workouts.map((workout) => workout.id),
            ),
        )
        .orderBy(
            asc(workoutTemplateExercises.position),
        );

    const exercisesByWorkoutId = new Map<string, ConfiguredExercise[]>();

    for (const exercise of configuredExercises) {
        const workoutExercises = exercisesByWorkoutId.get(
            exercise.workoutTemplateId,
        ) ?? [];

        workoutExercises.push({
            id: exercise.id,
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            sets: exercise.sets,
            targetReps: exercise.targetReps,
            targetWeight: exercise.targetWeight === null
                ? null
                : Number(exercise.targetWeight),
            restSeconds: exercise.restSeconds,
        });
        exercisesByWorkoutId.set(
            exercise.workoutTemplateId,
            workoutExercises,
        );
    }

    return workouts.map((workout) => ({
        ...workout,
        exercises: exercisesByWorkoutId.get(workout.id) ?? [],
    }));
}

export async function getRoutineWithWorkoutsForUser(
    routineId: string,
    userId: string,
) {
    const routine = await getRoutineByIdForUser(routineId, userId);

    if (!routine) {
        return null;
    }

    const workouts = await getWorkoutTemplatesByRoutineId(routineId);

    return {routine, workouts};
}

export async function getWorkoutWithExercisesForUser(
    workoutId: string,
    userId: string,
): Promise<Workout | null> {
    const [workout] = await db
        .select({
            id: workoutTemplates.id,
            name: workoutTemplates.name,
        })
        .from(workoutTemplates)
        .innerJoin(
            routines,
            eq(workoutTemplates.routineId, routines.id),
        )
        .where(
            and(
                eq(workoutTemplates.id, workoutId),
                eq(routines.userId, userId),
            ),
        )
        .limit(1);

    if (!workout) {
        return null;
    }

    const configuredExercises = await db
        .select({
            id: workoutTemplateExercises.id,
            exerciseId: workoutTemplateExercises.exerciseId,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
            sets: workoutTemplateExercises.sets,
            targetReps: workoutTemplateExercises.targetReps,
            targetWeight: workoutTemplateExercises.targetWeight,
            restSeconds: workoutTemplateExercises.restSeconds,
        })
        .from(workoutTemplateExercises)
        .innerJoin(
            exercises,
            eq(
                workoutTemplateExercises.exerciseId,
                exercises.id,
            ),
        )
        .where(
            eq(
                workoutTemplateExercises.workoutTemplateId,
                workoutId,
            ),
        )
        .orderBy(asc(workoutTemplateExercises.position));

    return {
        ...workout,
        exercises: configuredExercises.map((exercise) => ({
            ...exercise,
            targetWeight:
                exercise.targetWeight === null
                    ? null
                    : Number(exercise.targetWeight),
        })),
    };
};