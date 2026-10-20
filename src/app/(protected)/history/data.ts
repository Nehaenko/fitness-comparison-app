import "server-only";

import {auth} from "@/auth";
import {getWorkoutHistorySummariesForUser} from "@/db/workoutHistory";
import type {WorkoutHistorySummary} from "@/types/history";

export async function getAuthenticatedWorkoutHistorySummaries(
    limit: number,
): Promise<WorkoutHistorySummary[]> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getWorkoutHistorySummariesForUser(
        session.user.id,
        limit,
    );
}