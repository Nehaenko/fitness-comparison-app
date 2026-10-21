import "server-only";

import {auth} from "@/auth";
import {getCompletedWorkoutCountForUserBetween, getWorkoutHistorySummariesForUser, getWorkoutHistoryDetailForUser} from "@/db/workoutHistory";
import type {DashboardWorkoutHistory, WorkoutHistorySummary, WorkoutHistoryDetail} from "@/types/history";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function getAuthenticatedDashboardWorkoutHistory(
    startDate: Date,
    endDate: Date,
):Promise<DashboardWorkoutHistory> {
    const userId = await requireAuthenticatedUserId();

    const [recentWorkouts, completedThisMonth] =
        await Promise.all([
            getWorkoutHistorySummariesForUser(userId, 3),
            getCompletedWorkoutCountForUserBetween(
                userId,
                startDate,
                endDate,
            ),
        ]);

    return {
        completedThisMonth,
        recentWorkouts,
    };
}

export async function getAuthenticatedWorkoutHistorySummaries(
    limit: number,
): Promise<WorkoutHistorySummary[]> {
    const userId = await requireAuthenticatedUserId();

    return getWorkoutHistorySummariesForUser(userId, limit);
}

export async function getAuthenticatedWorkoutHistoryDetail(
    sessionId: string,
): Promise<WorkoutHistoryDetail | null> {
    const userId = await requireAuthenticatedUserId();

    return getWorkoutHistoryDetailForUser(sessionId, userId);
}