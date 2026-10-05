import type {ConfiguredExercise, Workout} from "@/types/routine-builder";

export function moveWorkout(workouts: Workout[], from: number, to: number) {
    const reorderedWorkouts = [...workouts];
    const [movedWorkout] = reorderedWorkouts.splice(from, 1);

    if (!movedWorkout) {
        return workouts;
    }

    reorderedWorkouts.splice(to, 0, movedWorkout);

    return reorderedWorkouts;
}

export function moveExercise(
    exercises: ConfiguredExercise[],
    from: number,
    to: number,
) {
    const reorderedExercises = [...exercises];
    const [movedExercise] = reorderedExercises.splice(from, 1);

    if (!movedExercise) {
        return exercises;
    }

    reorderedExercises.splice(to, 0, movedExercise);

    return reorderedExercises;
}