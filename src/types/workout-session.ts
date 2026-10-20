import type {Workout} from "@/types/routine-builder";

export type WorkoutSetDraft = {
    id: string;
    reps: number | null;
    weight: number | null;
    completed: boolean;
}

export type WorkoutExerciseDraft = {
    workoutTemplateExerciseId: string;
    exerciseId: string;
    sets: WorkoutSetDraft[];
}

export type WorkoutSessionDraft = {
    id: string;
    workoutTemplateId: string;
    startedAt: number;
    exercises: WorkoutExerciseDraft[];
}

export type PersistedActiveWorkout = {
    version: 1;
    workout: Workout;
    session: WorkoutSessionDraft;
    selectedExerciseId: string | null;
    restEndsAt: number | null;
    updatedAt: number;
}

export type CompletedWorkoutSetValues = {
    weight: number | null;
    reps: number;
    position: number;
}

export type CompletedWorkoutExerciseValues = {
    workoutTemplateExerciseId: string;
    exerciseId: string;
    position: number;
    sets: CompletedWorkoutSetValues[];
}

export type CompletedWorkoutValues = {
    workoutTemplateId: string;
    completedAt: Date;
    startedAt: Date;
    durationSeconds: number;
    exercises: CompletedWorkoutExerciseValues[];
}