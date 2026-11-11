"use client";

import Image from "next/image";
import {useEffect, useRef, useState} from "react";
import {uploadPresigned} from "@vercel/blob/client";
import {useRouter} from "next/navigation";

import {saveProgressEntryAction} from "@/app/(protected)/progress/actions";
import Icon from "@/components/layout/actionComponents/iconComponent";
import {getLondonDate} from "@/helpers/measurement-conversion";
import type {UserProfile} from "@/types/profile";
import type {ProgressEntryInputValues, ProgressPhotoView} from "@/types/progress";
import {getProgressEntryValues} from "@/validation/progress";

type NewProgressRecordProps = {
    hasGallery: boolean;
    weightUnit: UserProfile["weightUnit"];
    userId: UserProfile["userId"];
    onBack: () => void;
    onSaved: () => void;
    photoViews: {
        view: ProgressPhotoView;
        label: string;
    }[],
    existingDates: string[],
}

export default function NewProgressRecord({
                                              hasGallery,
                                              weightUnit,
                                              onBack,
                                              onSaved,
                                              photoViews,
                                              userId,
                                              existingDates
                                          }: NewProgressRecordProps) {
    const router = useRouter();
    const [files, setFiles] = useState<Record<ProgressPhotoView, File | null>>({
        front: null,
        side: null,
        back: null
    });
    const [previewUrls, setPreviewUrls] = useState<
        Record<ProgressPhotoView, string | null>
    >({
        front: null,
        side: null,
        back: null,
    });
    const previewUrlsRef = useRef(previewUrls);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        return () => {
            Object.values(previewUrlsRef.current).forEach((previewUrl) => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        };
    }, []);

    const setSelectedPhoto = (view: ProgressPhotoView, file: File | null) => {
        const previousPreviewUrl = previewUrlsRef.current[view];

        if (previousPreviewUrl) {
            URL.revokeObjectURL(previousPreviewUrl);
        }

        const nextPreviewUrl = file
            ? URL.createObjectURL(file)
            : null;

        previewUrlsRef.current = {
            ...previewUrlsRef.current,
            [view]: nextPreviewUrl,
        };

        setFiles((currentFiles) => ({
            ...currentFiles,
            [view]: file,
        }));

        setPreviewUrls((currentPreviewUrls) => ({
            ...currentPreviewUrls,
            [view]: nextPreviewUrl,
        }));
    };

    const clearSelectedPhotos = () => {
        Object.values(previewUrlsRef.current).forEach((previewUrl) => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        });

        const emptyPreviews: Record<ProgressPhotoView, string | null> = {
            front: null,
            side: null,
            back: null,
        };

        previewUrlsRef.current = emptyPreviews;
        setPreviewUrls(emptyPreviews);
        setFiles({
            front: null,
            side: null,
            back: null,
        });
    }

    const submitProgressForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setIsSaving(true);
        setError(null);

        const weightValue = formData.get("weight");
        const recordedOnValue = formData.get("recordedOn");

        const weight =
            typeof weightValue === "string"
                ? weightValue
                : "";

        const recordedOn =
            typeof recordedOnValue === "string"
                ? recordedOnValue
                : "";

        const progressValue: ProgressEntryInputValues = {
            recordedOn,
            weight,
            photos: files
        }

        try {
            if (existingDates.includes(recordedOn)) {
                throw new Error(
                    "A progress entry already exists for this date. Choose another date or remove the existing entry first.",
                );
            }

            const normalizedValues =
                getProgressEntryValues(
                    progressValue,
                    weightUnit,
                );

            const uploadedPhotos = await Promise.all(
                normalizedValues.photos.map(
                    async (photo) => {
                        const pathname =
                            `progress-photos/${userId}/${crypto.randomUUID()}-${photo.view}`;

                        const blob = await uploadPresigned(
                            pathname,
                            photo.file,
                            {
                                access: "private",
                                handleUploadUrl:
                                    "/api/progress-photos/upload",
                            },
                        );

                        return {
                            view: photo.view,
                            storageKey: blob.pathname,
                        };
                    },
                ),
            );

            await saveProgressEntryAction({
                recordedOn,
                weight,
                photos: uploadedPhotos
            });

            form.reset();
            clearSelectedPhotos();
            router.refresh();
            onSaved();
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Unable to save progress entry",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <>
            {hasGallery ? (
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSaving}
                    className="mt-5 inline-flex items-center gap-2 text-small text-secondary transition hover:text-primary"
                >
                    <Icon name="arrow-left" className="size-4"/>
                    Back to gallery
                </button>
            ) : null}

            <form
                onSubmit={submitProgressForm}
                className="mt-6 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7"
            >
                <h2 className="text-body font-semibold">
                    New progress entry
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="form-label">
                        Date
                        <input
                            type="date"
                            name="recordedOn"
                            defaultValue={getLondonDate()}
                            className="form-control normal-case"
                        />
                    </label>

                    <label className="form-label">
                        Weight ({weightUnit})
                        <input
                            type="number"
                            name="weight"
                            min="0"
                            step="0.1"
                            inputMode="decimal"
                            placeholder="Optional"
                            className="form-control normal-case"
                        />
                    </label>
                </div>

                <fieldset className="mt-7">
                    <legend className="form-label">
                        Progress photos
                    </legend>
                    <p className="mt-2 text-small text-secondary">
                        Add up to three photos from your device.
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {photoViews.map(({view, label}) => (
                            <label key={view} className="min-w-0">
                                <span className="text-small text-secondary">
                                    {label}
                                </span>
                                <span
                                    className="relative mt-2 flex aspect-3/4 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-control border border-dashed border-border-strong bg-surface-subtle px-2 text-center text-small text-secondary transition hover:bg-surface-muted hover:text-primary">
                                    {previewUrls[view] ? (
                                        <Image
                                            src={previewUrls[view]}
                                            alt={`${label} preview`}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 640px) 30vw, 12rem"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <>
                                            <span className="text-xl" aria-hidden="true">+</span>
                                            <span className="mt-1">Choose photo</span>
                                        </>
                                    )}
                                </span>
                                <input
                                    type="file"
                                    name={view}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="sr-only"
                                    onChange={(event) => {setSelectedPhoto(view, event.currentTarget.files?.[0] ?? null)}}
                                />
                            </label>
                        ))}
                    </div>
                </fieldset>

                {error ? (
                    <p
                        role="alert"
                        className="mt-4 rounded-control bg-danger-soft px-4 py-3 text-small text-danger"
                    >
                        {error}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-6 h-12 w-full rounded-control bg-surface-inverse px-5 text-small font-semibold text-inverse transition hover:bg-surface-inverse-control"
                >
                    {isSaving ? "Saving..." : "Save entry"}
                </button>
            </form>
        </>
    )
}
