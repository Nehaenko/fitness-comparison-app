import Link from "next/link";

import { getAuthenticatedRoutines } from "@/app/(protected)/routines/data";
import ActiveWorkout from "@/components/dashboard/activeWorkout";

export default async function DashboardPage() {
    const routines = await getAuthenticatedRoutines();
    const activeRoutine = routines.find((routine) => routine.isActive);

    if (!activeRoutine) {
        return (
            <main className="flex flex-1 items-center justify-center bg-canvas px-5 py-12 text-primary">
                <section className="w-full max-w-md rounded-card border border-border bg-surface p-7 text-center shadow-card">
                    <h1 className="font-display text-heading font-bold">
                        No active routine
                    </h1>
                    <p className="mt-2 text-secondary">
                        Select a routine before starting a workout.
                    </p>
                    <Link
                        href="/routines/"
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-control bg-brand px-5 font-semibold text-inverse transition hover:bg-brand-hover"
                    >
                        Choose a routine
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-canvas px-4 py-5 text-primary">
            <div className="w-full">
                <section
                    aria-label="Monthly overview"
                    className="grid grid-cols-2 gap-3"
                >
                    <article className="min-h-28 rounded-card border border-border bg-surface p-4 shadow-card">
                        <h2 className="text-base font-semibold uppercase tracking-wide text-secondary">
                            This month
                        </h2>
                        <p className="mt-2 font-display text-xl font-bold">
                            0
                        </p>
                        <p className="mt-1.5 text-base text-secondary">
                            workouts
                        </p>
                    </article>

                    <article className="min-h-28 rounded-card border border-border bg-surface p-4 shadow-card">
                        <h2 className="text-base font-semibold uppercase tracking-wide text-secondary">
                            Weight
                        </h2>
                        <p className="mt-2 font-display text-xl font-bold">
                            79.2
                        </p>
                        <p className="mt-1.5 text-base text-secondary">
                            kg
                        </p>
                    </article>
                </section>

                <ActiveWorkout activeRoutine={activeRoutine} />

                <div className="mt-5 grid gap-5">
                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <header className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Recent Workouts
                            </h2>
                            <Link
                                href="#"
                                className="text-xs font-semibold text-brand hover:text-brand-hover"
                            >
                                View all
                            </Link>
                        </header>

                        <p className="px-5 py-5 text-xs text-secondary">
                            History block here
                        </p>
                    </section>

                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <header className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Latest Measurements
                            </h2>
                            <Link
                                href="#"
                                className="text-xs font-semibold text-brand hover:text-brand-hover"
                            >
                                Update
                            </Link>
                        </header>

                        <p className="px-5 py-5 text-xs text-secondary">
                            Measurements block here
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
