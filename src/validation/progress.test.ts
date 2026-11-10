import {describe, expect, it} from "vitest";

import {
    formatProgressDate,
    getProgressEntrySaveValues,
    getProgressEntryValues,
} from "@/validation/progress";

function createPhoto(
    name = "front.jpg",
    type = "image/jpeg",
) {
    return new File(["photo-data"], name, {type});
}

describe("progress validation", () => {
    it("normalizes an entry and converts the preferred weight unit", () => {
        const frontPhoto = createPhoto();

        expect(
            getProgressEntryValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "220.46",
                    photos: {
                        front: frontPhoto,
                        side: null,
                        back: null,
                    },
                },
                "lb",
            ),
        ).toEqual({
            recordedOn: "2026-11-09",
            weight: 100,
            photos: [{view: "front", file: frontPhoto}],
        });
    });

    it("allows weight to be omitted", () => {
        expect(
            getProgressEntryValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "   ",
                    photos: {
                        front: createPhoto(),
                        side: null,
                        back: null,
                    },
                },
                "kg",
            ).weight,
        ).toBeNull();
    });

    it("rejects an invalid calendar date", () => {
        expect(() =>
            getProgressEntryValues(
                {
                    recordedOn: "2026-02-30",
                    weight: "",
                    photos: {
                        front: createPhoto(),
                        side: null,
                        back: null,
                    },
                },
                "kg",
            ),
        ).toThrow("Invalid progress date");
    });

    it("requires at least one photo", () => {
        expect(() =>
            getProgressEntryValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "",
                    photos: {
                        front: null,
                        side: null,
                        back: null,
                    },
                },
                "kg",
            ),
        ).toThrow("Add at least one progress photo");
    });

    it("rejects unsupported photo types", () => {
        expect(() =>
            getProgressEntryValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "",
                    photos: {
                        front: createPhoto("front.gif", "image/gif"),
                        side: null,
                        back: null,
                    },
                },
                "kg",
            ),
        ).toThrow("Front photo must be a JPEG, PNG, or WebP image");
    });

    it("accepts only storage keys belonging to the authenticated user", () => {
        expect(() =>
            getProgressEntrySaveValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "",
                    photos: [
                        {
                            view: "front",
                            storageKey: "progress-photos/user-2/front.jpg",
                        },
                    ],
                },
                "user-1",
                "kg",
            ),
        ).toThrow("Invalid progress photo");
    });

    it("rejects duplicate photo views in a saved entry", () => {
        expect(() =>
            getProgressEntrySaveValues(
                {
                    recordedOn: "2026-11-09",
                    weight: "",
                    photos: [
                        {
                            view: "front",
                            storageKey: "progress-photos/user-1/front-1.jpg",
                        },
                        {
                            view: "front",
                            storageKey: "progress-photos/user-1/front-2.jpg",
                        },
                    ],
                },
                "user-1",
                "kg",
            ),
        ).toThrow("Invalid progress photo view");
    });

    it("formats stored dates without a timezone shift", () => {
        expect(formatProgressDate("2026-11-09")).toBe(
            "9 November 2026",
        );
    });
});
