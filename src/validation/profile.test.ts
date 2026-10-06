import {describe, expect, it} from "vitest";

import {
    getDisplayName,
    getUnitPreferences,
} from "@/validation/profile";

describe("profile name validation", () => {
    it("trims and returns a valid display name", () => {
        const formData = new FormData();
        formData.set("account-name", "  Alla  ");

        expect(getDisplayName(formData)).toBe("Alla");
    });

    it("rejects a display name that is too short", () => {
        const formData = new FormData();
        formData.set("account-name", "A");

        expect(() => getDisplayName(formData)).toThrow(
            "Name must contain between 2 and 50 characters",
        );
    });
});

describe("profile unit validation", () => {
    it("accepts valid unit preferences", () => {
        expect(
            getUnitPreferences({
                weightUnit: "lb",
                measurementUnit: "in",
            }),
        ).toEqual({
            weightUnit: "lb",
            measurementUnit: "in",
        });
    });

    it("rejects an invalid weight unit", () => {
        expect(() =>
            getUnitPreferences({
                weightUnit: "stone",
                measurementUnit: "cm",
            }),
        ).toThrow("Invalid weight unit");
    });

    it("rejects an invalid measurement unit", () => {
        expect(() =>
            getUnitPreferences({
                weightUnit: "kg",
                measurementUnit: "metres",
            }),
        ).toThrow("Invalid measurement unit");
    });
});
