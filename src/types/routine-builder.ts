export type ConfiguredExercise = {
    id: string;
    exerciseId: string;
    name: string;
    muscleGroup: string | null;
    equipment: string | null;
    sets: number;
    targetReps: number;
    restSeconds: number;
};

export type Workout = {
    id: string;
    name: string;
    exercises: ConfiguredExercise[];
};