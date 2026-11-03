"use client";

import LogModal from "@/components/measurements/logModal";
import Icon from "@/components/layout/actionComponents/iconComponent";
import {formatMeasurementDate, getLondonDate, getDisplayValue} from "@/helpers/measurement-conversion";
import {deleteMeasurementAction} from "@/app/(protected)/measurements/actions";
import {UserProfile} from "@/types/profile";
import type {MeasurementField, MeasurementRecord} from "@/types/measurements";

import {useState} from "react";

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

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const removeMeasurement = async (
        measurementId: string,
        measuredOn: string
    ) => {
        const confirmed = window.confirm(
            `Remove all measurements logged on ${formatMeasurementDate(measuredOn)}?`,
        )

        if (!confirmed) {
            return;
        }

        setDeletingId(measurementId);
        setDeleteError(null);

        try {
            await deleteMeasurementAction(measurementId);
        } catch (error) {
            setDeleteError(error instanceof Error
                ? error.message
                : "Unable to remove measurement",);
        } finally {
            setDeletingId(null);
        }
    };

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
                                <p className="mt-1 flex items-baseline gap-1 font-mono text-heading font-semibold tabular-nums">
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

            {deleteError ? (
                <p
                    role="alert"
                    className="border-t border-divider bg-danger-soft px-5 py-3 text-small text-danger"
                >
                    {deleteError}
                </p>
            ) : null}

            <section className="mt-6 overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <header className="bg-surface-subtle px-5 py-4">
                    <h2 className="font-semibold capitalize">
                        {selectedTab} history
                    </h2>
                </header>

                {selectedMeasurements.length === 0 ? (
                    <div className="border-t border-divider px-5 py-8 text-center">
                        <p className="text-small font-semibold">
                            No measurements yet
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
                            Log your first entry to start building your measurement history.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-divider border-t">
                        {selectedMeasurements.map((measurement, index) => {
                            const storedValue = measurement[selectedTab];
                            const olderStoredValue =
                                selectedMeasurements[index + 1]?.[selectedTab] ?? null;

                            if (storedValue === null) {
                                return null;
                            }
                            const displayValue = getDisplayValue(storedValue, selectedTab, profile);
                            const difference =
                                olderStoredValue === null
                                    ? null
                                    : Math.round(
                                    (
                                        displayValue -
                                        getDisplayValue(
                                            olderStoredValue,
                                            selectedTab,
                                            profile,
                                        )
                                    ) * 100,
                                ) / 100;

                            const differenceText =
                                difference === null
                                    ? null
                                    : difference > 0
                                        ? `+${difference}`
                                        : `${difference}`;

                            return (
                                <div
                                    key={measurement.id}
                                    className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto_3.5rem_2rem] items-center gap-3 px-5 py-3"
                                >
                                    <time
                                        dateTime={measurement.measuredOn}
                                        className="truncate text-small text-secondary"
                                    >
                                        {formatMeasurementDate(measurement.measuredOn)}
                                    </time>

                                    <p className="whitespace-nowrap font-mono text-body font-semibold tabular-nums text-primary">
                                        {displayValue}{" "}
                                        <span className="text-small">
                                        {selectedUnit}
                                    </span>
                                    </p>

                                    <p
                                        className={`text-right font-mono text-small tabular-nums ${
                                            difference === null
                                                ? "text-secondary"
                                                : difference > 0
                                                    ? "text-brand"
                                                    : difference < 0
                                                        ? "text-danger"
                                                        : "text-secondary"
                                        }`}
                                    >
                                        {differenceText ?? ""}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeMeasurement(
                                                measurement.id,
                                                measurement.measuredOn,
                                            )}
                                        disabled={deletingId === measurement.id}
                                        aria-label={
                                            deletingId === measurement.id
                                                ? "Removing measurement"
                                                : `Remove measurement from ${formatMeasurementDate(measurement.measuredOn)}`
                                        }
                                        className="grid disabled:cursor-not-allowed disabled:opacity-40 size-8 place-items-center rounded-full text-secondary transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                                    >
                                        <Icon name="close" className="size-4"/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    </>
}
