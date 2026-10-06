import "server-only"

import {asc, eq, inArray} from "drizzle-orm";

import {db} from "@/db";
import {
    exercises,
    workoutTemplates,
    workoutTemplateExercises,
    type WorkoutTemplate,
} from "@/db/schema";
import {getRoutineByIdForUser} from "@/db/routines";
import type {ConfiguredExercise} from "@/types/routine-builder";

type WorkoutTemplateWithExercises = WorkoutTemplate & {
    exercises: ConfiguredExercise[];
};

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
