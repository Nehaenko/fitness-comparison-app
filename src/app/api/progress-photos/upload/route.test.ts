import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    handleUpload: vi.fn(),
}));

vi.mock("@/auth", () => ({auth: mocks.auth}));

vi.mock("@vercel/blob/client", () => ({
    handleUpload: mocks.handleUpload,
}));

import {POST} from "@/app/api/progress-photos/upload/route";

function createRequest() {
    return new Request("http://localhost/api/progress-photos/upload", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({type: "blob.generate-client-token"}),
    });
}

describe("progress photo upload authorization", () => {
    let requestedPath: string;

    beforeEach(() => {
        vi.clearAllMocks();
        requestedPath = "progress-photos/user-1/front.jpg";
        mocks.auth.mockResolvedValue({user: {id: "user-1"}});
        mocks.handleUpload.mockImplementation(
            async ({onBeforeGenerateToken}) =>
                onBeforeGenerateToken(requestedPath, null),
        );
    });

    it("rejects uploads without an authenticated user", async () => {
        mocks.auth.mockResolvedValue(null);

        const response = await POST(createRequest());

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Unable to authorize upload",
        });
    });

    it("rejects a storage path outside the authenticated user's namespace", async () => {
        requestedPath = "progress-photos/user-2/front.jpg";

        const response = await POST(createRequest());

        expect(response.status).toBe(400);
    });

    it("authorizes supported private photos within the user's namespace", async () => {
        const response = await POST(createRequest());
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result).toMatchObject({
            allowedContentTypes: [
                "image/jpeg",
                "image/png",
                "image/webp",
            ],
            maximumSizeInBytes: 10 * 1024 * 1024,
            addRandomSuffix: true,
        });
    });
});
