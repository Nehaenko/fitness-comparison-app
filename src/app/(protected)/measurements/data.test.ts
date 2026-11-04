import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getLatestWeightForUser: vi.fn(),
    getMeasurementsForUser: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/measurements", () => ({
    getLatestWeightForUser:
        mocks.getLatestWeightForUser,
    getMeasurementsForUser:
        mocks.getMeasurementsForUser,
}));

import {
    getAuthenticatedDashboardMeasurements,
    getAuthenticatedMeasurements,
} from "@/app/(protected)/measurements/data";

const userId = "user-1";

describe("authenticated measurement data", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({user: {id: userId}});
    });

    it("rejects requests without an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            getAuthenticatedMeasurements(),
        ).rejects.toThrow("Unauthorized");

        expect(
            mocks.getMeasurementsForUser,
        ).not.toHaveBeenCalled();
    });

    it("loads the complete history for the authenticated user", async () => {
        const measurements = [{id: "measurement-1"}];
        mocks.getMeasurementsForUser.mockResolvedValue(
            measurements,
        );

        await expect(
            getAuthenticatedMeasurements(),
        ).resolves.toEqual(measurements);

        expect(
            mocks.getMeasurementsForUser,
        ).toHaveBeenCalledWith(userId, undefined);
    });

    it("combines three recent entries and the latest weight for the dashboard", async () => {
        const recentMeasurements = [
            {id: "measurement-1"},
            {id: "measurement-2"},
        ];
        mocks.getMeasurementsForUser.mockResolvedValue(
            recentMeasurements,
        );
        mocks.getLatestWeightForUser.mockResolvedValue(79.2);

        await expect(
            getAuthenticatedDashboardMeasurements(),
        ).resolves.toEqual({
            recentMeasurements,
            latestWeight: 79.2,
        });

        expect(
            mocks.getMeasurementsForUser,
        ).toHaveBeenCalledWith(userId, 3);
        expect(
            mocks.getLatestWeightForUser,
        ).toHaveBeenCalledWith(userId);
    });
});
