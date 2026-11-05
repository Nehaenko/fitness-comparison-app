import {weightToKilograms} from "@/helpers/weight-conversion";
import type {
    NormalizedProgressEntryValues,
    ProgressEntryInputValues,
    ProgressEntrySaveInputValues,
    ProgressPhotoView,
    SaveProgressEntryValues,
} from "@/types/progress";
import type {WeightUnit} from "@/types/profile";

const MAX_PROGRESS_PHOTO_SIZE = 10 * 1024 * 1024;

const ALLOWED_PROGRESS_PHOTO_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const PROGRESS_PHOTO_VIEWS: ProgressPhotoView[] = [
    "front",
    "side",
    "back",
];

function validateProgressDate(value: unknown) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        throw new Error("Invalid progress date");
    }

    const parsedDate = new Date(`${value}T00:00:00.000Z`);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== value
    ) {
        throw new Error("Invalid progress date");
    }

    return value;
}

function parseOptionalWeight(value: unknown) {
    if (typeof value !== "string") {
        throw new Error("Invalid weight");
    }

    const trimmedValue = value.trim();

    if (trimmedValue === "") {
        return null;
    }

    const parsedValue = Number(trimmedValue);

    if (
        !Number.isFinite(parsedValue) ||
        parsedValue <= 0
    ) {
        throw new Error("Weight must be a positive number");
    }

    return parsedValue;
}

function validateProgressPhoto(
    file: File,
    view: ProgressPhotoView,
) {
    const label = `${view[0].toUpperCase()}${view.slice(1)} photo`;

    if (file.size === 0) {
        throw new Error(`${label} cannot be empty`);
    }

    if (file.size > MAX_PROGRESS_PHOTO_SIZE) {
        throw new Error(`${label} must be 10 MB or smaller`);
    }

    if (!ALLOWED_PROGRESS_PHOTO_TYPES.has(file.type)) {
        throw new Error(`${label} must be a JPEG, PNG, or WebP image`);
    }
}

export function getProgressEntryValues(
    input: ProgressEntryInputValues,
    weightUnit: WeightUnit,
): NormalizedProgressEntryValues {
    const recordedOn = validateProgressDate(input.recordedOn);
    const inputWeight = parseOptionalWeight(input.weight);

    const photos = PROGRESS_PHOTO_VIEWS.flatMap((view) => {
        const file = input.photos[view];

        if (file === null) {
            return [];
        }

        validateProgressPhoto(file, view);

        return [{view, file}];
    });

    if (photos.length === 0) {
        throw new Error("Add at least one progress photo");
    }

    return {
        recordedOn,
        weight:
            inputWeight === null
                ? null
                : weightToKilograms(inputWeight, weightUnit),
        photos,
    };
}

export function getProgressEntrySaveValues(
    input: ProgressEntrySaveInputValues,
    userId: string,
    weightUnit: WeightUnit,
): SaveProgressEntryValues {
    const recordedOn = validateProgressDate(
        input.recordedOn,
    );

    const inputWeight = parseOptionalWeight(
        input.weight,
    );

    if (
        input.photos.length === 0 ||
        input.photos.length > 3
    ) {
        throw new Error(
            "Add between one and three progress photos",
        );
    }

    const usedViews = new Set<ProgressPhotoView>();
    const expectedPrefix =
        `progress-photos/${userId}/`;

    const photos = input.photos.map((photo) => {
        if (
            !PROGRESS_PHOTO_VIEWS.includes(photo.view) ||
            usedViews.has(photo.view)
        ) {
            throw new Error("Invalid progress photo view");
        }

        if (
            typeof photo.storageKey !== "string" ||
            !photo.storageKey.startsWith(expectedPrefix)
        ) {
            throw new Error("Invalid progress photo");
        }

        usedViews.add(photo.view);

        return photo;
    });

    return {
        recordedOn,
        weight:
            inputWeight === null
                ? null
                : weightToKilograms(
                    inputWeight,
                    weightUnit,
                ),
        photos,
    };
}