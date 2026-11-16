"use client"

import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {RoutineWithWorkouts, WorkoutSummary} from "@/types/routine-builder";

type ActiveWorkoutProps = {
    activeRoutine: RoutineWithWorkouts;
}

export default function ActiveWorkout({activeRoutine}: ActiveWorkoutProps) {
    const router = useRouter();
    const [selectedWorkout, setSelectedWorkout] =
        useState<WorkoutSummary | null>(activeRoutine.workouts[0] ?? null);

    const selectWorkout = (workout: WorkoutSummary) => {
        setSelectedWorkout(workout);
    }

    const handleStartWorkout = () => {
        if (!selectedWorkout) return;
        startWorkout(selectedWorkout.id);
    };

    const startWorkout = (id:string) => {
        router.push(`/workouts/${id}/`);
    };

    return (
        <>
            <section className="mt-5 rounded-card bg-surface-inverse px-5 py-5 text-inverse shadow-card">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-inverse-muted">
                            Active routine
                        </p>
                        <h1 className="mt-1.5 font-display text-base font-bold">
                            {activeRoutine.name}
                        </h1>
                        <p className="mt-0.5 text-xs text-inverse-muted">
                            {activeRoutine.workouts.length}{" "}
                            {activeRoutine.workouts.length === 1
                                ? "workout"
                                : "workouts"}{" "}
                            per week
                        </p>
                    </div>
                    <Link
                        href="/routines/"
                        aria-label="Change active routine"
                        className="shrink-0 pt-0.5 text-xs text-inverse-muted transition hover:text-inverse"
                    >
                        Change
                    </Link>
                </div>

                <div className="mt-5">
                    <p className="text-xs font-semibold text-inverse-soft">
                        Choose the workout you want to start
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-2.5">
                        {activeRoutine.workouts.map((workout) => {
                            return (
                                <button
                                    type="button"
                                    key={workout.id}
                                    onClick={() => selectWorkout(workout)}
                                    aria-pressed={selectedWorkout?.id === workout.id}
                                    className={`flex h-10 items-center gap-1.5 rounded-control border px-3 text-xs font-semibold transition ${
                                        selectedWorkout?.id === workout.id
                                            ? "border-surface bg-surface text-primary"
                                            : "border-border-inverse-control bg-surface-inverse-control text-inverse-soft hover:bg-surface-inverse-control-hover"
                                    }`}
                                >
                                    {workout.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-divider-inverse pt-5">
                    <div className="min-w-0">
                        <p className="text-xs text-inverse-muted">
                            Selected workout
                        </p>
                        <p className="mt-0.5 truncate text-base font-semibold">
                            {selectedWorkout?.name ?? "No workout selected"}
                        </p>
                        {selectedWorkout && (
                            <p className="mt-0.5 text-xs text-inverse-muted">
                                {selectedWorkout.exerciseCount}{" "}
                                {selectedWorkout.exerciseCount === 1 ? "exercise" : "exercises"}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleStartWorkout}
                        disabled={!selectedWorkout}
                        className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Icon name="play" className="size-4" />
                        Start workout
                    </button>
                </div>
            </section>
        </>
    )
}
