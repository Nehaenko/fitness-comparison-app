import {useState} from "react";
import {useSortable} from "@dnd-kit/react/sortable";
import ExercisesForm from "@/components/routines/exercisesForm";
import type {Exercise} from "@/db/schema";

export type Workout = {
    id: string;
    name: string;
};

type SortableWorkoutProps = {
    workout: Workout;
    index: number;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
    exercises: Exercise[];
};

export default function SortableWorkout({
                                            workout,
                                            index,
                                            onRemove,
                                            onRename,
                                            exercises,
                                        }: SortableWorkoutProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showExerciseModal , setShowExerciseModal] = useState(false);
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

    return (
        <>
            <div
                ref={ref}
                className={`overflow-hidden rounded-card border bg-surface ${
                    exerciseDropdownOpened
                        ? "border-brand"
                        : "border-border"
                } ${isDragging ? "opacity-60" : ""}`}
            >
                <div
                    className="flex min-h-14 items-center gap-2 px-4"
                    onClick={handleExerciseDropdownOpen}
                >
                    <button
                        ref={handleRef}
                        type="button"
                        aria-label={`Reorder ${workout.name}`}
                        onClick={(event) => event.stopPropagation()}
                        className="cursor-grab touch-none text-tertiary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="size-4"
                            fill="currentColor"
                        >
                            <circle cx="8" cy="7" r="1.25"/>
                            <circle cx="16" cy="7" r="1.25"/>
                            <circle cx="8" cy="12" r="1.25"/>
                            <circle cx="16" cy="12" r="1.25"/>
                            <circle cx="8" cy="17" r="1.25"/>
                            <circle cx="16" cy="17" r="1.25"/>
                        </svg>
                    </button>

                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-subtle text-label text-secondary">
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
                            className="min-w-0 flex-1 rounded-control border border-border bg-surface px-3 py-1.5 outline-none"
                            autoFocus
                        />
                    ) : (
                        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
                            <p className="truncate text-small font-semibold text-primary">
                                {workout.name}
                            </p>
                            <span className="shrink-0 text-label text-secondary">
                                0 exercises
                            </span>
                        </div>
                    )}

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                saveName();
                            }}
                            className="text-label font-semibold text-brand"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="px-1 text-label text-secondary"
                        >
                            Rename
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRemove(workout.id);
                        }}
                        aria-label={`Remove ${workout.name}`}
                        className="grid size-8 place-items-center text-secondary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleExerciseDropdownOpen();
                        }}
                        aria-label={`${exerciseDropdownOpened ? "Collapse" : "Expand"} ${workout.name}`}
                        className="grid size-8 place-items-center text-secondary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className={`size-4 transition-transform ${
                                exerciseDropdownOpened ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m8 10 4 4 4-4"/>
                        </svg>
                    </button>
                </div>

                {/*//TODO: when no exercises for routine show this button and text but if ther are - hide*/}
                {exerciseDropdownOpened && (
                    <div>
                        <p className="border-t border-divider px-5 py-5 text-center text-small text-secondary">
                            No exercises yet. Add your first exercise.
                        </p>

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
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
