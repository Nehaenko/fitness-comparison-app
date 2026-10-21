import Link from "next/link";
import {notFound} from "next/navigation";

import {getAuthenticatedWorkoutHistoryDetail} from "@/app/(protected)/history/data";
import Icon from "@/components/layout/actionComponents/iconComponent";

const completedDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
});

export default async function HistoryRecord({params}: {
    params: Promise<{ sessionId: string }>;
}) {
    const {sessionId} = await params;
    const historyItem = await getAuthenticatedWorkoutHistoryDetail(sessionId);

    if (!historyItem) {
        notFound();
    }

    const durationMinutes = Math.floor(
        historyItem.durationSeconds / 60,
    );

    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <div className="mx-auto w-full max-w-3xl">
                <header className="flex items-start gap-4">
                    <Link
                        href="/history"
                        aria-label="Back to workout history"
                        className="mt-1 grid size-10 shrink-0 place-items-center rounded-full text-secondary transition hover:bg-surface-subtle hover:text-primary"
                    >
                        <Icon name="arrow-left" className="size-5"/>
                    </Link>

                    <div className="min-w-0">
                        <h1 className="truncate font-display text-title font-bold">
                            {historyItem.workoutName}
                        </h1>
                        <p className="mt-1 text-small text-secondary">
                            <time dateTime={historyItem.completedAt.toISOString()}>
                                {completedDateFormatter.format(
                                    historyItem.completedAt,
                                )}
                            </time>{" "}
                            · {durationMinutes} min
                        </p>
                    </div>
                </header>

                <section
                    aria-label="Workout summary"
                    className="mt-7 grid grid-cols-3 gap-3"
                >
                    <article className="rounded-card border border-border bg-surface px-3 py-6 text-center shadow-card">
                        <p className="font-display text-heading font-bold tabular-nums">
                            {historyItem.exerciseCount}
                        </p>
                        <p className="mt-1 text-small text-secondary">
                            {historyItem.exerciseCount === 1
                                ? "exercise"
                                : "exercises"}
                        </p>
                    </article>

                    <article className="rounded-card border border-border bg-surface px-3 py-6 text-center shadow-card">
                        <p className="font-display text-heading font-bold tabular-nums">
                            {historyItem.setCount}
                        </p>
                        <p className="mt-1 text-small text-secondary">
                            {historyItem.setCount === 1 ? "set" : "sets"}
                        </p>
                    </article>

                    <article className="rounded-card border border-border bg-surface px-3 py-6 text-center shadow-card">
                        <p className="font-display text-heading font-bold tabular-nums">
                            {durationMinutes}
                        </p>
                        <p className="mt-1 text-small text-secondary">
                            {durationMinutes === 1 ? "minute" : "minutes"}
                        </p>
                    </article>
                </section>

                {historyItem.exercises.length === 0 ? (
                    <section className="mt-7 rounded-card border border-border bg-surface p-7 text-center shadow-card">
                        <h2 className="font-display text-heading font-bold">
                            No completed exercises
                        </h2>
                        <p className="mt-2 text-small text-secondary">
                            This workout was saved without any completed sets.
                        </p>
                    </section>
                ) : (
                    <div className="mt-7 space-y-4">
                        {historyItem.exercises.map((exercise) => (
                            <section
                                key={exercise.id}
                                className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
                            >
                                <header className="bg-surface-subtle px-5 py-4">
                                    <h2 className="text-body font-semibold">
                                        {exercise.exerciseName}
                                    </h2>
                                </header>

                                {exercise.sets.length === 0 ? (
                                    <p className="border-t border-divider px-5 py-4 text-small text-secondary">
                                        No completed sets
                                    </p>
                                ) : (
                                    <div className="divide-y divide-divider border-t">
                                        {exercise.sets.map((set) => (
                                            <div
                                                key={set.id}
                                                className="grid min-h-14 grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 px-5 py-3"
                                            >
                                                <span className="text-small text-secondary">
                                                    S{set.position + 1}
                                                </span>

                                                <span className="flex min-w-0 items-baseline gap-2 font-mono text-small font-semibold tabular-nums sm:text-body">
                                                    <span>
                                                        {set.weight === null
                                                            ? "—"
                                                            : set.weight}{" "}
                                                        kg
                                                    </span>
                                                    <span className="text-secondary">×</span>
                                                    <span>{set.reps} reps</span>
                                                </span>

                                                <Icon
                                                    name="check"
                                                    className="size-5 text-brand"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
