import {useState} from "react";
import {useSortable} from "@dnd-kit/react/sortable";
import ExercisesForm from "@/components/routines/exercisesForm";
import {Exercise} from "@/db/schema";

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
            <div  ref={ref}
                  className={`rounded-control border border-border bg-surface-subtle p-3 ${isDragging ? "opacity-60" : ""
            }`}>
                <div className="flex items-center gap-3"
                    onClick={handleExerciseDropdownOpen}>
                    <button
                        ref={handleRef}
                        type="button"
                        aria-label={`Reorder ${workout.name}`}
                        className="cursor-grab touch-none text-secondary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="size-5"
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

                    <span className="text-small text-secondary">{index + 1}.</span>

                    {isEditing ? (
                        <input
                            id={`workout-${workout.id}-name`}
                            type="text"
                            value={workout.name}
                            onChange={(event) =>
                                onRename(workout.id, event.target.value)
                            }
                            aria-label="Workout name"
                            className="min-w-0 flex-1 rounded-control border border-border bg-surface px-3 py-2 outline-none"
                            autoFocus
                        />
                    ) : (
                        <p className="min-w-0 flex-1 font-semibold">{workout.name}</p>
                    )}

                    {isEditing ? (
                        <button
                            type="button"
                            onClick={saveName}
                            className="font-semibold text-brand"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="text-small font-semibold"
                        >
                            Rename
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onRemove(workout.id)}
                        className="text-small text-danger"
                    >
                        Remove
                    </button>
                </div>

                {exerciseDropdownOpened && (
                    <div className="p-5">
                        <button
                            type="button"
                            onClick={handleExerciseModalVisibility}
                        >
                            + Add Exercise
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
