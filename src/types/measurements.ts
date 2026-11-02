export type MeasurementField =
    | "weight"
    | "waist"
    | "chest"
    | "hips"
    | "thigh"
    | "arm";

export type MeasurementInputValues = {
    measuredOn: string;
    weight: string;
    waist: string;
    chest: string;
    hips: string;
    thigh: string;
    arm: string;
};

export type NormalizedMeasurementValues = {
    measuredOn: string;
    weight: number | null;
    waist: number | null;
    chest: number | null;
    hips: number | null;
    thigh: number | null;
    arm: number | null;
};