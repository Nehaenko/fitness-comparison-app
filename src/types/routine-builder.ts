import type {Exercise, Routine, WorkoutTemplate} from "@/db/schema";

export type RoutineValues = {
    name: string;
    description?: string | null;
};

export type ExerciseValues = {
    id: string;
    exerciseId: string;
    sets: number;
    targetReps: number;
    targetWeight: number | null;
    restSeconds: number;
    position: number;
};

export type WorkoutValues = {
    id: string;
    name: string;
    position: number;
    exercises: ExerciseValues[];
}

export type WorkoutSummary = Pick<
    WorkoutTemplate,
    "id" | "name" | "position"
> & {
    exerciseCount: number;
};

export type ExerciseOption = Pick<
    Exercise,
    "id" | "name" | "muscleGroup" | "equipment"
>;

export type ConfiguredExercise = {
    id: string;
    exerciseId: string;
    name: string;
    muscleGroup: string | null;
    equipment: string | null;
    sets: number;
    targetReps: number;
    restSeconds: number;
    targetWeight: number | null;
};

export type Workout = {
    id: string;
    name: string;
    exercises: ConfiguredExercise[];
};

export type WorkoutTemplateWithExercises = WorkoutTemplate & {
    exercises: ConfiguredExercise[];
};

export type ExerciseChanges = Pick<
    ConfiguredExercise,
    | "sets"
    | "targetReps"
    | "targetWeight"
    | "restSeconds"
>;

export type RoutineWithWorkouts = Routine & {
    workouts: WorkoutSummary[];
    workoutCount: number;
}
