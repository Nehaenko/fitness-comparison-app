import {notFound} from "next/navigation";

import {getAuthenticatedWorkoutWithPreviousPerformance} from "@/app/(protected)/workouts/data";
import InteractiveWorkout from "@/components/workouts/interactiveWorkout";

export default async function ActiveWorkoutPage({params}: {
    params: Promise<{ workoutId: string }>;
}) {
    const {workoutId} = await params;
    const result =
        await getAuthenticatedWorkoutWithPreviousPerformance(
            workoutId,
        );

    if (!result) {
        notFound();
    }

    return <InteractiveWorkout workout={result.workout} previousPerformanceByExerciseId={
        result.previousPerformanceByExerciseId
    }/>
}