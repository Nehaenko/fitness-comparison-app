import Link from "next/link";

import {getAuthenticatedWorkoutHistorySummaries} from "@/app/(protected)/history/data";
import Icon from "@/components/layout/actionComponents/iconComponent";
import type {WorkoutHistorySummary} from "@/types/history";

const HISTORY_PAGE_SIZE = 20;
const DISPLAY_TIME_ZONE = "Europe/London";

const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
});

const shortMonthFormatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: DISPLAY_TIME_ZONE,
});

function groupHistoryByMonth(historyItems: WorkoutHistorySummary[]) {
    const groups = new Map<
        string,
        {
            label: string;
            items: WorkoutHistorySummary[];
        }
    >();

    for (const historyItem of historyItems) {
        const label = monthYearFormatter
            .format(historyItem.completedAt)
            .toUpperCase();
        const existingGroup = groups.get(label);

        if (existingGroup) {
            existingGroup.items.push(historyItem);
        } else {
            groups.set(label, {
                label,
                items: [historyItem],
            });
        }
    }

    return Array.from(groups.values());
}

export default async function HistoryPage() {
    const historyItems = await getAuthenticatedWorkoutHistorySummaries(
        HISTORY_PAGE_SIZE,
    );
    const historyGroups = groupHistoryByMonth(historyItems);

    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <div className="mx-auto w-full max-w-3xl">
                <header>
                    <h1 className="font-display text-display font-bold text-3xl">
                        History
                    </h1>
                    <p className="mt-1 text-body text-secondary">
                        {historyItems.length}{" "}
                        {historyItems.length === 1
                            ? "workout logged"
                            : "workouts logged"}
                    </p>
                </header>

                {historyGroups.length === 0 ? (
                    <section className="mt-8 rounded-card border border-border bg-surface p-7 text-center shadow-card">
                        <h2 className="font-display text-heading font-bold">
                            No workouts logged yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-sm text-small text-secondary">
                            Complete your first workout and its exercises and sets
                            will appear here.
                        </p>
                        <Link
                            href="/dashboard"
                            className="mt-6 inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-small font-semibold text-on-accent transition hover:bg-brand-hover"
                        >
                            Go to dashboard
                        </Link>
                    </section>
                ) : (
                    <div className="mt-8 space-y-7">
                        {historyGroups.map((group) => (
                            <section key={group.label}>
                                <h2 className="mb-3 px-1 text-label font-semibold tracking-wider text-secondary">
                                    {group.label}
                                </h2>

                                <div className="divide-y divide-divider overflow-hidden rounded-card bg-surface shadow-card">
                                    {group.items.map((historyItem) => {
                                        const durationMinutes = Math.floor(
                                            historyItem.durationSeconds / 60,
                                        );

                                        return (
                                            <Link
                                                key={historyItem.id}
                                                href={`/history/${historyItem.id}`}
                                                className="grid grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 p-3 transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
                                            >
                                                <time
                                                    dateTime={historyItem.completedAt.toISOString()}
                                                    className="text-center"
                                                >
                                                    <span className="block text-small font-semibold tabular-nums">
                                                        {dayFormatter.format(
                                                            historyItem.completedAt,
                                                        )}
                                                    </span>
                                                    <span className="mt-0.5 block text-label uppercase text-secondary">
                                                        {shortMonthFormatter.format(
                                                            historyItem.completedAt,
                                                        )}
                                                    </span>
                                                </time>

                                                <span className="min-w-0">
                                                    <span className="block truncate text-body font-semibold">
                                                        {historyItem.workoutName}
                                                    </span>
                                                    <span className="mt-0.5 block text-small text-secondary">
                                                        {historyItem.exerciseCount}{" "}
                                                        {historyItem.exerciseCount === 1
                                                            ? "exercise"
                                                            : "exercises"}{" "}
                                                        · {durationMinutes} min
                                                    </span>
                                                </span>

                                                <Icon
                                                    name="chevron-right"
                                                    className="size-5 text-secondary"
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
