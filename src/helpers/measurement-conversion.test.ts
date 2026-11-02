import {describe, expect, it} from "vitest";

import {
    centimetresToMeasurement,
    measurementToCentimetres,
} from "@/helpers/measurement-conversion";

describe("measurementToCentimetres", () => {
    it("leaves centimetres unchanged", () => {
        expect(
            measurementToCentimetres(80, "cm"),
        ).toBe(80);
    });

    it("converts inches to centimetres", () => {
        expect(
            measurementToCentimetres(10, "in"),
        ).toBe(25.4);
    });

    it("rounds the result to two decimal places", () => {
        expect(
            measurementToCentimetres(12.345, "cm"),
        ).toBe(12.35);
    });
});

describe("centimetresToMeasurement", () => {
    it("leaves centimetres unchanged", () => {
        expect(
            centimetresToMeasurement(80, "cm"),
        ).toBe(80);
    });

    it("converts centimetres to inches", () => {
        expect(
            centimetresToMeasurement(25.4, "in"),
        ).toBe(10);
    });

    it("rounds converted inches to two decimal places", () => {
        expect(
            centimetresToMeasurement(10, "in"),
        ).toBe(3.94);
    });
});