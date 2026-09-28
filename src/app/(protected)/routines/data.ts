import "server-only";

import { auth } from "@/auth";
import {
    getRoutineByIdForUser,
    getRoutinesWithWorkoutCountByUserId,
    RoutineWithWorkoutCount,
} from "@/db/routines";
import {getWorkoutTemplatesByRoutineId} from "@/db/workoutTemplates";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function getAuthenticatedRoutines(): Promise<RoutineWithWorkoutCount[]> {
    const userId = await requireAuthenticatedUserId();

    return getRoutinesWithWorkoutCountByUserId(userId);
}

export async function getAuthenticatedRoutineById(
    routineId: string,
) {
    const userId = await requireAuthenticatedUserId();

    return getRoutineByIdForUser(routineId, userId);
}

export async function getAuthenticatedRoutineWithWorkouts(routineId: string) {
    const userId = await requireAuthenticatedUserId();
    const routine = await getRoutineByIdForUser(
        routineId,
        userId
    )

    if (!routine) {
        return null;
    }

    const workouts = await getWorkoutTemplatesByRoutineId(routineId, userId);

    return {
        routine, workouts
    }
}