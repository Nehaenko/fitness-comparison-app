import type {WeightUnit} from "@/types/profile";

const POUNDS_PER_KILOGRAM = 2.2046226218;

function roundWeight(value: number) {
    return Math.round(value * 100) / 100;
}

export function weightToKilograms(value: number, unit: WeightUnit) {
    return roundWeight(
        unit === "lb" ? value / POUNDS_PER_KILOGRAM : value,
    );
}

export function kilogramsToWeight(value: number, unit: WeightUnit) {
    return roundWeight(
        unit === "lb" ? value * POUNDS_PER_KILOGRAM : value,
    );
}
