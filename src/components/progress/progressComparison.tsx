"use client"

import {useState} from "react";

import ComparisonPhoto from "@/components/progress/comparisonPhoto";
import Icon from "@/components/layout/actionComponents/iconComponent";
import {
    formatMeasurementDate,
    getDisplayValue,
} from "@/helpers/measurement-conversion";
import type {MeasurementRecord} from "@/types/measurements";
import type {MeasurementUnit, WeightUnit} from "@/types/profile";
import {ProgressEntryRecord, ProgressPhotoView} from "@/types/progress";
import {formatProgressDate} from "@/validation/progress";

type ProgressComparisonProps = {
    entries: ProgressEntryRecord[];
    photoViews: {
        view: ProgressPhotoView;
        label: string;
    }[];
    weightUnit: WeightUnit;
    measurementUnit: MeasurementUnit;
}

const measurementFields = [
    {field: "weight", label: "Weight"},
    {field: "waist", label: "Waist"},
    {field: "chest", label: "Chest"},
    {field: "hips", label: "Hips"},
    {field: "thigh", label: "Thigh"},
    {field: "arm", label: "Arm"},
] as const;

function MeasurementSummary({
    measurement,
    side,
    weightUnit,
    measurementUnit,
}: {
    measurement: MeasurementRecord | null | undefined;
    side: "Before" | "After";
    weightUnit: WeightUnit;
    measurementUnit: MeasurementUnit;
}) {
    return (
        <section
            aria-label={`${side} measurement context`}
            className="min-w-0 rounded-control bg-surface-subtle p-3"
        >
            <h3 className="text-small font-semibold text-primary">
                Measurements
            </h3>
            {measurement ? (
                <>
                    <p className="mt-0.5 text-xs text-secondary">
                        From {formatMeasurementDate(measurement.measuredOn)}
                    </p>
                    <dl className="mt-3 space-y-1.5">
                        {measurementFields.map(({field, label}) => {
                            const value = measurement[field];
                            const unit = field === "weight"
                                ? weightUnit
                                : measurementUnit;

                            return (
                                <div
                                    key={field}
                                    className="flex min-w-0 items-baseline justify-between gap-2 text-xs"
                                >
                                    <dt className="truncate text-secondary">
                                        {label}
                                    </dt>
                                    <dd className="shrink-0 font-medium text-primary">
                                        {value === null
                                            ? "—"
                                            : `${getDisplayValue(value, field, {
                                                weightUnit,
                                                measurementUnit,
                                            })} ${unit}`}
                                    </dd>
                                </div>
                            );
                        })}
                    </dl>
                </>
            ) : (
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                    No earlier measurements
                </p>
            )}
        </section>
    );
}

export default function ProgressComparison({
                                               entries,
                                               photoViews,
                                               weightUnit,
                                               measurementUnit,
                                           }: ProgressComparisonProps) {
    const [beforeEntryId, setBeforeEntryId] = useState<string>(entries.at(-1)?.id ?? "");
    const [afterEntryId, setAfterEntryId] = useState<string>(entries[0]?.id ?? "")

    const beforeEntry = entries.find(
        (entry) => entry.id === beforeEntryId
    );

    const afterEntry = entries.find(
        (entry) => entry.id === afterEntryId
    );

    const [selectedView, setSelectedView] = useState<ProgressPhotoView>("front");

    const beforePhoto = beforeEntry?.photos.find(
        (photo) => photo.view === selectedView,
    );

    const afterPhoto = afterEntry?.photos.find(
        (photo) => photo.view === selectedView,
    );

    return (
        <>
            <section className="mt-7 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <label className="form-label min-w-0 !font-normal !text-primary">
                        Before
                        <span className="relative block min-w-0">
                            <select className="form-control min-w-0 appearance-none normal-case !px-3 !pr-10" value={beforeEntryId}
                                    onChange={(event) => setBeforeEntryId(event.target.value)}>
                                {entries.length === 0 ? (
                                    <option value="">No entries</option>
                                ) : entries.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {formatProgressDate(entry.recordedOn)}
                                    </option>
                                ))}
                            </select>
                            <Icon
                                name="chevron-down"
                                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
                                strokeWidth={1.5}
                            />
                        </span>
                    </label>

                    <label className="form-label min-w-0 !font-normal !text-primary">
                        After
                        <span className="relative block min-w-0">
                            <select className="form-control min-w-0 appearance-none normal-case !px-3 !pr-10" value={afterEntryId}
                                    onChange={(event) => setAfterEntryId(event.target.value)}>
                                {entries.length === 0 ? (
                                    <option value="">No entries</option>
                                ) : entries.map((entry) => (
                                    <option key={entry.id} value={entry.id}>
                                        {formatProgressDate(entry.recordedOn)}
                                    </option>
                                ))}
                            </select>
                            <Icon
                                name="chevron-down"
                                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2"
                                strokeWidth={1.5}
                            />
                        </span>
                    </label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-divider pt-4 sm:gap-4">
                    <MeasurementSummary
                        side="Before"
                        measurement={beforeEntry?.measurement}
                        weightUnit={weightUnit}
                        measurementUnit={measurementUnit}
                    />
                    <MeasurementSummary
                        side="After"
                        measurement={afterEntry?.measurement}
                        weightUnit={weightUnit}
                        measurementUnit={measurementUnit}
                    />
                </div>

            </section>

            <nav aria-label="Progress photo view" className="mt-5 grid grid-cols-3 gap-2">
                {photoViews.map(({view, label}) => (
                    <button
                        key={view}
                        type="button"
                        aria-pressed={selectedView === view}
                        onClick={() => setSelectedView(view)}
                        className={`rounded-control border px-4 py-3 text-small font-semibold transition ${
                            selectedView === view
                                ? "border-surface-inverse bg-surface-inverse text-inverse"
                                : "border-border-strong bg-surface text-primary hover:bg-surface-subtle"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <section
                aria-label="Progress photo comparison"
                className="mt-4 grid min-h-120 grid-cols-2 overflow-hidden rounded-card border border-border bg-surface shadow-card"
            >
                <ComparisonPhoto
                    key={`before-${beforeEntryId}-${selectedView}`}
                    photo={beforePhoto}
                    recordedOn={beforeEntry?.recordedOn}
                    selectedView={selectedView}
                    side="before"
                />

                <ComparisonPhoto
                    key={`after-${afterEntryId}-${selectedView}`}
                    photo={afterPhoto}
                    recordedOn={afterEntry?.recordedOn}
                    selectedView={selectedView}
                    side="after"
                />
            </section>
        </>
    );
}
