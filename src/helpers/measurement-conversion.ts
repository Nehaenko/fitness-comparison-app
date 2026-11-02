import type {MeasurementUnit} from "@/types/profile";

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