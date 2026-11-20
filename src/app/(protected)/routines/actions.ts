"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {auth} from "@/auth";
import {activateRoutineForUser, createRoutineWithWorkoutsForUser, deleteRoutineForUser, updateRoutineWithWorkoutsForUser,} from "@/db/routines";
import {getProfileByUserId} from "@/db/profile";
import {
    canUserUseExercises,
    createCustomExerciseForUser,
} from "@/db/exercises";
import type {WeightUnit} from "@/types/profile";
import type {ExerciseOption} from "@/types/routine-builder";
import {
    getCustomExerciseValues,
    getRoutineValues,
    getRoutineWorkoutsData,
    validateRoutineId,
} from "@/validation/routines";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

function isUniqueConstraintError(error: unknown) {
    return typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "23505";
}

export async function createCustomExerciseAction(
    input: unknown,
): Promise<
    | {success: true; exercise: ExerciseOption}
    | {success: false; error: string}
> {
    try {
        const userId = await requireAuthenticatedUserId();
        const values = getCustomExerciseValues(input);
        const exercise = await createCustomExerciseForUser(
            userId,
            values,
        );

        if (!exercise) {
            throw new Error("Unable to create exercise");
        }

        revalidatePath("/routines");
        return {success: true, exercise};
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            return {
                success: false,
                error: "You already have an exercise with this name",
            };
        }

        return {
            success: false,
            error: error instanceof Error
                ? error.message
                : "Unable to create exercise",
        };
    }
}

async function validateExerciseAccess(
    userId: string,
    workouts: ReturnType<typeof getRoutineWorkoutsData>,
) {
    const exerciseIds = workouts.flatMap((workout) =>
        workout.exercises.map((exercise) => exercise.exerciseId),
    );

    if (!await canUserUseExercises(userId, exerciseIds)) {
        throw new Error("One or more exercises are unavailable");
    }
}

async function getUserWeightUnit(userId: string): Promise<WeightUnit> {
    const profile = await getProfileByUserId(userId);

    return profile?.weightUnit ?? "kg";
}

export async function createRoutineAction(formData: FormData) {
    const userId = await requireAuthenticatedUserId();
    const weightUnit = await getUserWeightUnit(userId);
    const values = getRoutineValues(formData);
    const workouts = getRoutineWorkoutsData(formData, weightUnit);
    await validateExerciseAccess(userId, workouts);

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
    await validateExerciseAccess(userId, workouts);
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
