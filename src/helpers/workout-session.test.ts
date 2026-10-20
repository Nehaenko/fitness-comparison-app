import {afterEach, describe, expect, it, vi} from "vitest";

import {
    createWorkoutSessionDraft,
    getElapsedSeconds,
} from "@/helpers/workout-session";
import type {Workout} from "@/types/routine-builder";

const workout: Workout = {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Upper Body",
    exercises: [
        {
            id: "22222222-2222-4222-8222-222222222222",
            exerciseId: "33333333-3333-4333-8333-333333333333",
            name: "Bench Press",
            muscleGroup: "chest",
            equipment: "barbell",
            sets: 2,
            targetReps: 8,
            targetWeight: 80,
            restSeconds: 90,
        },
    ],
};

afterEach(() => {
    vi.useRealTimers();
});

describe("createWorkoutSessionDraft", () => {
    it("creates editable sets from the workout template", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        const draft = createWorkoutSessionDraft(workout);

        expect(draft.workoutTemplateId).toBe(workout.id);
        expect(draft.startedAt).toBe(Date.now());
        expect(draft.exercises).toHaveLength(1);
        expect(draft.exercises[0]).toMatchObject({
            workoutTemplateExerciseId: workout.exercises[0].id,
            exerciseId: workout.exercises[0].exerciseId,
            sets: [
                {weight: 80, reps: 8, completed: false},
                {weight: 80, reps: 8, completed: false},
            ],
        });
        expect(draft.id).toEqual(expect.any(String));
        expect(draft.exercises[0].sets[0].id).not.toBe(
            draft.exercises[0].sets[1].id,
        );
    });
});

describe("getElapsedSeconds", () => {
    it("calculates elapsed time from the original timestamp", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:01:05.000Z"));

        const startedAt = new Date("2026-10-20T12:00:00.000Z").getTime();

        expect(getElapsedSeconds(startedAt)).toBe(65);
    });

    it("never returns a negative value", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        expect(getElapsedSeconds(Date.now() + 10_000)).toBe(0);
    });
});
