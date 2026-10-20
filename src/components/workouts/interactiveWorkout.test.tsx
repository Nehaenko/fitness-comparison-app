import {render, screen, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";

import InteractiveWorkout from "@/components/workouts/interactiveWorkout";
import {
    loadActiveWorkout,
    saveActiveWorkout,
} from "@/helpers/active-workout-storage";
import type {Workout} from "@/types/routine-builder";
import type {PersistedActiveWorkout} from "@/types/workout-session";

const router = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => router,
}));

vi.mock("@/app/(protected)/workouts/actions", () => ({
    completeWorkoutAction: vi.fn(),
}));

vi.mock("@/components/workouts/workoutTimer", () => ({
    default: ({startedAt}: {startedAt: number}) => (
        <output data-testid="workout-timer">{startedAt}</output>
    ),
}));

vi.mock("@/components/workouts/restTimer", () => ({
    default: ({endsAt}: {endsAt: number}) => (
        <output data-testid="rest-timer">{endsAt}</output>
    ),
}));

const workoutId = "11111111-1111-4111-8111-111111111111";
const firstConfiguredExerciseId = "22222222-2222-4222-8222-222222222222";
const secondConfiguredExerciseId = "33333333-3333-4333-8333-333333333333";

function createWorkout(
    firstName = "Bench Press",
    secondName = "Barbell Row",
): Workout {
    return {
        id: workoutId,
        name: "Upper Body",
        exercises: [
            {
                id: firstConfiguredExerciseId,
                exerciseId: "44444444-4444-4444-8444-444444444444",
                name: firstName,
                muscleGroup: "chest",
                equipment: "barbell",
                sets: 1,
                targetReps: 8,
                targetWeight: 80,
                restSeconds: 90,
            },
            {
                id: secondConfiguredExerciseId,
                exerciseId: "55555555-5555-4555-8555-555555555555",
                name: secondName,
                muscleGroup: "back",
                equipment: "barbell",
                sets: 1,
                targetReps: 10,
                targetWeight: 70,
                restSeconds: 60,
            },
        ],
    };
}

beforeEach(() => {
    window.localStorage.clear();
    router.push.mockReset();
    router.replace.mockReset();
    Element.prototype.scrollIntoView = vi.fn();
});

describe("InteractiveWorkout persistence", () => {
    it("restores the saved session, selected exercise, and rest timer", async () => {
        const savedWorkout = createWorkout(
            "Saved Bench Press",
            "Saved Barbell Row",
        );
        const startedAt = Date.now() - 30_000;
        const restEndsAt = Date.now() + 60_000;
        const persistedWorkout: PersistedActiveWorkout = {
            version: 1,
            workout: savedWorkout,
            session: {
                id: "66666666-6666-4666-8666-666666666666",
                workoutTemplateId: workoutId,
                startedAt,
                exercises: savedWorkout.exercises.map((exercise, index) => ({
                    workoutTemplateExerciseId: exercise.id,
                    exerciseId: exercise.exerciseId,
                    sets: [
                        {
                            id: `77777777-7777-4777-8777-77777777777${index}`,
                            weight: exercise.targetWeight,
                            reps: exercise.targetReps,
                            completed: index === 1,
                        },
                    ],
                })),
            },
            selectedExerciseId: secondConfiguredExerciseId,
            restEndsAt,
            updatedAt: Date.now(),
        };

        saveActiveWorkout(persistedWorkout);

        render(<InteractiveWorkout workout={createWorkout()}/>);

        expect(
            await screen.findByRole("heading", {
                name: "Saved Barbell Row",
            }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("workout-timer")).toHaveTextContent(
            String(startedAt),
        );
        expect(screen.getByTestId("rest-timer")).toHaveTextContent(
            String(restEndsAt),
        );

        await waitFor(() => {
            expect(loadActiveWorkout()?.selectedExerciseId).toBe(
                secondConfiguredExerciseId,
            );
        });
    });

    it("persists a fresh workout after restoration has been checked", async () => {
        const workout = createWorkout();

        render(<InteractiveWorkout workout={workout}/>);

        await waitFor(() => {
            const persistedWorkout = loadActiveWorkout();

            expect(persistedWorkout?.workout.id).toBe(workout.id);
            expect(persistedWorkout?.session.workoutTemplateId).toBe(
                workout.id,
            );
            expect(persistedWorkout?.selectedExerciseId).toBe(
                firstConfiguredExerciseId,
            );
        });
    });
});
