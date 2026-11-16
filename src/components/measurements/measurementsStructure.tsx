"use client";

import LogModal from "@/components/measurements/logModal";
import MeasurementSparkline from "@/components/measurements/measurementSparkline";
import {
    formatMeasurementDate,
    getDisplayValue,
    getLondonDate,
} from "@/helpers/measurement-conversion";
import {UserProfile} from "@/types/profile";
import type {MeasurementField, MeasurementRecord} from "@/types/measurements";
import {useState} from "react";
import MeasurementHistory from "@/components/measurements/measurementHistory";

type measurementsStructureProps = {
    profile: Pick<UserProfile, "weightUnit" | "measurementUnit">,
    measurements: MeasurementRecord[],
}

const measurementTabs: {
    field: MeasurementField;
    label: string;
}[] = [
    {field: "weight", label: "Weight"},
    {field: "waist", label: "Waist"},
    {field: "chest", label: "Chest"},
    {field: "hips", label: "Hips"},
    {field: "thigh", label: "Thigh"},
    {field: "arm", label: "Arm"},
];

export default function MeasurementsStructure({profile, measurements}: measurementsStructureProps) {
    const [selectedTab, setSelectedTab] = useState<MeasurementField>("weight");

    const setTabActive = (tab: MeasurementField) => {
        setSelectedTab(tab);
    }

    const selectedMeasurements = measurements.filter(
        (measurement) => measurement[selectedTab] !== null,
    );
    const selectedUnit = selectedTab === "weight" ? profile.weightUnit : profile.measurementUnit;

    const latestMeasurement = measurements[0];
    const latestMeasurementDate = latestMeasurement?.measuredOn ?? null;

    return <>
        <div className="mx-auto w-full max-w-3xl">
            <header className="flex items-start justify-between gap-5">
                <div>
                    <h1 className="font-display text-title font-bold">
                        Measurements
                    </h1>
                    <p className="mt-1 text-body text-primary">
                        Track your body composition over time
                    </p>
                </div>

                <LogModal
                    defaultDate={getLondonDate()}
                    weightUnit={profile.weightUnit}
                    measurementUnit={profile.measurementUnit}
                />
            </header>

            {measurements.length === 0 ? (
                <section className="mt-7 rounded-card border border-border bg-surface px-6 py-10 text-center shadow-card">
                    <h2 className="font-display text-heading font-bold">
                        No measurements yet
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-body text-primary">
                        Log your first entry to start tracking changes over time.
                    </p>
                </section>
            ) : (
                <>
            <section className="mt-7 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
                <h2 className="text-small font-semibold uppercase tracking-wide text-primary">
                    Latest
                    {latestMeasurementDate
                        ? ` — ${formatMeasurementDate(latestMeasurementDate)}`
                        : ""}
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-7">
                    {measurementTabs.map((tab) => {
                        const latestStoredValue =
                            latestMeasurement?.[tab.field] ?? null;

                        const latestDisplayValue =
                            latestStoredValue === null
                                ? null
                                : getDisplayValue(
                                    latestStoredValue,
                                    tab.field,
                                    profile,
                                );

                        const unit =
                            tab.field === "weight"
                                ? profile.weightUnit
                                : profile.measurementUnit;

                        const reversedMeasurements = [...measurements].reverse();
                        const chartValues = reversedMeasurements
                            .filter((measurement) => measurement[tab.field] !== null)
                            .map((measurement) => {
                                const value = measurement[tab.field];

                                if (value === null) {
                                    throw new Error("Measurement value should not be null");
                                }

                                return getDisplayValue(value, tab.field, profile);
                            });

                        const latestDifference = latestStoredValue === null || chartValues.length < 2
                            ? null
                            : Math.round(
                                (
                                    chartValues[chartValues.length - 1] -
                                    chartValues[chartValues.length - 2]
                                ) * 100,
                            ) / 100;

                        const latestDifferenceText = latestDifference === null
                            ? null
                            : latestDifference > 0
                                ? `+${latestDifference}`
                                : `${latestDifference}`;

                        return (
                            <article key={tab.field} className="min-w-0">
                                <h3 className="text-small text-primary">
                                    {tab.label}
                                </h3>
                                <p className="mt-1 flex items-baseline gap-1 text-base font-semibold">
                                    <span>{latestDisplayValue ?? "—"}</span>
                                    <span className="font-sans text-small font-normal text-primary">
                                            {unit}
                                    </span>
                                </p>

                                <p className="min-h-5 font-mono text-small tabular-nums text-secondary">
                                    {latestDifferenceText ?? ""}
                                </p>

                                <MeasurementSparkline values={chartValues} label={tab.label} />
                            </article>
                        );
                    })}
                </div>
            </section>

            <nav
                aria-label="Measurement history category"
                className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            >
                {measurementTabs.map((tab) => (
                    <button
                        key={tab.field}
                        type="button"
                        aria-pressed={selectedTab === tab.field}
                        onClick={() => {
                            setTabActive(tab.field)
                        }}
                        className={`shrink-0 rounded-pill border px-4 py-2 text-small font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            selectedTab === tab.field
                                ? "border-surface-inverse bg-surface-inverse text-inverse"
                                : "border-border-strong bg-surface text-primary hover:bg-surface-subtle"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <MeasurementHistory selectedTab={selectedTab}
                                selectedMeasurements={selectedMeasurements}
                                profile={profile} selectedUnit={selectedUnit}/>
                </>
            )}
        </div>
    </>
}
