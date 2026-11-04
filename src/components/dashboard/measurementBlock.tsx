import type {MeasurementField, MeasurementRecord} from "@/types/measurements";
import type {UserProfile} from "@/types/profile";
import {formatMeasurementDate, getDisplayValue} from "@/helpers/measurement-conversion";

type MeasurementBlockProps = {
    records: MeasurementRecord[];
    profile: Pick<UserProfile, "weightUnit" | "measurementUnit">;
};

const dashboardFields: {
    field: Extract<MeasurementField, "weight" | "waist" | "hips" | "chest">;
    label: string;
}[] = [
    {field: "weight", label: "Weight"},
    {field: "waist", label: "Waist"},
    {field: "hips", label: "Hips"},
    {field: "chest", label: "Chest"},
];

export default function MeasurementBlock({
                                             records,
                                             profile,
                                         }: MeasurementBlockProps) {
    const latestMeasurements = records.slice(0, 3);

    if (latestMeasurements.length === 0) {
        return null;
    }

    return (
        <div>
            {latestMeasurements.map((measurement) => (
                <div key={measurement.id}>
                    <div className="grid grid-cols-4 gap-3 px-5 py-5">
                        {dashboardFields.map(({field, label}) => {
                            const storedValue = measurement[field];
                            const displayValue = storedValue === null
                                ? null
                                : getDisplayValue(
                                    storedValue,
                                    field,
                                    profile,
                                );

                            const unit = field === "weight"
                                ? profile.weightUnit
                                : profile.measurementUnit;

                            return (
                                <article key={field} className="min-w-0">
                                    <h3 className="text-small text-secondary">
                                        {label}
                                    </h3>
                                    <p className="mt-1 flex items-baseline gap-1 text-small font-semibold text-primary">
                                        <span>{displayValue ?? "—"}</span>
                                        <span className="font-sans text-small font-normal text-secondary">
                                            {unit}
                                        </span>
                                    </p>
                                </article>
                            );
                        })}
                    </div>

                    <p className="border-t border-divider bg-surface-subtle px-5 py-3 text-small text-secondary">
                        Logged {formatMeasurementDate(measurement.measuredOn)}
                    </p>
                </div>
            ))}
        </div>
    );
}