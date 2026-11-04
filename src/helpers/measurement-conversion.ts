import type {MeasurementUnit, UserProfile} from "@/types/profile";
import {MeasurementField} from "@/types/measurements";
import {kilogramsToWeight} from "@/helpers/weight-conversion";

const CENTIMETRES_PER_INCH = 2.54;

function roundMeasurement(value: number) {
    return Math.round(value * 100) / 100;
}

export function measurementToCentimetres(
    value: number,
    unit: MeasurementUnit,
) {
    return roundMeasurement(
        unit === "in"
            ? value * CENTIMETRES_PER_INCH
            : value,
    );
}

export function centimetresToMeasurement(
    value: number,
    unit: MeasurementUnit,
) {
    return roundMeasurement(
        unit === "in"
            ? value / CENTIMETRES_PER_INCH
            : value,
    );
}

export function getLondonDate() {
    const dateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const part = (type: Intl.DateTimeFormatPartTypes) =>
        dateParts.find((datePart) => datePart.type === type)?.value ?? "";

    return `${part("year")}-${part("month")}-${part("day")}`;
}

const measurementDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
})

export function formatMeasurementDate(measuredOn: string) {
    return measurementDateFormatter.format(
        new Date(`${measuredOn}T00:00:00.000Z`),
    );
}

export function getDisplayValue(
    value: number,
    field: MeasurementField,
    profile: Pick<UserProfile, "weightUnit" | "measurementUnit">,
) {
    return field === "weight"
        ? kilogramsToWeight(value, profile.weightUnit)
        : centimetresToMeasurement(
            value,
            profile.measurementUnit,
        );
}