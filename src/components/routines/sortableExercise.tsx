import {useSortable} from "@dnd-kit/react/sortable";
import {useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {ConfiguredExercise, ExerciseChanges} from "@/types/routine-builder";

type SortableExerciseProps = {
    exercise: ConfiguredExercise;
    index: number;
    onRemoveExercise: (id: string) => void;
    onUpdateExercise: (
        configuredExerciseId: string,
        changes: ExerciseChanges,
    ) => void;
    weightUnit: string;
};

export default function SortableExercise({
                                             exercise,
                                             index,
                                             onRemoveExercise,
                                             onUpdateExercise,
                                             weightUnit,
                                         }: SortableExerciseProps) {
    const {ref, handleRef, isDragging} = useSortable({
        id: exercise.id,
        index,
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
    }

    const [draft, setDraft] = useState({
        sets: String(exercise.sets),
        targetReps: String(exercise.targetReps),
        targetWeight: exercise.targetWeight?.toString() ?? "",
        restSeconds: String(exercise.restSeconds),
    });

    const getNewExerciseData = () => {
        const newExerciseData = {
            sets: Number(draft.sets),
            targetReps: Number(draft.targetReps),
            targetWeight:
                draft.targetWeight === ""
                    ? null
                    : Number(draft.targetWeight),
            restSeconds: Number(draft.restSeconds),
        };
        onUpdateExercise(exercise.id, newExerciseData);
        setIsEditModalOpen(false);
    };

    return (
        <div
            ref={ref}
            className={`border-t border-divider px-5 py-4 ${
                isDragging ? "opacity-60" : ""
            }`}
        >
            <div className="flex items-center gap-3">
                <button
                    ref={handleRef}
                    type="button"
                    aria-label={`Reorder ${exercise.name}`}
                    className="cursor-grab touch-none text-tertiary"
                >
                    <Icon name="reorder" className="size-4"/>
                </button>

                <p className="min-w-0 flex-1 truncate text-small font-semibold text-primary">
                    {exercise.name}
                </p>

                <button type="button" onClick={handleEditModal} className="text-label text-secondary">
                    Edit
                </button>
                {isEditModalOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-4 backdrop-blur-[2px]"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`edit-exercise-${exercise.id}`}
                    >
                        <div className="w-full max-w-xl overflow-hidden rounded-panel bg-surface shadow-floating">
                            <header className="flex items-center justify-between border-b border-divider px-5 py-4">
                                <h2
                                    id={`edit-exercise-${exercise.id}`}
                                    className="font-semibold text-primary"
                                >
                                    {exercise.name}
                                </h2>

                                <button
                                    type="button"
                                    onClick={handleEditModal}
                                    aria-label="Close exercise editor"
                                    className="grid size-8 place-items-center text-primary"
                                >
                                    <Icon name="close" className="size-5"/>
                                </button>
                            </header>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-5 p-5">
                                <label htmlFor={`sets-${exercise.id}`}>
                                    <span className="form-label">Sets</span>
                                    <input
                                        id={`sets-${exercise.id}`}
                                        type="number"
                                        min={1}
                                        value={draft.sets}
                                        onChange={(event) =>
                                            setDraft((currentDraft) => ({
                                                ...currentDraft,
                                                sets: event.target.value,
                                            }))
                                        }
                                        className="form-control"
                                    />
                                </label>

                                <label htmlFor={`target-reps-${exercise.id}`}>
                                    <span className="form-label">Target reps</span>
                                    <input
                                        id={`target-reps-${exercise.id}`}
                                        type="number"
                                        min={1}
                                        value={draft.targetReps}
                                        onChange={(event) =>
                                            setDraft((currentDraft) => ({
                                                ...currentDraft,
                                                targetReps: event.target.value,
                                            }))
                                        }
                                        className="form-control"
                                    />
                                </label>

                                <label htmlFor={`target-weight-${exercise.id}`}>
                                    <span className="form-label">Target weight ({weightUnit})</span>
                                    <input
                                        id={`target-weight-${exercise.id}`}
                                        type="number"
                                        min={0}
                                        step="0.5"
                                        placeholder="Optional"
                                        value={draft.targetWeight}
                                        onChange={(event) =>
                                            setDraft((currentDraft) => ({
                                                ...currentDraft,
                                                targetWeight: event.target.value,
                                            }))
                                        }
                                        className="form-control"
                                    />
                                </label>

                                <label htmlFor={`rest-seconds-${exercise.id}`}>
                                    <span className="form-label">Rest (seconds)</span>
                                    <input
                                        id={`rest-seconds-${exercise.id}`}
                                        type="number"
                                        min={0}
                                        value={draft.restSeconds}
                                        onChange={(event) =>
                                            setDraft((currentDraft) => ({
                                                ...currentDraft,
                                                restSeconds: event.target.value,
                                            }))
                                        }
                                        className="form-control"
                                    />
                                </label>

                                <button
                                    type="button"
                                    onClick={getNewExerciseData}
                                    className="col-span-2 mt-1 h-12 rounded-control bg-surface-inverse font-semibold text-inverse"
                                >
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onRemoveExercise(exercise.id)}
                    aria-label={`Remove ${exercise.name}`}
                    className="grid size-8 place-items-center text-secondary"
                >
                    <Icon name="delete" className="size-4"/>
                </button>
            </div>

            <div className="mt-2 flex gap-3 pl-7 text-label text-secondary">
                <p>{exercise.sets} sets</p>
                <p>{exercise.targetReps} reps</p>
                <p>{exercise.restSeconds}s rest</p>
                {exercise.targetWeight && <p>{exercise.targetWeight}</p>}
            </div>
        </div>
    );
}
