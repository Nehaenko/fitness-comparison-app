"use client";

import LogModal from "@/components/measurements/logModal";
import {getLondonDate, getDisplayValue} from "@/helpers/measurement-conversion";
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

    return <>
        <div className="mx-auto w-full max-w-3xl">
            <header className="flex items-start justify-between gap-5">
                <div>
                    <h1 className="font-display text-title font-bold">
                        Measurements
                    </h1>
                    <p className="mt-1 text-body text-secondary">
                        Track your body composition over time
                    </p>
                </div>

                <LogModal
                    defaultDate={getLondonDate()}
                    weightUnit={profile.weightUnit}
                    measurementUnit={profile.measurementUnit}
                />
            </header>

            <section className="mt-7 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
                <h2 className="text-small font-semibold uppercase tracking-wide text-secondary">
                    Latest
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-7">
                    {measurementTabs.map((tab) => {
                        const latestMeasurement = measurements.find(
                            (measurement) =>
                                measurement[tab.field] !== null,
                        );

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

                        return (
                            <article key={tab.field} className="min-w-0">
                                <h3 className="text-small text-secondary">
                                    {tab.label}
                                </h3>
                                <p className="mt-1 flex items-baseline gap-1 text-base font-semibold">
                                    <span>{latestDisplayValue ?? "—"}</span>
                                    <span className="font-sans text-small font-normal text-secondary">
                                            {unit}
                                    </span>
                                </p>
                            </article>
                        );
                    })}
                </div>

                <div className="mt-7 rounded-control bg-surface-subtle px-4 py-5 text-center">
                    <p className="text-small font-semibold">
                        Your progress chart will appear here
                    </p>
                    <p className="mt-1 text-small text-secondary">
                        Log at least 3 entries for a measurement to see its trend.
                    </p>
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
                        className={`shrink-0 rounded-pill px-4 py-2 text-small font-semibold transition ${
                            selectedTab === tab.field
                                ? "bg-surface-inverse text-inverse"
                                : "bg-surface-subtle text-secondary hover:bg-surface-muted hover:text-primary"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <MeasurementHistory selectedTab={selectedTab}
                                selectedMeasurements={selectedMeasurements}
                                profile={profile} selectedUnit={selectedUnit}/>
        </div>
    </>
}
