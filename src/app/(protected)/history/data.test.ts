import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getCompletedWorkoutCountForUserBetween: vi.fn(),
    getWorkoutHistoryDetailForUser: vi.fn(),
    getWorkoutHistorySummariesForUser: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/workoutHistory", () => ({
    getCompletedWorkoutCountForUserBetween:
        mocks.getCompletedWorkoutCountForUserBetween,
    getWorkoutHistoryDetailForUser:
        mocks.getWorkoutHistoryDetailForUser,
    getWorkoutHistorySummariesForUser:
        mocks.getWorkoutHistorySummariesForUser,
}));

import {
    getAuthenticatedDashboardWorkoutHistory,
    getAuthenticatedWorkoutHistoryDetail,
    getAuthenticatedWorkoutHistorySummaries,
} from "@/app/(protected)/history/data";

const userId = "user-1";

describe("authenticated workout history data", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({user: {id: userId}});
    });

    it("rejects requests without an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            getAuthenticatedWorkoutHistorySummaries(20),
        ).rejects.toThrow("Unauthorized");
        expect(
            mocks.getWorkoutHistorySummariesForUser,
        ).not.toHaveBeenCalled();
    });

    it("loads history summaries for the authenticated user", async () => {
        const summaries = [
            {
                id: "session-1",
                workoutName: "Upper Body",
                completedAt: new Date("2026-10-20T12:00:00Z"),
                durationSeconds: 3600,
                exerciseCount: 4,
            },
        ];
        mocks.getWorkoutHistorySummariesForUser.mockResolvedValue(
            summaries,
        );

        await expect(
            getAuthenticatedWorkoutHistorySummaries(20),
        ).resolves.toEqual(summaries);
        expect(
            mocks.getWorkoutHistorySummariesForUser,
        ).toHaveBeenCalledWith(userId, 20);
    });

    it("combines recent workouts and the monthly count for the dashboard", async () => {
        const startDate = new Date("2026-10-01T00:00:00Z");
        const endDate = new Date("2026-11-01T00:00:00Z");
        const recentWorkouts = [{id: "session-1"}];

        mocks.getWorkoutHistorySummariesForUser.mockResolvedValue(
            recentWorkouts,
        );
        mocks.getCompletedWorkoutCountForUserBetween.mockResolvedValue(5);

        await expect(
            getAuthenticatedDashboardWorkoutHistory(startDate, endDate),
        ).resolves.toEqual({
            completedThisMonth: 5,
            recentWorkouts,
        });
        expect(
            mocks.getWorkoutHistorySummariesForUser,
        ).toHaveBeenCalledWith(userId, 3);
        expect(
            mocks.getCompletedWorkoutCountForUserBetween,
        ).toHaveBeenCalledWith(userId, startDate, endDate);
    });

    it("scopes a history detail request to the authenticated user", async () => {
        const detail = {id: "session-1"};
        mocks.getWorkoutHistoryDetailForUser.mockResolvedValue(detail);

        await expect(
            getAuthenticatedWorkoutHistoryDetail("session-1"),
        ).resolves.toEqual(detail);
        expect(
            mocks.getWorkoutHistoryDetailForUser,
        ).toHaveBeenCalledWith("session-1", userId);
    });
});
