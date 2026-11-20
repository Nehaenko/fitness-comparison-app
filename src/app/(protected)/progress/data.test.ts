import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getProgressEntriesForUser: vi.fn(),
    getMeasurementsForUser: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/progress", () => ({
    getProgressEntriesForUser:
        mocks.getProgressEntriesForUser,
}));

vi.mock("@/db/measurements", () => ({
    getMeasurementsForUser:
        mocks.getMeasurementsForUser,
}));

import {getAuthenticatedProgressEntries} from "@/app/(protected)/progress/data";

describe("getAuthenticatedProgressEntries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({
            user: {id: "user-1"},
        });
    });

    it("rejects requests without an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            getAuthenticatedProgressEntries(),
        ).rejects.toThrow("Unauthorized");

        expect(
            mocks.getProgressEntriesForUser,
        ).not.toHaveBeenCalled();
        expect(
            mocks.getMeasurementsForUser,
        ).not.toHaveBeenCalled();
    });

    it("loads entries only for the authenticated user", async () => {
        const entries = [{
            id: "progress-1",
            recordedOn: "2026-11-15",
            photos: [],
        }];
        const measurement = {
            id: "measurement-1",
            measuredOn: "2026-11-10",
            weight: 60,
            waist: 64,
            chest: 92,
            hips: 95,
            thigh: null,
            arm: null,
        };
        mocks.getProgressEntriesForUser.mockResolvedValue(entries);
        mocks.getMeasurementsForUser.mockResolvedValue([
            {
                ...measurement,
                id: "future-measurement",
                measuredOn: "2026-11-18",
            },
            measurement,
        ]);

        await expect(
            getAuthenticatedProgressEntries(),
        ).resolves.toEqual([{
            ...entries[0],
            measurement,
        }]);

        expect(
            mocks.getProgressEntriesForUser,
        ).toHaveBeenCalledWith("user-1");
        expect(
            mocks.getMeasurementsForUser,
        ).toHaveBeenCalledWith("user-1");
    });

    it("returns no context when all measurements are after the photo", async () => {
        mocks.getProgressEntriesForUser.mockResolvedValue([{
            id: "progress-1",
            recordedOn: "2026-11-05",
            photos: [],
        }]);
        mocks.getMeasurementsForUser.mockResolvedValue([{
            id: "measurement-1",
            measuredOn: "2026-11-10",
            weight: 60,
            waist: null,
            chest: null,
            hips: null,
            thigh: null,
            arm: null,
        }]);

        await expect(
            getAuthenticatedProgressEntries(),
        ).resolves.toEqual([{
            id: "progress-1",
            recordedOn: "2026-11-05",
            photos: [],
            measurement: null,
        }]);
    });
});
