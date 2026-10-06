"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {auth} from "@/auth";
import {activateRoutineForUser, createRoutineWithWorkoutsForUser, deleteRoutineForUser, updateRoutineWithWorkoutsForUser,} from "@/db/routines";
import {getProfileByUserId} from "@/db/profile";
import type {WeightUnit} from "@/types/profile";
import {
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

async function getUserWeightUnit(userId: string): Promise<WeightUnit> {
    const profile = await getProfileByUserId(userId);

    return profile?.weightUnit ?? "kg";
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
