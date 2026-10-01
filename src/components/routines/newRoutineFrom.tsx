"use client";

import Link from "next/link";
import {createRoutineAction} from "@/app/(protected)/routines/actions";
import WorkoutsBuilder from "@/components/routines/workoutsBuilder";
import PrimaryButton from "@/components/layout/actionComponents/primaryButton";
import Icon from "@/components/layout/actionComponents/iconComponent";
import {useState} from "react";
import type {Workout} from "@/components/routines/sortableWorkout";
import type {Exercise} from "@/db/schema";

type NewRoutineProps = {
    exercises: Exercise[];
};

export default function NewRoutineFrom({exercises}: NewRoutineProps) {
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    return (
        <main className="flex-1 px-5 py-7 md:px-12 md:py-14">
            <div className="max-w-5xl">
                <header className="flex gap-4">
                    <Link
                        href="/routines"
                        aria-label="Back to routines"
                        className="mt-2 text-secondary"
                    >
                        <Icon name="arrow-left" className="size-5"/>
                    </Link>

                    <div>
                        <h1 className="font-display text-display font-bold text-3xl">
                            New Routine
                        </h1>
                        <p className="mt-1 text-base text-secondary">
                            {workouts.length} {workouts.length === 1 ? "workout" : "workouts"}
                        </p>
                    </div>
                </header>

                <form
                    action={createRoutineAction}
                    className="mt-7 space-y-5 rounded-card border border-border bg-surface p-6 shadow-card"
                >
                    <label className="block" htmlFor="routineName">
                        <span className="form-label">
                            Routine name
                        </span>
                        <input
                            id="routineName"
                            name="name"
                            type="text"
                            placeholder="New Routine"
                            autoComplete="off"
                            className="form-control"
                            required
                        />
                    </label>

                    <label className="block" htmlFor="routineDescription">
                        <span className="form-label">
                            Description
                        </span>
                        <textarea
                            id="routineDescription"
                            name="description"
                            placeholder="Describe your routine"
                            rows={1}
                            className="form-control"
                        />
                    </label>

                    <WorkoutsBuilder
                        workouts={workouts}
                        setWorkouts={setWorkouts}
                        exercises={exercises}
                    />

                    <PrimaryButton
                        type="submit"
                        variant="primary"
                        label="Create routine"
                        pendingLabel="Creating..."
                        ariaLabel="Create routine"
                    />
                </form>
            </div>
        </main>
    )
}
