"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";

import {deleteProgressAction} from "@/app/(protected)/progress/actions";
import Icon from "@/components/layout/actionComponents/iconComponent";
import PhotoPlaceholder from "@/components/progress/photoPlaceholder";
import ProgressPhotoImage from "@/components/progress/progressPhotoImage";
import {kilogramsToWeight} from "@/helpers/weight-conversion";
import type {UserProfile} from "@/types/profile";
import type {ProgressEntryRecord, ProgressPhotoView} from "@/types/progress";
import {formatProgressDate} from "@/validation/progress";

type ProgressGalleryProps = {
    entries: ProgressEntryRecord[];
    weightUnit: UserProfile["weightUnit"];
    photoViews: {
        view: ProgressPhotoView;
        label: string;
    }[]
}

export default function ProgressGallery({
                                            entries,
                                            weightUnit,
                                            photoViews
                                        }: ProgressGalleryProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const removeProgressEntry = async (
        progressId: string
    ) => {
        setDeletingId(progressId);
        setDeleteError(null);

        try {
            await deleteProgressAction(progressId);
            setConfirmingDeleteId(null);
            router.refresh();
        } catch (error) {
            setDeleteError(error instanceof Error
                ? error.message
                : "Unable to remove progress entry",);
        } finally {
            setDeletingId(null);
        }
    };

    if (entries.length === 0) {
        return (
            <section className="mt-7 rounded-card border border-border bg-surface px-6 py-10 text-center shadow-card">
                <h2 className="font-display text-heading font-bold">
                    No progress photos yet
                </h2>
                <p className="mx-auto mt-2 max-w-md text-body text-secondary">
                    Add your first entry to start building a visual record of your progress.
                </p>
            </section>
        );
    }

    return (
        <section aria-label="Progress photo gallery" className="mt-7 space-y-5">
            {deleteError ? (
                <p
                    role="alert"
                    className="border-t border-divider bg-danger-soft px-5 py-3 text-small text-danger"
                >
                    {deleteError}
                </p>
            ) : null}

            {entries.map((entry) => {
                    const photosByView = new Map(
                        entry.photos.map((photo) => [
                            photo.view,
                            photo,
                        ]),
                    );

                    return (
                        <article
                            key={entry.id}
                            className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
                        >
                            <header className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
                                <div>
                                    <h2 className="text-body font-semibold">
                                        {formatProgressDate(entry.recordedOn)}
                                    </h2>
                                    <p className="mt-0.5 font-mono text-small text-secondary">
                                        {entry.weight === null
                                            ? "No weight logged"
                                            : `${kilogramsToWeight(
                                                entry.weight,
                                                weightUnit,
                                            )} ${weightUnit}`}
                                    </p>
                                </div>

                                {confirmingDeleteId !== entry.id ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeleteError(null);
                                            setConfirmingDeleteId(entry.id);
                                        }}
                                        disabled={deletingId !== null}
                                        aria-label={`Remove progress entry from ${formatProgressDate(entry.recordedOn)}`}
                                        className="grid size-8 place-items-center rounded-full text-secondary transition hover:bg-surface-subtle hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Icon name="close" className="size-4"/>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3 pt-0.5 text-small font-semibold">
                                        <button
                                            type="button"
                                            disabled={deletingId === entry.id}
                                            aria-label={
                                                deletingId === entry.id
                                                    ? "Removing progress entry"
                                                    : `Delete progress entry from ${formatProgressDate(entry.recordedOn)}`
                                            }
                                            onClick={() => removeProgressEntry(entry.id)}
                                            className="text-danger transition hover:text-danger-hover disabled:cursor-wait disabled:opacity-60"
                                        >
                                            {deletingId === entry.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={deletingId === entry.id}
                                            onClick={() => setConfirmingDeleteId(null)}
                                            className="text-secondary transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </header>

                            <div className="grid grid-cols-3 overflow-hidden border-t border-divider">
                                {photoViews.map(({view, label}) => {
                                    const photo = photosByView.get(view);

                                    return (
                                        <div
                                            key={view}
                                            className="relative min-h-44 overflow-hidden border-r border-divider last:border-r-0 sm:min-h-56"
                                        >
                                            {photo ? (
                                                <>
                                                    <ProgressPhotoImage
                                                        src={photo.imageUrl}
                                                        alt={`${label} progress photo from ${formatProgressDate(entry.recordedOn)}`}
                                                        sizes="(max-width: 640px) 30vw, 12rem"
                                                        className="object-cover"
                                                    />

                                                    <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-pill bg-surface-inverse/75 px-3 py-1 text-label text-inverse">{label}</span>
                                                </>
                                            ) : (
                                                <PhotoPlaceholder label={label}/>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </article>
                    )
                }
            )}
        </section>
    );
}
