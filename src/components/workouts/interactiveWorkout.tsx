"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";

import Icon from "@/components/layout/actionComponents/iconComponent";
import ExerciseFrame from "@/components/workouts/exerciseFrame";
import RestTimer from "@/components/workouts/restTimer";
import WorkoutTimer from "@/components/workouts/workoutTimer";
import type {ConfiguredExercise, Workout} from "@/types/routine-builder";
import type {WorkoutSessionDraft, WorkoutSetDraft} from "@/types/workout-session";
import {createWorkoutSessionDraft} from "@/helpers/workout-session";
import {completeWorkoutAction} from "@/app/(protected)/workouts/actions";
import {
    loadActiveWorkout,
    removeActiveWorkout,
    saveActiveWorkout,
} from "@/helpers/active-workout-storage";
import type {
    PreviousExercisePerformanceByExerciseId,
} from "@/types/history";

type InteractiveWorkoutProps = {
    workout: Workout;
    previousPerformanceByExerciseId: PreviousExercisePerformanceByExerciseId;
};

export default function InteractiveWorkout({workout, previousPerformanceByExerciseId}: InteractiveWorkoutProps) {
    const router = useRouter();
    const [activeWorkout, setActiveWorkout] =
        useState<Workout>(workout);
    const [selectedExercise, setSelectedExercise] =
        useState<ConfiguredExercise | null>(
            activeWorkout.exercises[0] ?? null,
        );

    const previousPerformance = selectedExercise
        ? previousPerformanceByExerciseId[
            selectedExercise.exerciseId
            ]
        : undefined;

    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [restEndsAt, setRestEndsAt] = useState<number | null>(null);

    const [
        hasRestoredActiveWorkout,
        setHasRestoredActiveWorkout,
    ] = useState(false);

    const exerciseButtonRefs = useRef(
        new Map<string, HTMLButtonElement>(),
    );

    const [isFinishing, setIsFinishing] = useState(false);
    const [finishError, setFinishError] = useState<string | null>(null);

    const selectedExerciseIndex = activeWorkout.exercises.findIndex(
        (exercise) => exercise.id === selectedExercise?.id,
    );

    const selectedExerciseId = selectedExercise?.id ?? null;

    const nextExercise = activeWorkout.exercises[selectedExerciseIndex + 1];

    const [workoutSession, setWorkoutSession] = useState<WorkoutSessionDraft>(() =>
        createWorkoutSessionDraft(activeWorkout)
    );

    const selectedExerciseDraft = workoutSession.exercises.find(
        (exercise) =>
            exercise.workoutTemplateExerciseId === selectedExercise?.id,
    )

    const updateExerciseSets = (
        workoutTemplateExerciseId: string,
        sets: WorkoutSetDraft[],
    ) => {
        setWorkoutSession((currentSession) => ({
            ...currentSession,
            exercises: currentSession.exercises.map((exercise) =>
                exercise.workoutTemplateExerciseId === workoutTemplateExerciseId
                    ? {...exercise, sets}
                    : exercise,
            ),
        }));
    }

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
        removeActiveWorkout();
        router.replace("/dashboard");
    };

    const finishWorkout = async () => {
        if (isFinishing) {
            return;
        }

        const hasCompletedSet = workoutSession.exercises.some(
            (exercise) => exercise.sets.some((set) => set.completed)
        );

        if (!hasCompletedSet) {
            setFinishError("Complete at least one set before finishing.")
            return;
        }

        setIsFinishing(true);
        setFinishError(null);

        try {
            await completeWorkoutAction(workoutSession);
            removeActiveWorkout();
            router.replace("/history");
        } catch {
            setFinishError("Unable to save your workout. Please try again.",);
        } finally {
            setIsFinishing(false);
        }
    };

    const selectExercise = (exercise: ConfiguredExercise) => {
        setSelectedExercise(exercise);
    };

    useEffect(() => {
        const savedWorkout = loadActiveWorkout();

        const canRestore =
            savedWorkout !== null &&
            savedWorkout.workout.id === workout.id &&
            savedWorkout.session.workoutTemplateId ===
            workout.id;

        /* eslint-disable react-hooks/set-state-in-effect --
           Restore client-only localStorage state after hydration. */

        if (canRestore) {
            setActiveWorkout(savedWorkout.workout);
            setWorkoutSession(savedWorkout.session);

            // Existing selected exercise and rest timer restoration
        }

        setHasRestoredActiveWorkout(true);

        /* eslint-enable react-hooks/set-state-in-effect */
    }, [workout.id]);

    useEffect(() => {
        if (!hasRestoredActiveWorkout) {
            return;
        }

        saveActiveWorkout({
            version: 1,
            workout: activeWorkout,
            session: workoutSession,
            selectedExerciseId,
            restEndsAt,
            updatedAt: Date.now(),
        });
    }, [
        activeWorkout,
        workoutSession,
        selectedExerciseId,
        restEndsAt,
        hasRestoredActiveWorkout,
    ]);

    return (
        <main className="fixed inset-0 z-40 overflow-y-auto bg-canvas text-primary">
            {finishError && (
                <p
                    role="alert"
                    className="mb-4 rounded-control bg-danger-soft p-3 text-sm text-danger"
                >
                    {finishError}
                </p>
            )}
            <div className="mx-auto min-h-dvh w-full max-w-3xl bg-canvas">
                <header
                    className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-divider bg-surface px-4">
                    <button
                        type="button"
                        onClick={() => setShowDiscardDialog(true)}
                        aria-label="Close workout"
                        className="grid size-10 place-items-center rounded-full text-secondary transition hover:bg-surface-subtle hover:text-primary"
                    >
                        <Icon name="close" className="size-5"/>
                    </button>

                    <WorkoutTimer startedAt={workoutSession.startedAt}/>

                    <button
                        type="button"
                        disabled={isFinishing}
                        onClick={finishWorkout}
                        className="h-10 rounded-control bg-brand-soft px-4 text-sm font-semibold text-brand transition hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isFinishing ? "Saving..." : "Finish"}
                    </button>
                </header>

                <nav
                    aria-label={`${activeWorkout.name} exercises`}
                    className="sticky top-16 z-20 overflow-x-auto border-b border-divider bg-surface px-3 py-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    <div className="flex min-w-max gap-2">
                        {activeWorkout.exercises.map((exercise, index) => {
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
                                    className={`h-10 rounded-control border px-4 text-sm font-normal text-primary transition ${
                                        isSelected
                                            ? "border-brand bg-brand-soft"
                                            : "border-transparent hover:bg-surface-subtle"
                                    }`}
                                >
                                    {index + 1}. {exercise.name}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="px-4 py-6 pb-28 md:px-8">
                    {selectedExercise && selectedExerciseDraft ? (
                        <>
                            <ExerciseFrame
                                key={selectedExercise.id}
                                selectedExercise={selectedExercise}
                                sets={selectedExerciseDraft.sets}
                                previousPerformance={previousPerformance}
                                onStartRest={startRest}
                                onSetsChange={(updatedSets) =>
                                    updateExerciseSets(
                                        selectedExerciseDraft.workoutTemplateExerciseId,
                                        updatedSets,
                                    )}
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
                                    disabled={isFinishing}
                                    onClick={finishWorkout}
                                    className="mt-5 flex h-14 w-full items-center justify-center rounded-control bg-brand px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isFinishing ? "Saving workout..." : "Finish workout"}
                                </button>
                            )}
                        </>
                    ) : (
                        <section className="rounded-card border border-border bg-surface p-6 text-center shadow-card">
                            <h1 className="font-display text-heading font-bold">
                                {activeWorkout.name}
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
