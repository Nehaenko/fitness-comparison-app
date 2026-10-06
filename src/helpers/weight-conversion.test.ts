import {describe, expect, it} from "vitest";

import {
    kilogramsToWeight,
    weightToKilograms,
} from "@/helpers/weight-conversion";

describe("weightToKilograms", () => {
    it("leaves kilograms unchanged", () => {
        expect(weightToKilograms(80, "kg")).toBe(80);
    });

    it("converts pounds to kilograms", () => {
        expect(weightToKilograms(220.46, "lb")).toBe(100);
    });

    it("rounds the result to two decimal places", () => {
        expect(weightToKilograms(12.346, "kg")).toBe(12.35);
    });
});

describe("kilogramsToWeight", () => {
    it("leaves kilograms unchanged", () => {
        expect(kilogramsToWeight(80, "kg")).toBe(80);
    });

    it("converts kilograms to pounds", () => {
        expect(kilogramsToWeight(100, "lb")).toBe(220.46);
    });

    it("supports zero weight", () => {
        expect(kilogramsToWeight(0, "lb")).toBe(0);
    });
});