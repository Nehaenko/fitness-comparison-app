import { useState } from "react";
import { useSortable } from "@dnd-kit/react/sortable";

export type Workout = {
    id: string;
    name: string;
};

type SortableWorkoutProps = {
    workout: Workout;
    index: number;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
};

export default function SortableWorkout({
    workout,
    index,
    onRemove,
    onRename,
}: SortableWorkoutProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(workout.name);
    const { ref, handleRef, isDragging } = useSortable({
        id: workout.id,
        index,
    });

    const saveName = () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        onRename(workout.id, trimmedName);
        setIsEditing(false);
    };

    return (
        <div
            ref={ref}
            className={`flex items-center gap-3 rounded-control border border-border bg-surface-subtle p-3 ${
                isDragging ? "opacity-60" : ""
            }`}
        >
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
                    <circle cx="8" cy="7" r="1.25" />
                    <circle cx="16" cy="7" r="1.25" />
                    <circle cx="8" cy="12" r="1.25" />
                    <circle cx="16" cy="12" r="1.25" />
                    <circle cx="8" cy="17" r="1.25" />
                    <circle cx="16" cy="17" r="1.25" />
                </svg>
            </button>

            <span className="text-small text-secondary">{index + 1}.</span>

            {isEditing ? (
                <input
                    id={`workout-${workout.id}-name`}
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
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
    );
}
