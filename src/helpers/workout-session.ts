import {isCardioExercise} from "@/helpers/exercise-formatting";
import type {ExerciseOption, Workout} from "@/types/routine-builder";
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

export function replaceExerciseForSession({
    workout,
    session,
    workoutTemplateExerciseId,
    replacement,
}: {
    workout: Workout;
    session: WorkoutSessionDraft;
    workoutTemplateExerciseId: string;
    replacement: ExerciseOption;
}) {
    const configuredExercise = workout.exercises.find(
        (exercise) => exercise.id === workoutTemplateExerciseId,
    );
    const exerciseDraft = session.exercises.find(
        (exercise) =>
            exercise.workoutTemplateExerciseId === workoutTemplateExerciseId,
    );

    if (!configuredExercise || !exerciseDraft) {
        throw new Error("Workout exercise not found");
    }

    if (exerciseDraft.sets.some((set) => set.completed)) {
        throw new Error("A completed exercise cannot be replaced");
    }

    const wasCardio = isCardioExercise(configuredExercise.muscleGroup);
    const isCardio = isCardioExercise(replacement.muscleGroup);
    const setCount = isCardio
        ? 1
        : wasCardio
            ? 3
            : Math.max(1, exerciseDraft.sets.length);
    const targetReps = isCardio
        ? 1
        : wasCardio
            ? 10
            : configuredExercise.targetReps;
    const restSeconds = isCardio
        ? 0
        : wasCardio
            ? 90
            : configuredExercise.restSeconds;

    const replacementExercise = {
        ...configuredExercise,
        exerciseId: replacement.id,
        name: replacement.name,
        muscleGroup: replacement.muscleGroup,
        equipment: replacement.equipment,
        sets: setCount,
        targetReps,
        targetWeight: null,
        restSeconds,
    };

    return {
        replacementExercise,
        workout: {
            ...workout,
            exercises: workout.exercises.map((exercise) =>
                exercise.id === workoutTemplateExerciseId
                    ? replacementExercise
                    : exercise,
            ),
        },
        session: {
            ...session,
            exercises: session.exercises.map((exercise) =>
                exercise.workoutTemplateExerciseId === workoutTemplateExerciseId
                    ? {
                        ...exercise,
                        exerciseId: replacement.id,
                        sets: Array.from({length: setCount}, (_, index) => ({
                            id: crypto.randomUUID(),
                            reps: index === 0 ? targetReps : null,
                            weight: null,
                            completed: false,
                        })),
                    }
                    : exercise,
            ),
        },
    };
}

export function getElapsedSeconds(startedAt:number) {
    return Math.max(
        0,
        Math.floor((Date.now() - startedAt) / 1000)
    );
}
