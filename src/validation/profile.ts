import type {MeasurementUnit, WeightUnit} from "@/types/profile";

type UnitPreferenceInput = {
    weightUnit: string;
    measurementUnit: string;
};

export function getDisplayName(formData: FormData) {
    const value = formData.get("account-name");

    if (typeof value !== "string") {
        throw new Error("Invalid name");
    }

    const name = value.trim();

    if (name.length < 2 || name.length > 50) {
        throw new Error("Name must contain between 2 and 50 characters");
    }

    return name;
}

export function getUnitPreferences(values: UnitPreferenceInput): {
    weightUnit: WeightUnit;
    measurementUnit: MeasurementUnit;
} {
    if (values.weightUnit !== "kg" && values.weightUnit !== "lb") {
        throw new Error("Invalid weight unit");
    }

    if (
        values.measurementUnit !== "cm" &&
        values.measurementUnit !== "in"
    ) {
        throw new Error("Invalid measurement unit");
    }

    return {
        weightUnit: values.weightUnit,
        measurementUnit: values.measurementUnit,
    };
}
