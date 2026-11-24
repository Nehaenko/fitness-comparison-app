import Icon from "@/components/layout/actionComponents/iconComponent";
import DecimalInput from "@/components/layout/actionComponents/decimalInput";
import type {ConfiguredExercise} from "@/types/routine-builder";
import type {WorkoutSetDraft} from "@/types/workout-session";
import type {PreviousExercisePerformance} from "@/types/history";
import {isCardioExercise} from "@/helpers/exercise-formatting";
import {useEffect, useState} from "react";

type ExerciseFrameProps = {
    selectedExercise: ConfiguredExercise;
    sets: WorkoutSetDraft[];
    onStartRest: (seconds: number) => void;
    onSetsChange: (sets: WorkoutSetDraft[]) => void;
    previousPerformance?: PreviousExercisePerformance;
    onReplaceExercise?: () => void;
    canReplaceExercise?: boolean;
};

type WorkoutSetChanges = Partial<
    Pick<WorkoutSetDraft, "weight" | "reps" | "completed">
>;

export default function ExerciseFrame({
                                          selectedExercise,
                                          sets,
                                          previousPerformance,
                                          onStartRest,
                                          onSetsChange,
                                          onReplaceExercise,
                                          canReplaceExercise = true,
                                      }: ExerciseFrameProps) {
    const [performanceMessage, setPerformanceMessage] = useState<string | null>(null);

    useEffect(() => {
        if (performanceMessage === null) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setPerformanceMessage(null);
        }, 2_500);

        return () => window.clearTimeout(timeout);
    }, [performanceMessage]);

    const updateSet = (
        setId: string,
        changes: WorkoutSetChanges,
    ) => {
        onSetsChange(
            sets.map((set) =>
                set.id === setId
                    ? {...set, ...changes}
                    : set,
            )
        )
    };

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        const newSet = {
            id: crypto.randomUUID(),
            weight: lastSet?.weight ?? selectedExercise.targetWeight,
            reps: lastSet?.reps ?? selectedExercise.targetReps,
            completed: false,
        }

        onSetsChange(
            [...sets, newSet]
        )
    };

    const removeSet = (setId: string) => {
        onSetsChange(sets.filter((set) => set.id !== setId));
    };

    const toggleSetCompleted = (set: WorkoutSetDraft) => {
        const willBeCompleted = !set.completed;
        const setIndex = sets.findIndex((item) => item.id === set.id);
        const previousSet = setIndex > 0
            ? [...sets.slice(0, setIndex)]
                .reverse()
                .find((item) => item.reps !== null || item.weight !== null)
            : undefined;

        const completedReps =
            set.reps ?? previousSet?.reps ?? selectedExercise.targetReps;
        const completedWeight =
            set.weight ?? previousSet?.weight ?? selectedExercise.targetWeight;

        updateSet(set.id, {
            completed: willBeCompleted,
            ...(willBeCompleted ? {
                reps: completedReps,
                weight: completedWeight,
            } : {}),
        });

        if (willBeCompleted) {
            const previousWorkoutSet = previousPerformance?.sets[setIndex];
            const improvements: string[] = [];

            if (
                completedWeight !== null &&
                previousWorkoutSet?.weight !== null &&
                previousWorkoutSet?.weight !== undefined &&
                completedWeight > previousWorkoutSet.weight
            ) {
                const difference = Number(
                    (completedWeight - previousWorkoutSet.weight).toFixed(2),
                );
                improvements.push(`${difference} kg heavier`);
            }

            if (
                previousWorkoutSet &&
                completedReps > previousWorkoutSet.reps
            ) {
                const difference = completedReps - previousWorkoutSet.reps;
                improvements.push(
                    `${difference} more ${difference === 1 ? "rep" : "reps"}`,
                );
            }

            setPerformanceMessage(
                improvements.length > 0
                    ? `${improvements.join(" and ")} than last time`
                    : null,
            );
        }

        if (willBeCompleted && selectedExercise.restSeconds > 0) {
            onStartRest(selectedExercise.restSeconds);
        }
    };

    const completedCount = sets.filter((set) => set.completed).length;
    const hasPreviousPerformance = Boolean(previousPerformance?.sets.length);
    const isCardio = isCardioExercise(selectedExercise.muscleGroup);

    if (isCardio) {
        const cardioSet = sets[0];
        const isCompleted = cardioSet?.completed ?? false;

        return (
            <section>
                <header>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="font-display text-heading font-bold">
                            {selectedExercise.name}
                        </h1>
                        <button
                            type="button"
                            onClick={onReplaceExercise}
                            disabled={!canReplaceExercise}
                            className="shrink-0 rounded-control border border-border px-3 py-2 text-small font-semibold text-primary transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Replace exercise
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-secondary">
                        {isCompleted ? "Exercise complete" : "Cardio exercise"}
                    </p>
                </header>

                {cardioSet && (
                    <button
                        type="button"
                        onClick={() => toggleSetCompleted(cardioSet)}
                        aria-pressed={isCompleted}
                        className={`mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-control border font-semibold transition-colors ${
                            isCompleted
                                ? "border-brand bg-brand text-on-accent"
                                : "border-border bg-surface text-primary hover:border-brand"
                        }`}
                    >
                        <Icon name="check" className="size-5"/>
                        {isCompleted
                            ? "Mark exercise incomplete"
                            : "Mark exercise complete"}
                    </button>
                )}
            </section>
        );
    }

    return (
        <section>
            {performanceMessage ? (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed left-1/2 top-20 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-control border border-brand bg-brand-soft px-4 py-3 text-center text-small font-semibold text-primary shadow-floating"
                >
                    {performanceMessage}
                </div>
            ) : null}

            <header>
                <div className="flex items-start justify-between gap-4">
                    <h1 className="font-display text-heading font-bold">
                        {selectedExercise.name}
                    </h1>
                    <button
                        type="button"
                        onClick={onReplaceExercise}
                        disabled={!canReplaceExercise}
                        className="shrink-0 rounded-control border border-border px-3 py-2 text-small font-semibold text-primary transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Replace exercise
                    </button>
                </div>
                <p className="mt-1 text-sm text-secondary">
                    {completedCount} / {sets.length} sets done ·{" "}
                    {selectedExercise.restSeconds}s rest
                </p>
                {!canReplaceExercise ? (
                    <p className="mt-1 text-small text-secondary">
                        An exercise cannot be replaced after a set is completed.
                    </p>
                ) : null}
            </header>

            <div className="mt-6">
                {hasPreviousPerformance && previousPerformance && (
                    <section className="rounded-card bg-surface-subtle px-5 py-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary">
                            Previous
                        </h2>

                        <div className="mt-3 space-y-1.5 font-mono text-sm tabular-nums text-secondary">
                            {previousPerformance.sets.map((set) => (
                                <p
                                    key={set.id}
                                    className="grid grid-cols-[3.25rem_auto_minmax(0,1fr)] items-baseline gap-2"
                                >
                                    <span>Set {set.position + 1}</span>
                                    <span aria-hidden="true">—</span>
                                    <span>
                                        {set.weight === null
                                            ? "Bodyweight"
                                            : `${set.weight} kg`} {" "}
                                        × {set.reps}
                                    </span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                <h2 className={`text-sm font-semibold uppercase tracking-wide text-secondary ${
                        hasPreviousPerformance ? "mt-6" : ""
                    }`}>Today</h2>

                <form className="mt-3 space-y-3">
                    {sets.map((set, index) => {
                        const setNumber = index + 1;
                        const previousSet = index > 0
                            ? [...sets.slice(0, index)]
                                .reverse()
                                .find((item) => item.reps !== null || item.weight !== null)
                            : undefined;
                        const weightPlaceholder =
                            previousSet?.weight ?? selectedExercise.targetWeight ?? 0;
                        const repsPlaceholder =
                            previousSet?.reps ?? selectedExercise.targetReps;
                        return (
                            <div
                                key={set.id}
                                className={`rounded-card border p-4 shadow-card transition-colors ${
                                    set.completed
                                        ? "border-brand bg-brand-soft"
                                        : "border-border bg-surface"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                <span className="shrink-0 whitespace-nowrap text-sm text-secondary">
                                    Set {setNumber}
                                </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => removeSet(set.id)}
                                            aria-label={`Remove set ${setNumber}`}
                                            className="grid size-8 shrink-0 place-items-center rounded-full text-primary transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                                        >
                                            <Icon name="delete" className="size-4" strokeWidth={1.25}/>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleSetCompleted(set)}
                                            aria-label={`Mark set ${setNumber} ${
                                                set.completed ? "incomplete" : "complete"
                                            }`}
                                            aria-pressed={set.completed}
                                            className={`grid size-11 shrink-0 place-items-center rounded-control border transition-colors ${
                                                set.completed
                                                    ? "border-brand bg-brand text-on-accent shadow-card"
                                                    : "border-border bg-surface-subtle text-secondary hover:border-border-strong hover:bg-surface-muted hover:text-primary"
                                            }`}
                                        >
                                            <Icon name="check" className="size-5"/>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-divider pt-4">
                                    <label className="flex shrink-0 items-center gap-2">
                                    <span className="sr-only">
                                        Weight for set {setNumber}
                                    </span>
                                        <DecimalInput
                                            value={set.weight}
                                            placeholder={String(weightPlaceholder)}
                                            onFocus={(event) =>
                                                event.currentTarget.select()
                                            }
                                            onValueChange={(weight) =>
                                                updateSet(set.id, {
                                                    weight,
                                                })
                                            }
                                            className="h-12 w-16 rounded-control border border-border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-22"
                                        />
                                        <span className="shrink-0 text-sm text-secondary">
                                        kg
                                    </span>
                                    </label>

                                    <span className="text-sm text-secondary">×</span>

                                    <label className="flex shrink-0 items-center gap-2">
                                    <span className="sr-only">
                                        Repetitions for set {setNumber}
                                    </span>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            step="1"
                                            value={set.reps ?? ""}
                                            placeholder={String(repsPlaceholder)}
                                            onFocus={(event) =>
                                                event.currentTarget.select()
                                            }
                                            onChange={(event) =>
                                                updateSet(set.id, {
                                                    reps:
                                                        event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value),
                                                })
                                            }
                                            className="h-12 w-16 rounded-control border border-border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:w-22 [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="shrink-0 text-sm text-secondary">
                                        reps
                                    </span>
                                    </label>
                                </div>
                            </div>
                        )
                    })}

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
