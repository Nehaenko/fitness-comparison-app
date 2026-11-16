import type {Workout} from "@/types/routine-builder";
import type {WorkoutSessionDraft} from "@/types/workout-session";

export function createWorkoutSessionDraft(workout: Workout): WorkoutSessionDraft {
    const exercisesDraft = workout.exercises.map((exercise) => {
        const exerciseSets = Array.from({ length: exercise.sets }, (_, index) => {
            return {
                id: crypto.randomUUID(),
                reps: index === 0 ? exercise.targetReps : null,
                weight: index === 0 ? exercise.targetWeight : null,
                completed: false,
            }
        });

        return {
            workoutTemplateExerciseId: exercise.id,
            exerciseId: exercise.exerciseId,
            sets: exerciseSets,
        }
    })

    return {
        id: crypto.randomUUID(),
        workoutTemplateId: workout.id,
        startedAt: Date.now(),
        exercises: exercisesDraft
    };
}

export function getElapsedSeconds(startedAt:number) {
    return Math.max(
        0,
        Math.floor((Date.now() - startedAt) / 1000)
    );
}
