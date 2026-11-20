import {DragDropProvider, type DragEndEvent} from "@dnd-kit/react";
import {isSortableOperation} from "@dnd-kit/react/sortable";
import {useState, type Dispatch, type SetStateAction} from "react";
import {moveExercise, moveWorkout} from "@/helpers/drag-drop-helpers";
import {isCardioExercise} from "@/helpers/exercise-formatting";

import SortableWorkout from "./sortableWorkout";

import type {
    ConfiguredExercise,
    ExerciseChanges,
    ExerciseOption,
    Workout,
} from "@/types/routine-builder";
import type {WeightUnit} from "@/types/profile";

type WorkoutsBuilderProps = {
    workouts: Workout[];
    setWorkouts: Dispatch<SetStateAction<Workout[]>>;
    exercises: ExerciseOption[];
    weightUnit: WeightUnit;
};

export default function WorkoutsBuilder({
                                            workouts, setWorkouts, exercises, weightUnit
                                        }: WorkoutsBuilderProps) {
    const [availableExercises, setAvailableExercises] = useState(exercises);

    const addAvailableExercise = (exercise: ExerciseOption) => {
        setAvailableExercises((currentExercises) =>
            [...currentExercises, exercise].sort((first, second) =>
                first.name.localeCompare(second.name),
            ),
        );
    };

    const addWorkout = () => {
        setWorkouts((currentWorkouts) => {
            if (currentWorkouts.length >= 10) {
                return currentWorkouts;
            }

            return [...currentWorkouts,
                {
                    id: crypto.randomUUID(),
                    name: `Workout ${currentWorkouts.length + 1}`,
                    exercises: [],
                },
            ]
        });
    };

    const addExerciseToWorkout = (
        workoutId: string,
        exercise: ExerciseOption,
    )=> {
        const isCardio = isCardioExercise(exercise.muscleGroup);
        const configuredExercise: ConfiguredExercise = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            sets: isCardio ? 1 : 3,
            targetReps: isCardio ? 1 : 10,
            restSeconds: isCardio ? 0 : 90,
            targetWeight: null,
        }

        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((currentWorkout) => {
                if (currentWorkout.id !== workoutId) {
                    return currentWorkout;
                }

                return {
                    ...currentWorkout,
                    exercises: [
                        ...currentWorkout.exercises,
                        configuredExercise,
                    ],
                };
            }),
        );
    }

    const removeWorkout = (id: string) => {
        const workout = workouts.find((item) => item.id === id);

        if (!workout || !window.confirm(
            `Remove “${workout.name}” and all of its exercises?`,
        )) {
            return;
        }

        setWorkouts((currentWorkouts) =>
            currentWorkouts.filter((workout) => workout.id !== id),
        );
    };

    const renameWorkout = (id: string, name: string) => {
        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((workout) =>
                workout.id === id ? {...workout, name} : workout,
            ),
        );
    };

    const reorderWorkouts = (event: DragEndEvent) => {
        if (event.canceled || !isSortableOperation(event.operation)) {
            return;
        }

        const source = event.operation.source;

        if (!source) {
            return;
        }

        const {initialIndex, index} = source;

        if (initialIndex === index) {
            return;
        }

        setWorkouts((currentWorkouts) =>
            moveWorkout(currentWorkouts, initialIndex, index),
        );
    };

    const reorderExercises = (
        workoutId: string,
        from: number,
        to: number,
    ) => {
        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((currentWorkout) => {
                if (currentWorkout.id !== workoutId) {
                    return currentWorkout;
                }

                return {
                    ...currentWorkout,
                    exercises: moveExercise(
                        currentWorkout.exercises,
                        from,
                        to,
                    ),
                };
            }),
        );
    };

    const removeExercise = (id: string) => {
        const exercise = workouts
            .flatMap((workout) => workout.exercises)
            .find((item) => item.id === id);

        if (!exercise || !window.confirm(
            `Remove “${exercise.name}” from this workout?`,
        )) {
            return;
        }

        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((workout) => ({
                ...workout,
                exercises: workout.exercises.filter(
                    (exercise) => exercise.id !== id
                ),
            }))
        );
    };

    const updateExercise = (workoutId: string, configuredExerciseId: string, changes: ExerciseChanges) => {
        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((currentWorkout) => {
                if (currentWorkout.id !== workoutId) {
                    return currentWorkout;
                }

                return {
                    ...currentWorkout,
                    exercises: currentWorkout.exercises.map(
                        (currentExercise) =>
                            currentExercise.id === configuredExerciseId ? {
                                ...currentExercise,
                                ...changes
                            }
                            : currentExercise,
                    ),
                };
            }),
        );
    };

    return (
        <>
            <input
                type="hidden"
                name="workouts"
                value={JSON.stringify(workouts)}
            />

            <DragDropProvider onDragEnd={reorderWorkouts}>
                <div className="space-y-4">
                    <div className="space-y-3">
                        {workouts.map((workout, index) => (
                            <SortableWorkout
                                key={workout.id}
                                workout={workout}
                                index={index}
                                onRename={renameWorkout}
                                onRemove={removeWorkout}
                                onAddExercise={addExerciseToWorkout}
                                onReorderExercise={reorderExercises}
                                onRemoveExercise={removeExercise}
                                onUpdateExercise={updateExercise}
                                exercises={availableExercises}
                                onExerciseCreated={addAvailableExercise}
                                weightUnit={weightUnit}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addWorkout}
                        className="flex w-full items-center justify-center gap-2 rounded-control border border-dashed border-border-strong py-4 text-small font-semibold text-primary"
                    >
                        <span className="text-lg font-normal leading-none">+</span>
                        Add workout
                    </button>
                </div>
            </DragDropProvider>
        </>
    );
}
