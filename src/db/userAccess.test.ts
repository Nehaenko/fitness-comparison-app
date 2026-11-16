import {beforeEach, describe, expect, it, vi} from "vitest";

const {selectMock} = vi.hoisted(() => ({
    selectMock: vi.fn(),
}));

vi.mock("@/db", () => ({
    db: {
        select: selectMock,
    },
}));

import {canSignInWithEmail} from "@/db/userAccess";

function mockExistingUser(result: {id: string} | undefined) {
    selectMock.mockReturnValueOnce({
        from: () => ({
            where: () => ({
                limit: vi.fn().mockResolvedValue(
                    result ? [result] : [],
                ),
            }),
        }),
    });
}

function mockAccountCount(accountCount: number) {
    selectMock.mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{accountCount}]),
    });
}

describe("canSignInWithEmail", () => {
    beforeEach(() => {
        selectMock.mockReset();
        delete process.env.AUTH_ACCOUNT_LIMIT;
    });

    it("always permits an existing account", async () => {
        mockExistingUser({id: "existing-user"});

        await expect(
            canSignInWithEmail("member@example.com"),
        ).resolves.toBe(true);
        expect(selectMock).toHaveBeenCalledTimes(1);
    });

    it("permits a new account while fewer than five accounts exist", async () => {
        mockExistingUser(undefined);
        mockAccountCount(4);

        await expect(
            canSignInWithEmail("new@example.com"),
        ).resolves.toBe(true);
    });

    it("rejects a new account once the account limit is reached", async () => {
        mockExistingUser(undefined);
        mockAccountCount(5);

        await expect(
            canSignInWithEmail("new@example.com"),
        ).resolves.toBe(false);
    });
});
