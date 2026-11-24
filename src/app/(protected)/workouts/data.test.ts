import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getPreviousExercisePerformanceForUser: vi.fn(),
    getWorkoutWithExercisesForUser: vi.fn(),
    getExercisesForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/workoutHistory", () => ({
    getPreviousExercisePerformanceForUser:
        mocks.getPreviousExercisePerformanceForUser,
}));

vi.mock("@/db/workoutTemplates", () => ({
    getWorkoutWithExercisesForUser:
        mocks.getWorkoutWithExercisesForUser,
}));

vi.mock("@/db/exercises", () => ({
    getExercisesForUser: mocks.getExercisesForUser,
}));

import {getAuthenticatedWorkoutWithPreviousPerformance} from "@/app/(protected)/workouts/data";

const userId = "user-1";

describe("active workout history data", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({user: {id: userId}});
    });

    it("rejects requests without an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            getAuthenticatedWorkoutWithPreviousPerformance("workout-1"),
        ).rejects.toThrow("Unauthorized");
        expect(
            mocks.getWorkoutWithExercisesForUser,
        ).not.toHaveBeenCalled();
    });

    it("returns null when the workout does not belong to the user", async () => {
        mocks.getWorkoutWithExercisesForUser.mockResolvedValue(null);

        await expect(
            getAuthenticatedWorkoutWithPreviousPerformance("workout-1"),
        ).resolves.toBeNull();
        expect(
            mocks.getPreviousExercisePerformanceForUser,
        ).not.toHaveBeenCalled();
        expect(mocks.getExercisesForUser).not.toHaveBeenCalled();
    });

    it("loads previous values for every exercise in the workout", async () => {
        const workout = {
            id: "workout-1",
            exercises: [
                {exerciseId: "exercise-1"},
                {exerciseId: "exercise-2"},
            ],
        };
        const previousPerformanceByExerciseId = {
            "exercise-1": {
                exerciseId: "exercise-1",
                completedAt: new Date("2026-10-20T12:00:00Z"),
                sets: [],
            },
        };

        mocks.getWorkoutWithExercisesForUser.mockResolvedValue(workout);
        mocks.getPreviousExercisePerformanceForUser.mockResolvedValue(
            previousPerformanceByExerciseId,
        );
        const exercises = [
            {id: "exercise-1", name: "Squat"},
            {id: "exercise-2", name: "Bench press"},
        ];
        mocks.getExercisesForUser.mockResolvedValue(exercises);

        await expect(
            getAuthenticatedWorkoutWithPreviousPerformance("workout-1"),
        ).resolves.toEqual({
            workout,
            exercises,
            previousPerformanceByExerciseId,
        });
        expect(
            mocks.getWorkoutWithExercisesForUser,
        ).toHaveBeenCalledWith("workout-1", userId);
        expect(
            mocks.getPreviousExercisePerformanceForUser,
        ).toHaveBeenCalledWith(userId, ["exercise-1", "exercise-2"]);
        expect(mocks.getExercisesForUser).toHaveBeenCalledWith(userId);
    });
});
