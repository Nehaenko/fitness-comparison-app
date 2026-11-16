import {formatMeasurementDate, getDisplayValue} from "@/helpers/measurement-conversion";
import Icon from "@/components/layout/actionComponents/iconComponent";
import type {MeasurementField, MeasurementRecord} from "@/types/measurements";
import {UserProfile} from "@/types/profile";
import {deleteMeasurementAction} from "@/app/(protected)/measurements/actions";
import {useState} from "react";

type MeasurementHistoryProps = {
    selectedTab: MeasurementField,
    selectedMeasurements: MeasurementRecord[],
    profile: Pick<UserProfile, "weightUnit" | "measurementUnit">,
    selectedUnit: string
}

export default function MeasurementHistory({
                                               selectedTab,
                                               selectedMeasurements,
                                               profile,
                                               selectedUnit
                                           }: MeasurementHistoryProps) {

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletedIds, setDeletedIds] = useState<Set<string>>(
        () => new Set(),
    );

    const visibleMeasurements = selectedMeasurements.filter(
        (measurement) => !deletedIds.has(measurement.id),
    );

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
            setDeletedIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.add(measurementId);
                return nextIds;
            });
        } catch (error) {
            setDeleteError(error instanceof Error
                ? error.message
                : "Unable to remove measurement",);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
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

                {visibleMeasurements.length === 0 ? (
                    <div className="border-t border-divider px-5 py-8 text-center">
                        <p className="text-small font-semibold">
                            No measurements yet
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-small text-primary">
                            Log your first entry to start building your measurement history.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-divider border-t">
                        {visibleMeasurements.map((measurement, index) => {
                            const storedValue = measurement[selectedTab];
                            const olderStoredValue =
                                visibleMeasurements[index + 1]?.[selectedTab] ?? null;

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
                                        className="truncate text-small text-primary"
                                    >
                                        {formatMeasurementDate(measurement.measuredOn)}
                                    </time>

                                    <p className="whitespace-nowrap font-mono text-body font-semibold tabular-nums text-primary">
                                        {displayValue}{" "}
                                        <span className="text-small">
                                        {selectedUnit}
                                    </span>
                                    </p>

                                    <p className="text-right font-mono text-small tabular-nums text-primary">
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
                                        className="grid size-8 place-items-center rounded-full text-primary transition hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Icon name="close" className="size-4"/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    )
}
