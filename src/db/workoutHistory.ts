import "server-only"

import {db} from "@/db";
import {desc, eq, count, and, gte, lt, asc, inArray} from "drizzle-orm";

import {
    workoutSessionExercises,
    workoutSessions,
    workoutSessionSets,
} from "@/db/schema";

import type {
    WorkoutHistoryDetail,
    WorkoutHistorySet,
    WorkoutHistorySummary,
} from "@/types/history";

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

export async function getCompletedWorkoutCountForUserBetween(
    userId: string,
    startDate: Date,
    endDate: Date,
): Promise<number> {
    const [result] = await db
        .select({
            completedCount: count(workoutSessions.id),
        })
        .from(workoutSessions)
        .where(
            and(
                eq(workoutSessions.userId, userId),
                gte(workoutSessions.completedAt, startDate),
                lt(workoutSessions.completedAt, endDate),
            ),
        );

    return result?.completedCount ?? 0;
}

export async function getWorkoutHistoryDetailForUser(
    sessionId: string,
    userId: string,
): Promise<WorkoutHistoryDetail | null> {
    const [historySession] = await db
        .select({
            id: workoutSessions.id,
            routineName: workoutSessions.routineName,
            workoutName: workoutSessions.workoutName,
            startedAt: workoutSessions.startedAt,
            completedAt: workoutSessions.completedAt,
            durationSeconds: workoutSessions.durationSeconds,
        })
        .from(workoutSessions)
        .where(
            and(
                eq(workoutSessions.id, sessionId),
                eq(workoutSessions.userId, userId),
            )
        )
        .limit(1);

    if (!historySession) {
        return null;
    }

    const historyExercises = await db
        .select({
            id: workoutSessionExercises.id,
            exerciseId: workoutSessionExercises.exerciseId,
            exerciseName: workoutSessionExercises.exerciseName,
            position: workoutSessionExercises.position,
        })
        .from(workoutSessionExercises)
        .where(
            eq(
                workoutSessionExercises.workoutSessionId,
                historySession.id,
            ),
        )
        .orderBy(asc(workoutSessionExercises.position));

    if (historyExercises.length === 0) {
        return {
            ...historySession,
            exerciseCount: 0,
            setCount: 0,
            exercises: [],
        };
    }

    const historySets = await db
        .select({
            id: workoutSessionSets.id,
            workoutSessionExerciseId:
                workoutSessionSets.workoutSessionExerciseId,
            position: workoutSessionSets.position,
            weight: workoutSessionSets.weight,
            reps: workoutSessionSets.reps,
        })
        .from(workoutSessionSets)
        .where(
            inArray(
                workoutSessionSets.workoutSessionExerciseId,
                historyExercises.map((exercise) => exercise.id),
            ),
        )
        .orderBy(asc(workoutSessionSets.position));

    const setsByExerciseId = new Map<
        string,
        WorkoutHistorySet[]
    >();

    for (const historySet of historySets) {
        const exerciseSets = setsByExerciseId.get(
            historySet.workoutSessionExerciseId,
        ) ?? [];

        exerciseSets.push({
            id: historySet.id,
            position: historySet.position,
            weight:
                historySet.weight === null
                    ? null
                    : Number(historySet.weight),
            reps: historySet.reps,
        });

        setsByExerciseId.set(
            historySet.workoutSessionExerciseId,
            exerciseSets,
        );
    }

    const exercises = historyExercises.map((exercise) => ({
        ...exercise,
        sets: setsByExerciseId.get(exercise.id) ?? [],
    }));

    return {
        ...historySession,
        exerciseCount: exercises.length,
        setCount: historySets.length,
        exercises,
    };
}
