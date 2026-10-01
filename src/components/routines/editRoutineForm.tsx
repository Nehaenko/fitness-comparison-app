"use client";

import {useState} from "react";
import Link from "next/link";

import PrimaryButton from "@/components/layout/actionComponents/primaryButton";
import Icon from "@/components/layout/actionComponents/iconComponent";
import WorkoutsBuilder from "@/components/routines/workoutsBuilder";
import type {Workout} from "@/types/routine-builder";
import {updateRoutineAction} from "@/app/(protected)/routines/actions";
import type {Exercise} from "@/db/schema";

type EditRoutineFormProps = {
    routine: {
        id: string;
        name: string;
        description: string | null;
    };
    initialWorkouts: Workout[];
    exercises: Exercise[];
};

export default function EditRoutineForm({
                                            routine,
                                            initialWorkouts,
                                            exercises
                                        }: EditRoutineFormProps) {
    const [workouts, setWorkouts] =
        useState<Workout[]>(initialWorkouts);

    const updateAction = updateRoutineAction.bind(
        null,
        routine.id,
    );

    return (
        <main className="flex-1 px-5 py-7 md:px-12 md:py-14">
            <div className="max-w-5xl">
                <header className="flex gap-4">
                    <Link
                        href="/routines"
                        aria-label="Back to routines"
                        className="mt-2 text-secondary"
                    >
                        <Icon name="arrow-left" className="size-5" />
                    </Link>

                    <div>
                        <h1 className="font-display text-display font-bold text-3xl">
                            Edit Routine
                        </h1>
                        <p className="mt-1 text-base text-secondary">
                            Update your routine details
                        </p>
                    </div>
                </header>

                <form
                    action={updateAction}
                    className="mt-7 space-y-5 rounded-card border border-border bg-surface p-6 shadow-card"
                >
                    <label className="block" htmlFor="routineName">
                        <span className="form-label">Routine name</span>
                        <input
                            id="routineName"
                            name="name"
                            className="form-control"
                            defaultValue={routine.name}
                            required
                        />
                    </label>

                    <label className="block" htmlFor="routineDescription">
                        <span className="form-label">Description</span>
                        <textarea
                            id="routineDescription"
                            name="description"
                            className="form-control"
                            defaultValue={routine.description ?? ""}
                            rows={1}
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
                        label="Save changes"
                        pendingLabel="Saving..."
                    />
                </form>
            </div>
        </main>
    );
}
