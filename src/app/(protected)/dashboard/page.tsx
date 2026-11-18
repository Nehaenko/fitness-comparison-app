import Link from "next/link";

import {getAuthenticatedRoutines} from "@/app/(protected)/routines/data";
import ActiveWorkout from "@/components/dashboard/activeWorkout";
import HistoryBlock from "@/components/dashboard/historyBlock";
import {getAuthenticatedDashboardWorkoutHistory} from "@/app/(protected)/history/data";
import {getAuthenticatedDashboardMeasurements} from "@/app/(protected)/measurements/data";
import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import MeasurementBlock from "@/components/dashboard/measurementBlock";
import {getDisplayValue} from "@/helpers/measurement-conversion";

export default async function DashboardPage() {
    const now = new Date();
    const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
    );
    const endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
    );

    const [
        routines,
        profile,
        historyItems,
        dashboardMeasurements,
    ] = await Promise.all([
        getAuthenticatedRoutines(),
        getAuthenticatedUserProfile(),
        getAuthenticatedDashboardWorkoutHistory(
            startDate,
            endDate,
        ),
        getAuthenticatedDashboardMeasurements(),
    ]);

    const activeRoutine = routines.find(
        (routine) => routine.isActive,
    );
    const {
        recentMeasurements,
        latestWeight,
    } = dashboardMeasurements;

    const latestDisplayValue =
        latestWeight === null
            ? null
            : getDisplayValue(
                latestWeight,
                "weight",
                profile,
            );

    if (!activeRoutine) {
        return (
            <main className="flex flex-1 items-center justify-center bg-canvas px-5 py-12 text-primary">
                <section
                    className="w-full max-w-md rounded-card border border-border bg-surface p-7 text-center shadow-card">
                    <h1 className="font-display text-heading font-bold">
                        No active routine
                    </h1>
                    <p className="mt-2 text-secondary">
                        Select a routine before starting a workout.
                    </p>
                    <Link
                        href="/routines/"
                        className="mt-6 inline-flex h-12 items-center justify-center rounded-control bg-brand px-5 font-semibold text-on-accent transition hover:bg-brand-hover"
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
                            {historyItems.completedThisMonth}
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
                            {latestDisplayValue ?? "—"}
                        </p>
                        <p className="mt-1.5 text-base text-secondary">
                            {profile.weightUnit}
                        </p>
                    </article>
                </section>

                <ActiveWorkout activeRoutine={activeRoutine}/>

                <div className="mt-5 grid gap-5">
                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <header className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Recent Workouts
                            </h2>
                            <Link
                                href="/history"
                                prefetch={true}
                                className="text-xs font-semibold text-brand hover:text-brand-hover"
                            >
                                View all
                            </Link>
                        </header>

                        {historyItems.recentWorkouts.length === 0 ? (
                            <div className="px-5 py-6">
                                <p className="text-small font-semibold text-primary">
                                    No completed workouts yet
                                </p>
                                <p className="mt-1 text-small text-secondary">
                                    Finish your first workout and it will appear here.
                                </p>
                            </div>
                        ) : (
                            <HistoryBlock records={historyItems.recentWorkouts}/>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                        <header className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Latest Measurements
                            </h2>
                            <Link
                                href="/measurements"
                                className="text-xs font-semibold text-brand hover:text-brand-hover"
                            >
                                View all
                            </Link>
                        </header>


                        {recentMeasurements.length === 0 ? (
                            <div className="px-5 py-6">
                                <p className="text-small font-semibold text-primary">
                                    No measurements yet
                                </p>
                                <p className="mt-1 text-small text-secondary">
                                    Log your first entry to track your progress.
                                </p>
                            </div>
                        ) : (
                            <MeasurementBlock
                                records={recentMeasurements}
                                profile={profile}
                            />
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
