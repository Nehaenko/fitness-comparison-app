import "server-only"

import {db} from "@/db";
import {desc, eq, count} from "drizzle-orm";

import {workoutSessions, workoutSessionExercises} from "@/db/schema";

import type {WorkoutHistorySummary} from "@/types/history";

export async function getWorkoutHistorySummariesForUser(
    userId: string,
    limit: number,
): Promise<WorkoutHistorySummary[]> {
    const histories = await db
        .select({
            id: workoutSessions.id,
            workoutName: workoutSessions.workoutName,
            completedAt: workoutSessions.completedAt,
            durationSeconds: workoutSessions.durationSeconds,
            exerciseCount: count(workoutSessionExercises.id),
        })
        .from(workoutSessions)
        .leftJoin(
            workoutSessionExercises,
            eq(
                workoutSessionExercises.workoutSessionId,
                workoutSessions.id,
            ),
        )
        .where(eq(workoutSessions.userId, userId))
        .groupBy(
            workoutSessions.id,
            workoutSessions.workoutName,
            workoutSessions.completedAt,
            workoutSessions.durationSeconds,
        )
        .orderBy(
            desc(workoutSessions.completedAt),
            desc(workoutSessions.id),
        )
        .limit(limit);

    return histories;
}