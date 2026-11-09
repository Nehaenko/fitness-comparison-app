import {ProgressEntryRecord, ProgressPhotoView} from "@/types/progress";
import type {UserProfile} from "@/types/profile";
import {formatProgressDate} from "@/validation/progress";

type ProgressComparisonProps = {
    entries: ProgressEntryRecord[];
    weightUnit: UserProfile["weightUnit"];
    photoViews: {
        view: ProgressPhotoView;
        label: string;
    }[]
}

export default function ProgressComparison({
                                               entries,
                                               weightUnit,
                                               photoViews
                                           }: ProgressComparisonProps) {
    const beforeEntry = entries.at(-1);
    const afterEntry = entries[0];

    return (
        <>
            <section className="mt-7 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                    <label className="form-label">
                        Before
                        <select className="form-control normal-case" defaultValue={beforeEntry?.id ?? ""}>
                            {entries.length === 0 ? (
                                <option value="">No entries</option>
                            ) : entries.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                    {formatProgressDate(entry.recordedOn)}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="form-label">
                        After
                        <select className="form-control normal-case" defaultValue={afterEntry?.id ?? ""}>
                            {entries.length === 0 ? (
                                <option value="">No entries</option>
                            ) : entries.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                    {formatProgressDate(entry.recordedOn)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-5 rounded-control bg-surface-subtle px-4 py-3 text-small text-secondary">
                    Weight change:
                    <span className="ml-2 font-mono font-semibold text-primary">
                        — {weightUnit}
                    </span>
                </div>
            </section>

            <nav aria-label="Progress photo view" className="mt-5 grid grid-cols-3 gap-2">
                {photoViews.map(({view, label}, index) => (
                    <button
                        key={view}
                        type="button"
                        aria-pressed={index === 0}
                        className={`rounded-control px-4 py-3 text-small font-semibold ${
                            index === 0
                                ? "bg-surface-inverse text-inverse"
                                : "bg-surface-subtle text-secondary"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <section
                aria-label="Progress photo comparison"
                className="mt-4 grid min-h-[30rem] grid-cols-2 overflow-hidden rounded-card border border-border bg-surface shadow-card"
            >
                <div
                    className="relative flex items-center justify-center border-r border-divider bg-surface-subtle text-secondary">
                    Before photo
                    <span
                        className="absolute bottom-4 left-4 rounded-pill bg-surface-inverse/80 px-3 py-1 text-label text-inverse">
                        {beforeEntry ? formatProgressDate(beforeEntry.recordedOn) : "Before"}
                    </span>
                </div>

                <div className="relative flex items-center justify-center bg-surface text-secondary">
                    After photo
                    <span
                        className="absolute bottom-4 right-4 rounded-pill bg-surface-inverse/80 px-3 py-1 text-label text-inverse">
                        {afterEntry ? formatProgressDate(afterEntry.recordedOn) : "After"}
                    </span>
                </div>
            </section>
        </>
    );
}
