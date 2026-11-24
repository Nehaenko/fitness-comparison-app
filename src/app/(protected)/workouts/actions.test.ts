import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    canUserUseExercises: vi.fn(),
    createWorkoutSessionForUser: vi.fn(),
    getCompletedWorkoutValues: vi.fn(),
    getPreviousExercisePerformanceForUser: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/exercises", () => ({
    canUserUseExercises: mocks.canUserUseExercises,
}));

vi.mock("@/db/workoutHistory", () => ({
    getPreviousExercisePerformanceForUser:
        mocks.getPreviousExercisePerformanceForUser,
}));

vi.mock("@/db/workoutSession", () => ({
    createWorkoutSessionForUser: mocks.createWorkoutSessionForUser,
}));

vi.mock("@/validation/workout-session", () => ({
    getCompletedWorkoutValues: mocks.getCompletedWorkoutValues,
}));

import {
    getReplacementExerciseHistoryAction,
} from "@/app/(protected)/workouts/actions";

const userId = "user-1";
const exerciseId = "11111111-1111-4111-8111-111111111111";

describe("replacement exercise history action", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({user: {id: userId}});
    });

    it("requires an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            getReplacementExerciseHistoryAction(exerciseId),
        ).rejects.toThrow("Unauthorized");
    });

    it("rejects an exercise the user cannot access", async () => {
        mocks.canUserUseExercises.mockResolvedValue(false);

        await expect(
            getReplacementExerciseHistoryAction(exerciseId),
        ).rejects.toThrow("Exercise unavailable");
        expect(
            mocks.getPreviousExercisePerformanceForUser,
        ).not.toHaveBeenCalled();
    });

    it("returns the latest history for an allowed replacement", async () => {
        const history = {
            exerciseId,
            completedAt: new Date("2026-11-20T12:00:00Z"),
            sets: [],
        };
        mocks.canUserUseExercises.mockResolvedValue(true);
        mocks.getPreviousExercisePerformanceForUser.mockResolvedValue({
            [exerciseId]: history,
        });

        await expect(
            getReplacementExerciseHistoryAction(exerciseId),
        ).resolves.toEqual(history);
        expect(mocks.canUserUseExercises).toHaveBeenCalledWith(
            userId,
            [exerciseId],
        );
    });
});
