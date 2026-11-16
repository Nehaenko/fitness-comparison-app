import {useState} from "react";
import {isSortableOperation, useSortable} from "@dnd-kit/react/sortable";
import {DragDropProvider, type DragEndEvent} from "@dnd-kit/react";
import Icon from "@/components/layout/actionComponents/iconComponent";
import ExercisesForm from "@/components/routines/exercisesForm";
import SortableExercise from "@/components/routines/sortableExercise";
import type {
    ExerciseChanges,
    ExerciseOption,
    Workout,
} from "@/types/routine-builder";
import type {WeightUnit} from "@/types/profile";

type SortableWorkoutProps = {
    workout: Workout;
    index: number;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
    onAddExercise: (workoutId: string, exercise: ExerciseOption) => void;
    onReorderExercise: (workoutId: string, from: number, to: number) => void;
    onRemoveExercise: (id: string) => void;
    onUpdateExercise: (id: string, configuredExerciseId: string, changes: ExerciseChanges) => void;
    exercises: ExerciseOption[];
    weightUnit: WeightUnit;
};

export default function SortableWorkout({
                                            workout,
                                            index,
                                            onRemove,
                                            onRename,
                                            onAddExercise,
                                            onReorderExercise,
                                            onRemoveExercise,
                                            onUpdateExercise,
                                            exercises,
                                            weightUnit,
                                        }: SortableWorkoutProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [exerciseDropdownOpened, setExerciseDropdownOpened] = useState(false);
    const {ref, handleRef, isDragging} = useSortable({
        id: workout.id,
        index,
    });

    const handleExerciseDropdownOpen = () => {
        setExerciseDropdownOpened((currentlyVisible) => !currentlyVisible);
    }

    const handleExerciseModalVisibility = () => {
        setShowExerciseModal((currentlyOpen) => !currentlyOpen);
    };

    const saveName = () => {
        const trimmedName = workout.name.trim();

        if (!trimmedName) {
            return;
        }

        onRename(workout.id, trimmedName);
        setIsEditing(false);
    };

    const reorderExercise = (event: DragEndEvent) => {
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

        onReorderExercise(workout.id, initialIndex, index);
    };

    return (
        <>
            <div
                ref={ref}
                className={`overflow-hidden rounded-card border bg-surface ${
                    exerciseDropdownOpened
                        ? "border-brand"
                        : "border-border"
                } ${isDragging ? "relative z-10 border-brand shadow-floating" : ""}`}
            >
                <div
                    className="grid min-h-16 grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center px-4"
                    onClick={handleExerciseDropdownOpen}
                >
                    <button
                        ref={handleRef}
                        type="button"
                        aria-label={`Reorder ${workout.name}`}
                        onClick={(event) => event.stopPropagation()}
                        className="-ml-2 grid size-10 shrink-0 cursor-grab touch-none place-items-center rounded-full text-primary active:cursor-grabbing active:bg-surface-subtle"
                    >
                        <Icon name="reorder" className="size-5"/>
                    </button>

                    <span
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-subtle text-label text-secondary">
                        {index + 1}
                    </span>

                    {isEditing ? (
                        <input
                            id={`workout-${workout.id}-name`}
                            type="text"
                            value={workout.name}
                            onChange={(event) =>
                                onRename(workout.id, event.target.value)
                            }
                            onClick={(event) => event.stopPropagation()}
                            aria-label="Workout name"
                            className="mx-2 min-w-0 rounded-control border border-border bg-surface px-3 py-1.5 outline-none"
                            autoFocus
                        />
                    ) : (
                        <div className="min-w-0 px-2">
                            <p className="break-words text-small font-semibold leading-tight text-primary">
                                {workout.name}
                            </p>
                            <span className="mt-0.5 block text-label leading-tight text-secondary">
                                {workout.exercises.length} {workout.exercises.length === 1 ? "exercise" : "exercises"}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    saveName();
                                }}
                                className="px-2 text-label font-semibold text-brand"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                type="button"
                                aria-label={`Rename ${workout.name}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-surface-subtle"
                            >
                                <Icon name="edit" className="size-4" strokeWidth={1.25}/>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onRemove(workout.id);
                            }}
                            aria-label={`Remove ${workout.name}`}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-primary hover:bg-danger-soft hover:text-danger"
                        >
                            <Icon name="delete" className="size-4" strokeWidth={1.25}/>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleExerciseDropdownOpen();
                        }}
                        aria-label={`${exerciseDropdownOpened ? "Collapse" : "Expand"} ${workout.name}`}
                        className="grid size-8 shrink-0 place-items-center text-primary"
                    >
                        <Icon
                            name="chevron-down"
                            className={`size-4 transition-transform ${
                                exerciseDropdownOpened ? "rotate-180" : ""
                            }`}
                        />
                    </button>
                </div>

                {exerciseDropdownOpened && (
                    <>

                        <div>
                            {workout.exercises.length === 0 && (
                                <p className="border-t border-divider px-5 py-5 text-center text-small text-secondary">
                                    No exercises yet. Add your first exercise.
                                </p>
                            )}
                            {workout.exercises.length > 0 && (
                                <DragDropProvider onDragEnd={reorderExercise}>
                                    <div>
                                        {workout.exercises.map((exercise, exerciseIndex) => (
                                            <SortableExercise
                                                key={exercise.id}
                                                exercise={exercise}
                                                index={exerciseIndex}
                                                onRemoveExercise={onRemoveExercise}
                                                weightUnit={weightUnit}
                                                onUpdateExercise={(configuredExerciseId, changes) =>
                                                    onUpdateExercise(
                                                        workout.id,
                                                        configuredExerciseId,
                                                        changes,
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </DragDropProvider>
                            )}
                            <button
                                type="button"
                                onClick={handleExerciseModalVisibility}
                                className="flex w-full items-center gap-2 border-t border-divider px-5 py-4 text-left text-small font-semibold text-brand"
                            >
                                <span className="text-lg font-normal leading-none">+</span>
                                Add exercise
                            </button>

                            {showExerciseModal && (
                                <ExercisesForm
                                    exercises={exercises}
                                    handleExerciseModalVisibility={
                                        handleExerciseModalVisibility
                                    }
                                    onAddExercise={(exercise) =>
                                        onAddExercise(workout.id, exercise)
                                    }
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
