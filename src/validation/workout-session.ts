import type {CompletedWorkoutValues} from "@/types/workout-session";

const MAX_EXERCISES = 50;
const MAX_SETS = 100;
const MAX_REPS = 1_000;
const MAX_WEIGHT = 999_999.99;
const MAX_DURATION_SECONDS = 86_400;

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function getCompletedWorkoutValues(value: unknown): CompletedWorkoutValues {
    if (
        !isRecord(value) ||
        typeof value.workoutTemplateId !== "string" ||
        !uuidPattern.test(value.workoutTemplateId) ||
        typeof value.startedAt !== "number" ||
        !Number.isFinite(value.startedAt) ||
        !Number.isInteger(value.startedAt) ||
        !Array.isArray(value.exercises) ||
        value.exercises.length > MAX_EXERCISES
    ) {
        throw new Error("Invalid workout session");
    }

    const completedAt = new Date();
    const startedAt = new Date(value.startedAt);
    const durationSeconds = Math.floor(
        (completedAt.getTime() - startedAt.getTime()) / 1000,
    );

    if (
        Number.isNaN(startedAt.getTime()) ||
        durationSeconds < 0 ||
        durationSeconds > MAX_DURATION_SECONDS
    ) {
        throw new Error("Invalid workout duration");
    }

    const exercises: CompletedWorkoutValues["exercises"] = [];

    for (const [exerciseIndex, exercise] of value.exercises.entries()) {
        if (!isRecord(exercise)) {
            throw new Error("Invalid workout exercise");
        }

        if (
            typeof exercise.workoutTemplateExerciseId !== "string" ||
            !uuidPattern.test(exercise.workoutTemplateExerciseId) ||
            typeof exercise.exerciseId !== "string" ||
            !uuidPattern.test(exercise.exerciseId) ||
            !Array.isArray(exercise.sets) ||
            exercise.sets.length > MAX_SETS
        ) {
            throw new Error("Invalid workout exercise");
        }

        const completedSets: CompletedWorkoutValues[
            "exercises"
            ][number]["sets"] = [];

        for (const [setIndex, set] of exercise.sets.entries()) {
            if (!isRecord(set) || typeof set.completed !== "boolean") {
                throw new Error("Invalid workout set");
            }

            if (!set.completed) {
                continue;
            }

            if (
                typeof set.reps !== "number" ||
                !Number.isInteger(set.reps) ||
                set.reps < 1 ||
                set.reps > MAX_REPS
            ) {
                throw new Error("Invalid completed set reps");
            }

            let weight: number | null;

            if (set.weight === null) {
                weight = null;
            } else if (
                typeof set.weight === "number" &&
                Number.isFinite(set.weight) &&
                set.weight >= 0 &&
                set.weight <= MAX_WEIGHT
            ) {
                weight = set.weight;
            } else {
                throw new Error("Invalid completed set weight");
            }

            completedSets.push({
                weight,
                reps: set.reps,
                position: setIndex,
            });
        }

        if (completedSets.length > 0) {
            exercises.push({
                workoutTemplateExerciseId: exercise.workoutTemplateExerciseId,
                exerciseId: exercise.exerciseId,
                position: exerciseIndex,
                sets: completedSets,
            })
        }
    }

    if (exercises.length === 0) {
        throw new Error("Complete at least one set");
    }

    return {
        workoutTemplateId: value.workoutTemplateId,
        startedAt,
        completedAt,
        durationSeconds,
        exercises,
    }
}