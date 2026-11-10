import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    getProgressEntriesForUser: vi.fn(),
}));

vi.mock("@/auth", () => ({
    auth: mocks.auth,
}));

vi.mock("@/db/progress", () => ({
    getProgressEntriesForUser:
        mocks.getProgressEntriesForUser,
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
    });

    it("loads entries only for the authenticated user", async () => {
        const entries = [{id: "progress-1"}];
        mocks.getProgressEntriesForUser.mockResolvedValue(entries);

        await expect(
            getAuthenticatedProgressEntries(),
        ).resolves.toEqual(entries);

        expect(
            mocks.getProgressEntriesForUser,
        ).toHaveBeenCalledWith("user-1");
    });
});
