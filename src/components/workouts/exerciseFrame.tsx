import Icon from "@/components/layout/actionComponents/iconComponent";
import type {ConfiguredExercise} from "@/types/routine-builder";
import type {WorkoutSetDraft} from "@/types/workout-session";
import type {PreviousExercisePerformance} from "@/types/history";

type ExerciseFrameProps = {
    selectedExercise: ConfiguredExercise;
    sets: WorkoutSetDraft[];
    onStartRest: (seconds: number) => void;
    onSetsChange: (sets: WorkoutSetDraft[]) => void;
    previousPerformance?: PreviousExercisePerformance;
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
                                      }: ExerciseFrameProps) {
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

        updateSet(set.id, {completed: willBeCompleted});

        if (willBeCompleted && selectedExercise.restSeconds > 0) {
            onStartRest(selectedExercise.restSeconds);
        }
    };

    const completedCount = sets.filter((set) => set.completed).length;
    const hasPreviousPerformance = Boolean(previousPerformance?.sets.length);

    return (
        <section>
            <header>
                <h1 className="font-display text-heading font-bold">
                    {selectedExercise.name}
                </h1>
                <p className="mt-1 text-sm text-secondary">
                    {completedCount} / {sets.length} sets done ·{" "}
                    {selectedExercise.restSeconds}s rest
                </p>
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

                <h2
                    className={`text-sm font-semibold uppercase tracking-wide text-secondary ${
                        hasPreviousPerformance ? "mt-6" : ""
                    }`}
                >
                    Today
                </h2>

                <form className="mt-3 space-y-3">
                    {sets.map((set, index) => {
                        const setNumber = index + 1;
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
                                            className="grid size-11 shrink-0 place-items-center rounded-control bg-surface-subtle text-secondary transition hover:bg-danger-soft hover:text-danger"
                                        >
                                            <Icon name="delete" className="size-4"/>
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
                                                    ? "border-brand bg-brand text-inverse shadow-card"
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
                                        <input
                                            type="number"
                                            value={set.weight ?? "0"}
                                            onChange={(event) =>
                                                updateSet(set.id, {
                                                    weight:
                                                        event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value),
                                                })
                                            }
                                            className="h-12 w-16 rounded-control border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus:border-border focus:ring-0 sm:w-22"
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
                                            value={set.reps ?? "0"}
                                            onChange={(event) =>
                                                updateSet(set.id, {
                                                    reps:
                                                        event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value),
                                                })
                                            }
                                            className="h-12 w-16 rounded-control border bg-surface-subtle px-2 text-center font-mono text-base font-semibold outline-none focus:border-border focus:ring-0 sm:w-22 [&::-webkit-inner-spin-button]:appearance-none"
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
