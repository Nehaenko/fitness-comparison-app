import {beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    auth: vi.fn(),
    get: vi.fn(),
    getProgressPhotoForUser: vi.fn(),
    sharp: vi.fn(),
    toBuffer: vi.fn(),
}));

vi.mock("@/auth", () => ({auth: mocks.auth}));

vi.mock("@/db/progress", () => ({
    getProgressPhotoForUser:
        mocks.getProgressPhotoForUser,
}));

vi.mock("@vercel/blob", () => ({get: mocks.get}));

vi.mock("sharp", () => ({
    default: mocks.sharp,
}));

import {GET} from "@/app/api/progress-photos/[photoId]/route";

const photoId =
    "22222222-2222-4222-8222-222222222222";

function createContext(id = photoId) {
    return {
        params: Promise.resolve({photoId: id}),
    };
}

describe("private progress photo route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const transformer = {
            rotate: vi.fn(),
            resize: vi.fn(),
            webp: vi.fn(),
            toBuffer: mocks.toBuffer,
        };
        transformer.rotate.mockReturnValue(transformer);
        transformer.resize.mockReturnValue(transformer);
        transformer.webp.mockReturnValue(transformer);
        mocks.sharp.mockReturnValue(transformer);
        mocks.toBuffer.mockResolvedValue(
            Buffer.from("optimized-photo"),
        );
        mocks.auth.mockResolvedValue({user: {id: "user-1"}});
        mocks.getProgressPhotoForUser.mockResolvedValue({
            id: photoId,
            storageKey: "progress-photos/user-1/front.jpg",
        });
        mocks.get.mockResolvedValue({
            statusCode: 200,
            stream: new ReadableStream({
                start(controller) {
                    controller.enqueue(
                        new TextEncoder().encode("photo"),
                    );
                    controller.close();
                },
            }),
            blob: {
                contentType: "image/jpeg",
                size: 5,
                etag: "photo-etag",
            },
        });
    });

    it("rejects unauthenticated photo requests", async () => {
        mocks.auth.mockResolvedValue(null);

        const response = await GET(
            new Request("http://localhost/photo"),
            createContext(),
        );

        expect(response.status).toBe(401);
        expect(
            mocks.getProgressPhotoForUser,
        ).not.toHaveBeenCalled();
        expect(mocks.get).not.toHaveBeenCalled();
    });

    it("rejects malformed photo ids before querying ownership", async () => {
        const response = await GET(
            new Request("http://localhost/photo"),
            createContext("not-a-uuid"),
        );

        expect(response.status).toBe(404);
        expect(
            mocks.getProgressPhotoForUser,
        ).not.toHaveBeenCalled();
    });

    it("does not serve a photo missing from the authenticated user's records", async () => {
        mocks.getProgressPhotoForUser.mockResolvedValue(null);

        const response = await GET(
            new Request("http://localhost/photo"),
            createContext(),
        );

        expect(response.status).toBe(404);
        expect(
            mocks.getProgressPhotoForUser,
        ).toHaveBeenCalledWith(photoId, "user-1");
        expect(mocks.get).not.toHaveBeenCalled();
    });

    it("streams an owned private photo with browser-only cache headers", async () => {
        const response = await GET(
            new Request("http://localhost/photo"),
            createContext(),
        );

        expect(response.status).toBe(200);
        expect(mocks.get).toHaveBeenCalledWith(
            "progress-photos/user-1/front.jpg",
            {access: "private", ifNoneMatch: undefined},
        );
        expect(response.headers.get("content-type")).toBe("image/jpeg");
        expect(response.headers.get("cache-control")).toBe(
            "private, max-age=86400, must-revalidate",
        );
        expect(response.headers.get("etag")).toBe("photo-etag");
        expect(response.headers.get("vary")).toBe("Cookie");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(await response.text()).toBe("photo");
    });

    it("serves a smaller WebP variant for gallery requests", async () => {
        const response = await GET(
            new Request(
                `http://localhost/api/progress-photos/${photoId}?width=480`,
            ),
            createContext(),
        );

        expect(response.status).toBe(200);
        expect(mocks.get).toHaveBeenCalledWith(
            "progress-photos/user-1/front.jpg",
            {access: "private"},
        );
        expect(mocks.sharp).toHaveBeenCalledOnce();
        expect(response.headers.get("content-type")).toBe("image/webp");
        expect(response.headers.get("etag")).toBe(
            'W/"photo-etag-480"',
        );
        expect(await response.text()).toBe("optimized-photo");
    });

    it("rejects unsupported image widths", async () => {
        const response = await GET(
            new Request(
                `http://localhost/api/progress-photos/${photoId}?width=9999`,
            ),
            createContext(),
        );

        expect(response.status).toBe(400);
        expect(mocks.getProgressPhotoForUser).not.toHaveBeenCalled();
        expect(mocks.get).not.toHaveBeenCalled();
    });
});
