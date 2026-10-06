"use client";

import { useState, useTransition } from "react";

import { updateUnitPreferences } from "@/app/(protected)/profile/actions";
import type { MeasurementUnit, WeightUnit } from "@/types/profile";

type PreferencesProps = {
    initialWeightUnit: WeightUnit;
    initialMeasurementUnit: MeasurementUnit;
};

export default function Preferences({
    initialWeightUnit,
    initialMeasurementUnit,
}: PreferencesProps) {
    const [weightUnit, setWeightUnit] = useState(initialWeightUnit);
    const [measurementUnit, setMeasurementUnit] = useState(initialMeasurementUnit);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const weightUnitHandler = (unit: WeightUnit) => {
        if (unit === weightUnit || isPending) return;

        const previousUnit = weightUnit;
        setWeightUnit(unit);
        setError(null);

        startTransition(async () => {
            try {
                await updateUnitPreferences({
                    weightUnit: unit,
                    measurementUnit,
                });
            } catch {
                setWeightUnit(previousUnit);
                setError("Unable to save your preferences. Please try again.");
            }
        });
    };

    const measurementsHandler = (unit: MeasurementUnit) => {
        if (unit === measurementUnit || isPending) return;

        const previousUnit = measurementUnit;
        setMeasurementUnit(unit);
        setError(null);

        startTransition(async () => {
            try {
                await updateUnitPreferences({
                    weightUnit,
                    measurementUnit: unit,
                });
            } catch {
                setMeasurementUnit(previousUnit);
                setError("Unable to save your preferences. Please try again.");
            }
        });
    };

    const optionClassName = (selected: boolean) =>
        `flex h-14 items-center justify-center rounded-control border font-semibold transition ${
            selected
                ? "border-surface-inverse bg-surface-inverse text-inverse"
                : "border-border bg-surface text-secondary hover:border-border-strong hover:text-primary"
        }`;

    return (
        <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
            <h2 className="border-b border-divider px-7 py-6 text-base font-semibold">
                Preferences
            </h2>

            <div className="space-y-5 px-7 py-6 md:space-y-6">
                <fieldset>
                    <legend
                        className="text-small font-semibold uppercase tracking-[0.04em] text-secondary">
                        Weight unit
                    </legend>
                    <div className="mt-2.5 grid grid-cols-2 gap-3 md:gap-4">
                        <button
                            type="button"
                            className={optionClassName(weightUnit === "kg")}
                            aria-pressed={weightUnit === "kg"}
                            disabled={isPending}
                            onClick={() => weightUnitHandler("kg")}
                        >
                            kg
                        </button>
                        <button
                            type="button"
                            className={optionClassName(weightUnit === "lb")}
                            aria-pressed={weightUnit === "lb"}
                            disabled={isPending}
                            onClick={() => weightUnitHandler("lb")}
                        >
                            lb
                        </button>
                    </div>
                </fieldset>

                <fieldset>
                    <legend
                        className="text-small font-semibold uppercase tracking-[0.04em] text-secondary">
                        Measurement unit
                    </legend>
                    <div className="mt-2.5 grid grid-cols-2 gap-3 md:gap-4">
                        <button
                            type="button"
                            className={optionClassName(measurementUnit === "cm")}
                            aria-pressed={measurementUnit === "cm"}
                            disabled={isPending}
                            onClick={() => measurementsHandler("cm")}
                        >
                            cm
                        </button>
                        <button
                            type="button"
                            className={optionClassName(measurementUnit === "in")}
                            aria-pressed={measurementUnit === "in"}
                            disabled={isPending}
                            onClick={() => measurementsHandler("in")}
                        >
                            in
                        </button>
                    </div>
                </fieldset>

                {error ? (
                    <p
                        className="text-small text-danger"
                        role="status"
                        aria-live="polite"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        </section>
    )
}
