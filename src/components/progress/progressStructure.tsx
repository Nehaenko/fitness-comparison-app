"use client";

import {useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {UserProfile} from "@/types/profile";
import type {
    ProgressEntryRecord,
    ProgressPhotoView,
} from "@/types/progress";
import NewProgressRecord from "@/components/progress/newProgressRecord";
import ProgressGallery from "@/components/progress/progressGallery";
import ProgressComparison from "@/components/progress/progressComparison";

type ProgressStructureProps = {
    profile: Pick<
        UserProfile,
        "userId" | "weightUnit" | "measurementUnit"
    >;
    entries: ProgressEntryRecord[];
};

type ProgressMode = "gallery" | "add" | "compare";

const photoViews: {
    view: ProgressPhotoView;
    label: string;
}[] = [
    {view: "front", label: "Front"},
    {view: "side", label: "Side"},
    {view: "back", label: "Back"},
];

export default function ProgressStructure({
    profile,
    entries,
}: ProgressStructureProps) {
    const [mode, setMode] = useState<ProgressMode>(
        entries.length === 0 ? "add" : "gallery",
    );
    const [pendingSavedDate, setPendingSavedDate] = useState<string | null>(null);

    const canCompare = entries.length >= 2;
    const savedEntryIsAvailable = pendingSavedDate !== null &&
        entries.some((entry) => entry.recordedOn === pendingSavedDate);
    const visibleMode = pendingSavedDate === null
        ? mode
        : savedEntryIsAvailable
            ? "gallery"
            : "saving";

    const changeMode = (nextMode: ProgressMode) => {
        setPendingSavedDate(null);
        setMode(nextMode);
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            <header className="flex items-start justify-between gap-5">
                <div>
                    <h1 className="font-display text-title font-bold">
                        Progress
                    </h1>
                    {visibleMode === "compare" ||
                    (visibleMode === "add" && entries.length > 0) ? (
                        <button
                            type="button"
                            onClick={() => changeMode("gallery")}
                            className="mt-2 inline-flex items-center gap-2 text-small text-primary transition hover:text-brand"
                        >
                            <Icon
                                name="arrow-left"
                                className="size-4"
                                strokeWidth={1.5}
                            />
                            Back to gallery
                        </button>
                    ) : visibleMode !== "add" ? (
                        <p className="mt-1 text-body text-secondary">
                            Photos and visual comparison
                        </p>
                    ) : null}
                </div>

                <div className="flex gap-2">
                    {canCompare ? (
                        <button
                            type="button"
                            onClick={() => changeMode("compare")}
                            aria-pressed={visibleMode === "compare"}
                            aria-label="Compare progress photos"
                            className={`grid size-12 place-items-center rounded-control border transition ${
                                visibleMode === "compare"
                                    ? "border-brand bg-brand-soft text-primary"
                                    : "border-border bg-surface text-primary hover:bg-surface-subtle"
                            }`}
                        >
                            <Icon name="measurements" className="size-5" strokeWidth={1.25}/>
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => changeMode("add")}
                        aria-label="Add progress entry"
                        className="grid size-12 place-items-center rounded-control bg-surface-inverse text-2xl font-light leading-none text-inverse transition hover:bg-surface-inverse-control"
                    >
                        <span aria-hidden="true">+</span>
                    </button>
                </div>
            </header>

            {visibleMode === "add" ? (
                <NewProgressRecord
                    userId={profile.userId}
                    photoViews={photoViews}
                    onSaved={(recordedOn) => setPendingSavedDate(recordedOn)}
                    existingDates={entries.map(
                        (entry) => entry.recordedOn,
                    )}
                />
            ) : null}

            {visibleMode === "gallery" ? (
                <ProgressGallery
                    photoViews={photoViews}
                    entries={entries}
                />
            ) : null}

            {visibleMode === "compare" ? (
                <ProgressComparison
                    photoViews={photoViews}
                    entries={entries}
                    weightUnit={profile.weightUnit}
                    measurementUnit={profile.measurementUnit}
                />
            ) : null}

            {visibleMode === "saving" ? (
                <section
                    role="status"
                    aria-label="Loading saved progress entry"
                    className="mt-7 overflow-hidden rounded-card border border-border bg-surface shadow-card"
                >
                    <div className="h-24 animate-pulse bg-surface-subtle"/>
                    <div className="grid min-h-80 grid-cols-3 gap-px bg-divider">
                        {photoViews.map(({view}) => (
                            <div
                                key={view}
                                className="grid place-items-center bg-surface-muted"
                            >
                                <span className="size-7 animate-spin rounded-full border-2 border-primary/25 border-t-primary"/>
                            </div>
                        ))}
                    </div>
                    <span className="sr-only">Preparing your gallery</span>
                </section>
            ) : null}
        </div>
    );
}
