"use server"

import {revalidatePath} from "next/cache";
import {auth} from "@/auth";
import {createWorkoutSessionForUser} from "@/db/workoutSession";
import {canUserUseExercises} from "@/db/exercises";
import {getPreviousExercisePerformanceForUser} from "@/db/workoutHistory";
import {getCompletedWorkoutValues} from "@/validation/workout-session";

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function completeWorkoutAction(workoutSession: unknown) {
    const userId = await requireAuthenticatedUserId();

    const values = getCompletedWorkoutValues(workoutSession);

    const completedWorkout =
        await createWorkoutSessionForUser(
            userId,
            values,
        );

    if(!completedWorkout) {
        throw new Error("Workout not found");
    }

    revalidatePath("/dashboard");

    return {
        id: completedWorkout.id,
    };
}

export async function getReplacementExerciseHistoryAction(
    exerciseId: string,
) {
    const userId = await requireAuthenticatedUserId();

    if (!uuidPattern.test(exerciseId)) {
        throw new Error("Invalid exercise");
    }

    if (!await canUserUseExercises(userId, [exerciseId])) {
        throw new Error("Exercise unavailable");
    }

    const history = await getPreviousExercisePerformanceForUser(
        userId,
        [exerciseId],
    );

    return history[exerciseId] ?? null;
}
