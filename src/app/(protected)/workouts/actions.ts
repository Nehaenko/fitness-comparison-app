"use server"

import {revalidatePath} from "next/cache";
import {auth} from "@/auth";
import {createWorkoutSessionForUser} from "@/db/workoutSession";
import {getCompletedWorkoutValues} from "@/validation/workout-session";

export async function completeWorkoutAction(workoutSession: unknown) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const values = getCompletedWorkoutValues(workoutSession);

    const completedWorkout =
        await createWorkoutSessionForUser(
            session.user.id,
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