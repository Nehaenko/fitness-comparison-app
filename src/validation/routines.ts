import {weightToKilograms} from "@/helpers/weight-conversion";
import type {WeightUnit} from "@/types/profile";
import type {WorkoutValues} from "@/types/routine-builder";

const MAX_WORKOUTS = 10;
const MAX_EXERCISES_PER_WORKOUT = 50;
const MAX_ROUTINE_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MAX_WORKOUT_NAME_LENGTH = 100;
const MAX_SETS = 100;
const MAX_TARGET_REPS = 1_000;
const MAX_REST_SECONDS = 86_400;
const MAX_TARGET_WEIGHT = 999_999.99;
const MAX_EXERCISE_NAME_LENGTH = 100;
const MAX_EXERCISE_DETAIL_LENGTH = 60;

export type CustomExerciseInput = {
    name: string;
    type: "strength" | "cardio";
    muscleGroup: string;
    equipment: string;
};

type SubmittedExercise = Omit<
    WorkoutValues["exercises"][number],
    "position"
>;

type SubmittedWorkout = {
    id: string;
    name: string;
    exercises: SubmittedExercise[];
};

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function getCustomExerciseValues(input: unknown) {
    if (!isRecord(input)) {
        throw new Error("Invalid exercise details");
    }

    const name = typeof input.name === "string"
        ? input.name.trim()
        : "";
    const type = input.type;
    const muscleGroup = typeof input.muscleGroup === "string"
        ? input.muscleGroup.trim()
        : "";
    const equipment = typeof input.equipment === "string"
        ? input.equipment.trim()
        : "";

    if (
        name.length === 0 ||
        name.length > MAX_EXERCISE_NAME_LENGTH
    ) {
        throw new Error("Exercise name is required");
    }

    if (type !== "strength" && type !== "cardio") {
        throw new Error("Select an exercise type");
    }

    if (
        type === "strength" &&
        (
            muscleGroup.length === 0 ||
            muscleGroup.length > MAX_EXERCISE_DETAIL_LENGTH
        )
    ) {
        throw new Error("Muscle group is required");
    }

    if (equipment.length > MAX_EXERCISE_DETAIL_LENGTH) {
        throw new Error("Equipment is too long");
    }

    return {
        name,
        muscleGroup: type === "cardio" ? "cardio" : muscleGroup,
        equipment: equipment.length === 0 ? null : equipment,
    };
}

function isIntegerInRange(value: unknown, minimum: number, maximum: number) {
    return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= minimum &&
        value <= maximum
    );
}

function isSubmittedExercise(value: unknown): value is SubmittedExercise {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        uuidPattern.test(value.id) &&
        typeof value.exerciseId === "string" &&
        uuidPattern.test(value.exerciseId) &&
        isIntegerInRange(value.sets, 1, MAX_SETS) &&
        isIntegerInRange(value.targetReps, 1, MAX_TARGET_REPS) &&
        (
            value.targetWeight === null ||
            (
                typeof value.targetWeight === "number" &&
                Number.isFinite(value.targetWeight) &&
                value.targetWeight >= 0 &&
                value.targetWeight <= MAX_TARGET_WEIGHT
            )
        ) &&
        isIntegerInRange(value.restSeconds, 0, MAX_REST_SECONDS)
    );
}

function isSubmittedWorkout(value: unknown): value is SubmittedWorkout {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        uuidPattern.test(value.id) &&
        typeof value.name === "string" &&
        value.name.trim().length > 0 &&
        value.name.trim().length <= MAX_WORKOUT_NAME_LENGTH &&
        Array.isArray(value.exercises) &&
        value.exercises.length <= MAX_EXERCISES_PER_WORKOUT &&
        value.exercises.every(isSubmittedExercise)
    );
}

export function validateRoutineId(routineId: string) {
    if (!uuidPattern.test(routineId)) {
        throw new Error("Invalid routine");
    }
}

export function getRoutineValues(formData: FormData) {
    const name = formData.get("name");
    const description = formData.get("description");

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        name.trim().length > MAX_ROUTINE_NAME_LENGTH
    ) {
        throw new Error("Routine name is required");
    }

    if (
        description !== null &&
        (
            typeof description !== "string" ||
            description.length > MAX_DESCRIPTION_LENGTH
        )
    ) {
        throw new Error("Invalid routine description");
    }

    return {name, description};
}

export function getRoutineWorkoutsData(
    formData: FormData,
    weightUnit: WeightUnit,
): WorkoutValues[] {
    const rawWorkouts = formData.get("workouts");

    if (typeof rawWorkouts !== "string") {
        throw new Error("Routine workouts are missing or invalid");
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(rawWorkouts);
    } catch {
        throw new Error("Invalid workout data");
    }

    if (
        !Array.isArray(parsed) ||
        parsed.length > MAX_WORKOUTS ||
        !parsed.every(isSubmittedWorkout)
    ) {
        throw new Error("Invalid workout data");
    }

    const workoutIds = parsed.map((workout) => workout.id);
    const configuredExerciseIds = parsed.flatMap((workout) =>
        workout.exercises.map((exercise) => exercise.id),
    );

    if (
        new Set(workoutIds).size !== workoutIds.length ||
        new Set(configuredExerciseIds).size !== configuredExerciseIds.length
    ) {
        throw new Error("Duplicate builder IDs are not allowed");
    }

    return parsed.map((workout, index) => ({
        id: workout.id,
        name: workout.name,
        position: index,
        exercises: workout.exercises.map((exercise, exerciseIndex) => ({
            id: exercise.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            targetReps: exercise.targetReps,
            targetWeight: exercise.targetWeight === null
                ? null
                : weightToKilograms(exercise.targetWeight, weightUnit),
            restSeconds: exercise.restSeconds,
            position: exerciseIndex,
        })),
    }));
}
