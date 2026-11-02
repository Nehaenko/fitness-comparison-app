import {describe, expect, it} from "vitest";

import type {MeasurementInputValues} from "@/types/measurements";
import {getMeasurementValues} from "@/validation/measurements";

function createMeasurementInput(
    overrides: Partial<MeasurementInputValues> = {},
): MeasurementInputValues {
    return {
        measuredOn: "2026-11-02",
        weight: "80",
        waist: "",
        chest: "",
        hips: "",
        thigh: "",
        arm: "",
        ...overrides,
    };
}

describe("measurement validation", () => {
    it("normalizes metric values and empty fields", () => {
        const values = getMeasurementValues(
            createMeasurementInput({
                waist: "83.25",
                chest: "102",
            }),
            "kg",
            "cm",
        );

        expect(values).toEqual({
            measuredOn: "2026-11-02",
            weight: 80,
            waist: 83.25,
            chest: 102,
            hips: null,
            thigh: null,
            arm: null,
        });
    });

    it("converts imperial values to kilograms and centimetres", () => {
        const values = getMeasurementValues(
            createMeasurementInput({
                weight: "220.46",
                waist: "10",
            }),
            "lb",
            "in",
        );

        expect(values.weight).toBe(100);
        expect(values.waist).toBe(25.4);
    });

    it("rejects a calendar date that does not exist", () => {
        expect(() =>
            getMeasurementValues(
                createMeasurementInput({
                    measuredOn: "2026-02-30",
                }),
                "kg",
                "cm",
            ),
        ).toThrow("Invalid measurement date");
    });

    it("rejects zero and negative measurements", () => {
        expect(() =>
            getMeasurementValues(
                createMeasurementInput({
                    weight: "0",
                }),
                "kg",
                "cm",
            ),
        ).toThrow(
            "Weight must be a positive number",
        );

        expect(() =>
            getMeasurementValues(
                createMeasurementInput({
                    weight: "-10",
                }),
                "kg",
                "cm",
            ),
        ).toThrow(
            "Weight must be a positive number",
        );
    });

    it("requires at least one measurement", () => {
        expect(() =>
            getMeasurementValues(
                createMeasurementInput({
                    weight: "",
                }),
                "kg",
                "cm",
            ),
        ).toThrow(
            "Enter at least one measurement",
        );
    });

    it("rejects non-numeric input", () => {
        expect(() =>
            getMeasurementValues(
                createMeasurementInput({
                    waist: "not-a-number",
                }),
                "kg",
                "cm",
            ),
        ).toThrow(
            "Waist must be a positive number",
        );
    });
});