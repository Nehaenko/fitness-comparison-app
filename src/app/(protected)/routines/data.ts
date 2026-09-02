import "server-only";

import { auth } from "@/auth";
import {
    getRoutineByIdForUser,
    getRoutinesByUserId,
} from "@/db/routines";
import type { Routine } from "@/db/schema";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function getAuthenticatedRoutines(): Promise<Routine[]> {
    const userId = await requireAuthenticatedUserId();

    return getRoutinesByUserId(userId);
}

export async function getAuthenticatedRoutineById(
    routineId: string,
) {
    const userId = await requireAuthenticatedUserId();

    return getRoutineByIdForUser(routineId, userId);
}
