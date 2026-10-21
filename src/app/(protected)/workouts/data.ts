import "server-only";

import {auth} from "@/auth";
import {getWorkoutWithExercisesForUser} from "@/db/workoutTemplates";
import {getPreviousExercisePerformanceForUser} from "@/db/workoutHistory";

export async function getAuthenticatedWorkoutWithPreviousPerformance(
    workoutId: string,
) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const workout = await getWorkoutWithExercisesForUser(
        workoutId,
        session.user.id,
    );

    if (!workout) {
        return null;
    }

    const exerciseIds = workout.exercises.map(
        (exercise) => exercise.exerciseId,
    );

    const previousPerformanceByExerciseId =
        await getPreviousExercisePerformanceForUser(
            session.user.id,
            exerciseIds,
        );

    return {workout, previousPerformanceByExerciseId};
}