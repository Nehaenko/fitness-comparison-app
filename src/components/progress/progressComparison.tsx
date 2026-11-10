"use client"

import {useState} from "react";

import ComparisonPhoto from "@/components/progress/comparisonPhoto";
import {ProgressEntryRecord, ProgressPhotoView} from "@/types/progress";
import {formatProgressDate} from "@/validation/progress";

type ProgressComparisonProps = {
    entries: ProgressEntryRecord[];
    photoViews: {
        view: ProgressPhotoView;
        label: string;
    }[]
}

export default function ProgressComparison({
                                               entries,
                                               photoViews
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
            <section className="mt-7 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                    <label className="form-label">
                        Before
                        <select className="form-control normal-case" value={beforeEntryId}
                                onChange={(event) => setBeforeEntryId(event.target.value)}>
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
                        <select className="form-control normal-case" value={afterEntryId}
                                onChange={(event) => setAfterEntryId(event.target.value)}>
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

            </section>

            <nav aria-label="Progress photo view" className="mt-5 grid grid-cols-3 gap-2">
                {photoViews.map(({view, label}) => (
                    <button
                        key={view}
                        type="button"
                        aria-pressed={selectedView === view}
                        onClick={() => setSelectedView(view)}
                        className={`rounded-control px-4 py-3 text-small font-semibold ${
                            selectedView === view
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
