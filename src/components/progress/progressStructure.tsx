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
    profile: Pick<UserProfile, "userId" | "weightUnit">;
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

    const canCompare = entries.length >= 2;

    return (
        <div className="mx-auto w-full max-w-3xl">
            <header className="flex items-start justify-between gap-5">
                <div>
                    <h1 className="font-display text-title font-bold">
                        Progress
                    </h1>
                    <p className="mt-1 text-body text-secondary">
                        Photos and visual comparison
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setMode("compare")}
                        disabled={!canCompare}
                        aria-label="Compare progress photos"
                        className="grid size-12 place-items-center rounded-control bg-surface-subtle text-secondary transition hover:bg-surface-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        <Icon name="measurements" className="size-5"/>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("add")}
                        aria-label="Add progress entry"
                        className="grid size-12 place-items-center rounded-control bg-surface-inverse text-2xl font-light leading-none text-inverse transition hover:bg-surface-inverse-control"
                    >
                        <span aria-hidden="true">+</span>
                    </button>
                </div>
            </header>

            {mode === "add" ? (
                <NewProgressRecord
                    userId={profile.userId}
                    photoViews={photoViews}
                    hasGallery={entries.length > 0}
                    onSaved={() => setMode("gallery")}
                    weightUnit={profile.weightUnit}
                    onBack={() => setMode("gallery")}
                    existingDates={entries.map(
                        (entry) => entry.recordedOn,
                    )}
                />
            ) : null}

            {mode === "gallery" ? (
                <ProgressGallery
                    photoViews={photoViews}
                    entries={entries}
                    weightUnit={profile.weightUnit}
                />
            ) : null}

            {mode === "compare" ? (
                <ProgressComparison
                    photoViews={photoViews}
                    entries={entries}
                    weightUnit={profile.weightUnit}
                />
            ) : null}
        </div>
    );
}