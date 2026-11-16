import {measurementToCentimetres} from "@/helpers/measurement-conversion";
import {weightToKilograms} from "@/helpers/weight-conversion";
import type {MeasurementInputValues, NormalizedMeasurementValues} from "@/types/measurements";
import type {MeasurementUnit, WeightUnit} from "@/types/profile";

function parseOptionalMeasurement(
    value: unknown,
    label: string,
): number | null {
    if (typeof value !== "string") {
        throw new Error(`Invalid ${label}`);
    }

    const trimmedValue = value.trim();

    if (trimmedValue === "") {
        return null;
    }

    const parsedValue = Number(trimmedValue.replace(",", "."));

    if (
        !Number.isFinite(parsedValue) ||
        parsedValue <= 0
    ) {
        throw new Error(
            `${label} must be a positive number`,
        );
    }

    return parsedValue;
}

function validateMeasurementDate(value: unknown) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        throw new Error("Invalid measurement date");
    }

    const parsedDate = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== value
    ) {
        throw new Error("Invalid measurement date");
    }

    return value;
}

export function getMeasurementValues(
    input: MeasurementInputValues,
    weightUnit: WeightUnit,
    measurementUnit: MeasurementUnit,
): NormalizedMeasurementValues {
    const measuredOn = validateMeasurementDate(
        input.measuredOn,
    );

    const weight = parseOptionalMeasurement(
        input.weight,
        "Weight",
    );
    const waist = parseOptionalMeasurement(
        input.waist,
        "Waist",
    );
    const chest = parseOptionalMeasurement(
        input.chest,
        "Chest",
    );
    const hips = parseOptionalMeasurement(
        input.hips,
        "Hips",
    );
    const thigh = parseOptionalMeasurement(
        input.thigh,
        "Thigh",
    );
    const arm = parseOptionalMeasurement(
        input.arm,
        "Arm",
    );

    if (
        weight === null &&
        waist === null &&
        chest === null &&
        hips === null &&
        thigh === null &&
        arm === null
    ) {
        throw new Error(
            "Enter at least one measurement",
        );
    }

    return {
        measuredOn,
        weight:
            weight === null
                ? null
                : weightToKilograms(
                    weight,
                    weightUnit,
                ),
        waist:
            waist === null
                ? null
                : measurementToCentimetres(
                    waist,
                    measurementUnit,
                ),
        chest:
            chest === null
                ? null
                : measurementToCentimetres(
                    chest,
                    measurementUnit,
                ),
        hips:
            hips === null
                ? null
                : measurementToCentimetres(
                    hips,
                    measurementUnit,
                ),
        thigh:
            thigh === null
                ? null
                : measurementToCentimetres(
                    thigh,
                    measurementUnit,
                ),
        arm:
            arm === null
                ? null
                : measurementToCentimetres(
                    arm,
                    measurementUnit,
                ),
    };
}
