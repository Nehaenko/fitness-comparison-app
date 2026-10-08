import "server-only";

import { auth } from "@/auth";
import {
    getRoutinesWithWorkoutsByUserId,
} from "@/db/routines";
import type {RoutineWithWorkouts} from "@/types/routine-builder";

import {getRoutineWithWorkoutsForUser} from "@/db/workoutTemplates";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function getAuthenticatedRoutines():
    Promise<RoutineWithWorkouts[]> {
    const userId =
        await requireAuthenticatedUserId();

    return getRoutinesWithWorkoutsByUserId(userId);
}

export async function getAuthenticatedRoutineWithWorkouts(routineId: string) {
    const userId = await requireAuthenticatedUserId();

    return getRoutineWithWorkoutsForUser(routineId, userId);
}