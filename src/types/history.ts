export type WorkoutHistorySummary = {
    id: string;
    workoutName: string;
    completedAt: Date;
    durationSeconds: number;
    exerciseCount: number;
};

export type DashboardWorkoutHistory = {
    completedThisMonth: number;
    recentWorkouts: WorkoutHistorySummary[];
};

export type WorkoutHistorySet = {
    id: string;
    position: number;
    weight: number | null;
    reps: number;
};

export type PreviousExercisePerformance = {
    exerciseId: string;
    completedAt: Date;
    sets: WorkoutHistorySet[];
};

export type PreviousExercisePerformanceByExerciseId =
    Record<string, PreviousExercisePerformance>;


export type WorkoutHistoryExercise = {
    id: string;
    exerciseId: string;
    exerciseName: string;
    position: number;
    sets: WorkoutHistorySet[];
};

export type WorkoutHistoryDetail = {
    id: string;
    routineName: string;
    workoutName: string;
    startedAt: Date;
    completedAt: Date;
    durationSeconds: number;
    exerciseCount: number;
    setCount: number;
    exercises: WorkoutHistoryExercise[];
};