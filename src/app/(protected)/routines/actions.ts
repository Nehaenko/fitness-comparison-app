"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {auth} from "@/auth";
import {activateRoutineForUser, createRoutineWithWorkoutsForUser, deleteRoutineForUser, updateRoutineWithWorkoutsForUser,} from "@/db/routines";
import {getProfileByUserId} from "@/db/profile";
import {weightToKilograms} from "@/helpers/weight-conversion";
import type {WeightUnit} from "@/types/profile";

const MAX_WORKOUTS = 10;
const MAX_EXERCISES_PER_WORKOUT = 50;
const MAX_ROUTINE_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1_000;
const MAX_WORKOUT_NAME_LENGTH = 100;
const MAX_SETS = 100;
const MAX_TARGET_REPS = 1_000;
const MAX_REST_SECONDS = 86_400;
const MAX_TARGET_WEIGHT = 999_999.99;

type ExerciseValues = {
    id: string;
    exerciseId: string;
    sets: number;
    targetReps: number;
    targetWeight: number | null;
    restSeconds: number;
    position: number;
};

type SubmittedExercise = Omit<ExerciseValues, "position">;

type SubmittedWorkout = {
    id: string;
    name: string;
    exercises: SubmittedExercise[];
};

type Workout = {
    id: string;
    name: string;
    position: number;
    exercises: ExerciseValues[];
};

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
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

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

async function getUserWeightUnit(userId: string): Promise<WeightUnit> {
    const profile = await getProfileByUserId(userId);

    return profile?.weightUnit ?? "kg";
}

function validateRoutineId(routineId: string) {
    if (!uuidPattern.test(routineId)) {
        throw new Error("Invalid routine");
    }
}

function getRoutineValues(formData: FormData) {
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

    return {
        name,
        description,
    };
}

function getRoutineWorkoutsData(
    formData: FormData,
    weightUnit: WeightUnit,
): Workout[] {
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
        exercises: workout.exercises.map((exercise, exerciseIndex: number) => ({
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

export async function createRoutineAction(formData: FormData) {
    const userId = await requireAuthenticatedUserId();
    const weightUnit = await getUserWeightUnit(userId);
    const values = getRoutineValues(formData);
    const workouts = getRoutineWorkoutsData(formData, weightUnit);

    const routine = await createRoutineWithWorkoutsForUser(userId, values, workouts);

    if (!routine) {
        throw new Error("Unable to create routine");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
    redirect("/routines");
}

export async function updateRoutineAction(
    routineId: string,
    formData: FormData,
) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const weightUnit = await getUserWeightUnit(userId);
    const values = getRoutineValues(formData);
    const workouts = getRoutineWorkoutsData(formData, weightUnit);
    const routine = await updateRoutineWithWorkoutsForUser(
        routineId,
        userId,
        values,
        workouts,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath(`/routines/${routineId}/edit`);
    revalidatePath("/dashboard");

    redirect("/routines");
}

export async function deleteRoutineAction(routineId: string) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const routine = await deleteRoutineForUser(
        routineId,
        userId,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
}

export async function activateRoutineAction(routineId: string) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const routine = await activateRoutineForUser(
        routineId,
        userId,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
}
