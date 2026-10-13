"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";

import Icon from "@/components/layout/actionComponents/iconComponent";
import ExerciseFrame from "@/components/workouts/exerciseFrame";
import RestTimer from "@/components/workouts/restTimer";
import WorkoutTimer from "@/components/workouts/workoutTimer";
import type {ConfiguredExercise, Workout} from "@/types/routine-builder";

type InteractiveWorkoutProps = {
    workout: Workout;
};

export default function InteractiveWorkout({workout}: InteractiveWorkoutProps) {
    const router = useRouter();
    const [selectedExercise, setSelectedExercise] =
        useState<ConfiguredExercise | null>(
            workout.exercises[0] ?? null,
        );
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
    const exerciseButtonRefs = useRef(
        new Map<string, HTMLButtonElement>(),
    );
    const selectedExerciseIndex = workout.exercises.findIndex(
        (exercise) => exercise.id === selectedExercise?.id,
    );
    const nextExercise = workout.exercises[selectedExerciseIndex + 1];

    const startRest = useCallback((seconds: number) => {
        setRestEndsAt(Date.now() + seconds * 1000);
    }, []);

    const stopRest = useCallback(() => {
        setRestEndsAt(null);
    }, []);

    useEffect(() => {
        if (!selectedExercise) {
            return;
        }

        exerciseButtonRefs.current
            .get(selectedExercise.id)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
            });
    }, [selectedExercise]);

    const discardChanges = () => {
        router.push("/dashboard");
    };

    const finishWorkout = () => {
        console.log("finish workout");
    };

    const selectExercise = (exercise: ConfiguredExercise) => {
        setSelectedExercise(exercise);
    };

    return (
        <main className="fixed inset-0 z-40 overflow-y-auto bg-canvas text-primary">
            <div className="mx-auto min-h-dvh w-full max-w-3xl bg-canvas">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-divider bg-surface px-4">
                    <button
                        type="button"
                        onClick={() => setShowDiscardDialog(true)}
                        aria-label="Close workout"
                        className="grid size-10 place-items-center rounded-full text-secondary transition hover:bg-surface-subtle hover:text-primary"
                    >
                        <Icon name="close" className="size-5" />
                    </button>

                    <WorkoutTimer />

                    <button
                        type="button"
                        onClick={finishWorkout}
                        className="h-10 rounded-control bg-brand-soft px-4 text-sm font-semibold text-brand transition hover:bg-brand-soft-hover"
                    >
                        Finish
                    </button>
                </header>

                <nav
                    aria-label={`${workout.name} exercises`}
                    className="sticky top-16 z-20 overflow-x-auto border-b border-divider bg-surface px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    <div className="flex min-w-max gap-2">
                        {workout.exercises.map((exercise, index) => {
                            const isSelected = selectedExercise?.id === exercise.id;

                            return (
                                <button
                                    type="button"
                                    key={exercise.id}
                                    ref={(button) => {
                                        if (button) {
                                            exerciseButtonRefs.current.set(
                                                exercise.id,
                                                button,
                                            );
                                        } else {
                                            exerciseButtonRefs.current.delete(
                                                exercise.id,
                                            );
                                        }
                                    }}
                                    onClick={() => selectExercise(exercise)}
                                    aria-pressed={isSelected}
                                    className={`h-10 rounded-control px-4 text-sm font-semibold transition ${
                                        isSelected
                                            ? "bg-surface-inverse text-inverse"
                                            : "text-secondary hover:bg-surface-subtle hover:text-primary"
                                    }`}
                                >
                                    {index + 1}. {exercise.name}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="px-4 py-6 pb-28 md:px-8">
                    {selectedExercise ? (
                        <>
                            <ExerciseFrame
                                key={selectedExercise.id}
                                selectedExercise={selectedExercise}
                                onStartRest={startRest}
                            />

                            {nextExercise ? (
                                <button
                                    type="button"
                                    onClick={() => setSelectedExercise(nextExercise)}
                                    className="mt-5 flex h-14 w-full items-center justify-center rounded-control bg-surface-inverse px-5 text-sm text-white font-semibold"
                                >
                                    Next: {nextExercise.name}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={finishWorkout}
                                    className="mt-5 flex h-14 w-full items-center justify-center rounded-control bg-brand px-5 text-sm font-semibold text-white"
                                >
                                    Finish workout
                                </button>
                            )}
                        </>
                    ) : (
                        <section className="rounded-card border border-border bg-surface p-6 text-center shadow-card">
                            <h1 className="font-display text-heading font-bold">
                                {workout.name}
                            </h1>
                            <p className="mt-2 text-sm text-secondary">
                                This workout does not contain any exercises yet.
                            </p>
                        </section>
                    )}
                </div>
            </div>

            {showDiscardDialog && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-backdrop p-5 backdrop-blur-[3px]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="discard-workout-title"
                >
                    <div className="w-full max-w-sm rounded-panel bg-surface px-7 py-8 text-center shadow-floating">
                        <h2
                            id="discard-workout-title"
                            className="font-display text-heading font-bold"
                        >
                            Discard workout?
                        </h2>
                        <p className="mt-2 text-sm text-secondary">
                            Your progress won&apos;t be saved.
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDiscardDialog(false)}
                                className="h-12 rounded-control border border-border bg-surface px-3 text-sm font-semibold"
                            >
                                Keep going
                            </button>
                            <button
                                type="button"
                                onClick={discardChanges}
                                className="h-12 rounded-control bg-danger px-3 text-sm font-semibold text-white"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {restEndsAt !== null && (
                <RestTimer
                    key={restEndsAt}
                    endsAt={restEndsAt}
                    onComplete={stopRest}
                    onSkip={stopRest}
                />
            )}
        </main>
    );
}
