import {afterEach, describe, expect, it, vi} from "vitest";

import {getCompletedWorkoutValues} from "@/validation/workout-session";

const workoutTemplateId = "11111111-1111-4111-8111-111111111111";
const workoutTemplateExerciseId = "22222222-2222-4222-8222-222222222222";
const exerciseId = "33333333-3333-4333-8333-333333333333";

function createSession(overrides: Record<string, unknown> = {}) {
    return {
        id: "44444444-4444-4444-8444-444444444444",
        workoutTemplateId,
        startedAt: new Date("2026-10-20T11:30:00.000Z").getTime(),
        exercises: [
            {
                workoutTemplateExerciseId,
                exerciseId,
                sets: [
                    {
                        id: "55555555-5555-4555-8555-555555555555",
                        weight: 80,
                        reps: 8,
                        completed: true,
                    },
                    {
                        id: "66666666-6666-4666-8666-666666666666",
                        weight: 82.5,
                        reps: null,
                        completed: false,
                    },
                ],
            },
        ],
        ...overrides,
    };
}

afterEach(() => {
    vi.useRealTimers();
});

describe("getCompletedWorkoutValues", () => {
    it("normalises completed sets and excludes incomplete sets", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        const values = getCompletedWorkoutValues(createSession());

        expect(values).toEqual({
            workoutTemplateId,
            startedAt: new Date("2026-10-20T11:30:00.000Z"),
            completedAt: new Date("2026-10-20T12:00:00.000Z"),
            durationSeconds: 1_800,
            exercises: [
                {
                    workoutTemplateExerciseId,
                    exerciseId,
                    position: 0,
                    sets: [
                        {
                            weight: 80,
                            reps: 8,
                            position: 0,
                        },
                    ],
                },
            ],
        });
    });

    it("rejects a workout without a completed set", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        const session = createSession();
        session.exercises[0].sets[0].completed = false;

        expect(() => getCompletedWorkoutValues(session)).toThrow(
            "Complete at least one set",
        );
    });

    it("rejects invalid reps on a completed set", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        const session = createSession();
        session.exercises[0].sets[0].reps = 0;

        expect(() => getCompletedWorkoutValues(session)).toThrow(
            "Invalid completed set reps",
        );
    });

    it("rejects invalid weight on a completed set", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        const session = createSession();
        session.exercises[0].sets[0].weight = -1;

        expect(() => getCompletedWorkoutValues(session)).toThrow(
            "Invalid completed set weight",
        );
    });

    it("rejects a start time in the future", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        expect(() =>
            getCompletedWorkoutValues(
                createSession({startedAt: Date.now() + 1_000}),
            ),
        ).toThrow("Invalid workout duration");
    });
});
