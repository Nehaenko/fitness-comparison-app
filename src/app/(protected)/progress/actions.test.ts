import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    createProgressEntryForUser: vi.fn(),
    deleteProgressEntryForUser: vi.fn(),
    del: vi.fn(),
    getProfileByUserId: vi.fn(),
    head: vi.fn(),
    revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({auth: mocks.auth}));

vi.mock("@/db/progress", () => ({
    createProgressEntryForUser:
        mocks.createProgressEntryForUser,
    deleteProgressEntryForUser:
        mocks.deleteProgressEntryForUser,
}));

vi.mock("@/db/profile", () => ({
    getProfileByUserId: mocks.getProfileByUserId,
}));

vi.mock("@vercel/blob", () => ({
    del: mocks.del,
    head: mocks.head,
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

import {
    deleteProgressAction,
    saveProgressEntryAction,
} from "@/app/(protected)/progress/actions";

const progressId =
    "11111111-1111-4111-8111-111111111111";
const storageKey =
    "progress-photos/user-1/front.jpg";

const saveInput = {
    recordedOn: "2026-11-09",
    weight: "220.46",
    photos: [{view: "front" as const, storageKey}],
};

describe("progress actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.auth.mockResolvedValue({user: {id: "user-1"}});
        mocks.getProfileByUserId.mockResolvedValue({weightUnit: "lb"});
        mocks.head.mockResolvedValue({
            pathname: storageKey,
            size: 1024,
            contentType: "image/jpeg",
        });
        mocks.createProgressEntryForUser.mockResolvedValue({
            id: progressId,
            recordedOn: "2026-11-09",
        });
        mocks.deleteProgressEntryForUser.mockResolvedValue({
            id: progressId,
            storageKeys: [storageKey],
        });
        mocks.del.mockResolvedValue(undefined);
    });

    it("rejects unauthenticated saves before accessing storage", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            saveProgressEntryAction(saveInput),
        ).rejects.toThrow("Unauthorized");

        expect(mocks.head).not.toHaveBeenCalled();
        expect(
            mocks.createProgressEntryForUser,
        ).not.toHaveBeenCalled();
    });

    it("verifies the uploaded blob and saves normalized values for the user", async () => {
        await expect(
            saveProgressEntryAction(saveInput),
        ).resolves.toEqual({
            id: progressId,
            recordedOn: "2026-11-09",
        });

        expect(mocks.head).toHaveBeenCalledWith(storageKey);
        expect(
            mocks.createProgressEntryForUser,
        ).toHaveBeenCalledWith("user-1", {
            recordedOn: "2026-11-09",
            weight: 100,
            photos: [{view: "front", storageKey}],
        });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/progress");
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/measurements");
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("rejects blob metadata that does not match the submitted upload", async () => {
        mocks.head.mockResolvedValue({
            pathname: storageKey,
            size: 1024,
            contentType: "application/pdf",
        });

        await expect(
            saveProgressEntryAction(saveInput),
        ).rejects.toThrow("Invalid uploaded progress photo");

        expect(
            mocks.createProgressEntryForUser,
        ).not.toHaveBeenCalled();
    });

    it("reports a database save failure", async () => {
        mocks.createProgressEntryForUser.mockResolvedValue(null);

        await expect(
            saveProgressEntryAction(saveInput),
        ).rejects.toThrow("Unable to save progress entry");
    });

    it("rejects an invalid deletion id", async () => {
        await expect(
            deleteProgressAction("not-a-uuid"),
        ).rejects.toThrow("Invalid progress entry");

        expect(
            mocks.deleteProgressEntryForUser,
        ).not.toHaveBeenCalled();
    });

    it("rejects unauthenticated deletions", async () => {
        mocks.auth.mockResolvedValue(null);

        await expect(
            deleteProgressAction(progressId),
        ).rejects.toThrow("Unauthorized");

        expect(
            mocks.deleteProgressEntryForUser,
        ).not.toHaveBeenCalled();
    });

    it("deletes only for the authenticated user and removes its blobs", async () => {
        await expect(
            deleteProgressAction(progressId),
        ).resolves.toEqual({id: progressId});

        expect(
            mocks.deleteProgressEntryForUser,
        ).toHaveBeenCalledWith(progressId, "user-1");
        expect(mocks.del).toHaveBeenCalledWith([storageKey]);
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/progress");
    });

    it("does not reveal whether a missing entry belongs to another user", async () => {
        mocks.deleteProgressEntryForUser.mockResolvedValue(null);

        await expect(
            deleteProgressAction(progressId),
        ).rejects.toThrow(
            "Progress entry not found or cannot be removed",
        );

        expect(mocks.del).not.toHaveBeenCalled();
    });

    it("keeps a completed database deletion successful when blob cleanup fails", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        mocks.del.mockRejectedValue(new Error("Blob unavailable"));

        await expect(
            deleteProgressAction(progressId),
        ).resolves.toEqual({id: progressId});

        expect(consoleError).toHaveBeenCalled();
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/progress");

        consoleError.mockRestore();
    });
});
