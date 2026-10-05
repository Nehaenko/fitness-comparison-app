import {DragDropProvider, type DragEndEvent} from "@dnd-kit/react";
import {isSortableOperation} from "@dnd-kit/react/sortable";
import type {Dispatch, SetStateAction} from "react";
import {moveExercise, moveWorkout} from "@/helpers/drag-drop-helpers";

import SortableWorkout from "./sortableWorkout";

import type {Exercise} from "@/db/schema";
import type {ConfiguredExercise, Workout, ExerciseChanges} from "@/types/routine-builder";

type WorkoutsBuilderProps = {
    workouts: Workout[];
    setWorkouts: Dispatch<SetStateAction<Workout[]>>;
    exercises: Exercise[];
    weightUnit: string;
};

export default function WorkoutsBuilder({
                                            workouts, setWorkouts, exercises, weightUnit
                                        }: WorkoutsBuilderProps) {
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
        exercise: Exercise,
    )=> {
        const configuredExercise: ConfiguredExercise = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            sets: 3,
            targetReps: 10,
            restSeconds: 90,
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
                                exercises={exercises}
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
