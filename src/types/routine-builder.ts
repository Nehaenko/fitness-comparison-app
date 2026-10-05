export type ConfiguredExercise = {
    id: string;
    exerciseId: string;
    name: string;
    muscleGroup: string | null;
    equipment: string | null;
    sets: number;
    targetReps: number;
    restSeconds: number;
    targetWeight?: number | null;
};

export type Workout = {
    id: string;
    name: string;
    exercises: ConfiguredExercise[];
};

export type ExerciseChanges = Pick<
    ConfiguredExercise,
    | "sets"
    | "targetReps"
    | "targetWeight"
    | "restSeconds"
>;