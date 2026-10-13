import {useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {ConfiguredExercise} from "@/types/routine-builder";

type ExerciseFrameProps = {
    selectedExercise: ConfiguredExercise;
    onStartRest: (seconds: number) => void;
};

type ExerciseSet = {
    setNumber: number;
    weight: number;
    reps: number;
    completed: boolean;
};

export default function ExerciseFrame({
    selectedExercise,
    onStartRest,
}: ExerciseFrameProps) {
    const [sets, setSets] = useState<ExerciseSet[]>(() =>
        Array.from({length: selectedExercise.sets}, (_, index) => ({
            setNumber: index + 1,
            weight: selectedExercise.targetWeight ?? 0,
            reps: selectedExercise.targetReps,
            completed: false,
        })),
    );

    const updateSet = (
        setNumber: number,
        field: "weight" | "reps" | "completed",
        value: number | boolean,
    ) => {
        setSets((currentSets) =>
            currentSets.map((set) =>
                set.setNumber === setNumber
                    ? {...set, [field]: value}
                    : set,
            ),
        );
    };

    const addSet = () => {
        setSets((currentSets) => {
            const lastSet = currentSets[currentSets.length - 1];

            return [
                ...currentSets,
                {
                    setNumber: currentSets.length + 1,
                    weight:
                        lastSet?.weight ?? selectedExercise.targetWeight ?? 0,
                    reps: lastSet?.reps ?? selectedExercise.targetReps,
                    completed: false,
                },
            ];
        });
    };

    const removeSet = (setNumber: number) => {
        setSets((currentSets) =>
            currentSets
                .filter((set) => set.setNumber !== setNumber)
                .map((set, index) => ({
                    ...set,
                    setNumber: index + 1,
                })),
        );
    };

    const toggleSetCompleted = (set: ExerciseSet) => {
        const willBeCompleted = !set.completed;

        updateSet(
            set.setNumber,
            "completed",
            willBeCompleted,
        );

        if (willBeCompleted && selectedExercise.restSeconds > 0) {
            onStartRest(selectedExercise.restSeconds);
        }
    };

    const completedCount = sets.filter((set) => set.completed).length;

    return (
        <section>
            <header>
                <h1 className="font-display text-heading font-bold">
                    {selectedExercise.name}
                </h1>
                <p className="mt-1 text-sm text-secondary">
                    {completedCount} / {selectedExercise.sets} sets done ·{" "}
                    {selectedExercise.restSeconds}s rest
                </p>
            </header>

            <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">
                    Today
                </h2>

                <form className="mt-3 space-y-3">
                    {sets.map((set) => (
                        <div
                            key={set.setNumber}
                            className={`rounded-card border p-4 shadow-card transition-colors ${
                                set.completed
                                    ? "border-brand bg-brand-soft"
                                    : "border-border bg-surface"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="shrink-0 whitespace-nowrap text-sm text-secondary">
                                    Set {set.setNumber}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => removeSet(set.setNumber)}
                                        aria-label={`Remove set ${set.setNumber}`}
                                        className="grid size-11 shrink-0 place-items-center rounded-control bg-surface-subtle text-secondary transition hover:bg-danger-soft hover:text-danger"
                                    >
                                        <Icon name="delete" className="size-4" />
                                    </button>

                                    <button
                                    type="button"
                                    onClick={() => toggleSetCompleted(set)}
                                        aria-label={`Mark set ${set.setNumber} ${
                                            set.completed ? "incomplete" : "complete"
                                        }`}
                                        aria-pressed={set.completed}
                                        className={`grid size-11 shrink-0 place-items-center rounded-control border transition-colors ${
                                            set.completed
                                                ? "border-brand bg-brand text-inverse shadow-card"
                                                : "border-border bg-surface-subtle text-secondary hover:border-border-strong hover:bg-surface-muted hover:text-primary"
                                        }`}
                                    >
                                        <Icon name="check" className="size-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 border-t border-divider pt-4">
                                <label className="flex shrink-0 items-center gap-2">
                                    <span className="sr-only">
                                        Weight for set {set.setNumber}
                                    </span>
                                    <input
                                        type="number"
                                        value={set.weight}
                                        onChange={(event) =>
                                            updateSet(
                                                set.setNumber,
                                                "weight",
                                                Number(event.target.value),
                                            )
                                        }
                                        className="h-12 w-16 rounded-control border border-border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus:border-border focus:ring-0 sm:w-[5.5rem]"
                                    />
                                    <span className="shrink-0 text-sm text-secondary">
                                        kg
                                    </span>
                                </label>

                                <span className="text-sm text-secondary">×</span>

                                <label className="flex shrink-0 items-center gap-2">
                                    <span className="sr-only">
                                        Repetitions for set {set.setNumber}
                                    </span>
                                    <input
                                        type="number"
                                        value={set.reps}
                                        onChange={(event) =>
                                            updateSet(
                                                set.setNumber,
                                                "reps",
                                                Number(event.target.value),
                                            )
                                        }
                                        className="h-12 w-16 rounded-control border border-border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus:border-border focus:ring-0 sm:w-[5.5rem] [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="shrink-0 text-sm text-secondary">
                                        reps
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addSet}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-control border border-dashed border-border-strong bg-transparent text-sm font-semibold text-secondary transition hover:border-brand hover:text-brand"
                    >
                        <span aria-hidden="true" className="text-lg font-normal">
                            +
                        </span>
                        Add set
                    </button>
                </form>
            </div>
        </section>
    );
}
