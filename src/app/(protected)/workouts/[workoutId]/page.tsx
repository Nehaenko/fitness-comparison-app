import {notFound} from "next/navigation";

import {getAuthenticatedWorkoutWithExercises} from "@/app/(protected)/workouts/data";
import InteractiveWorkout from "@/components/workouts/interactiveWorkout";

export default async function ActiveWorkoutPage({params}: {
    params: Promise<{ workoutId: string }>;
}) {
    const {workoutId} = await params;
    const workout = await getAuthenticatedWorkoutWithExercises(workoutId);

    if (!workout) {
        notFound();
    }

    return <InteractiveWorkout workout={workout}/>
}