import "server-only";

import {auth} from "@/auth";
import {getWorkoutWithExercisesForUser} from "@/db/workoutTemplates";

export async function getAuthenticatedWorkoutWithExercises(
    workoutId: string,
) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getWorkoutWithExercisesForUser(
        workoutId,
        session.user.id,
    );
}