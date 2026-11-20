import type {MeasurementRecord} from "@/types/measurements";

export type ProgressPhotoView = | "front" | "side" | "back";

export type ProgressEntryInputValues = {
    recordedOn: string;
    weight: string;
    photos: Record<ProgressPhotoView, File | null>
}

export type ProgressPhotoRecord = {
    id: string;
    view: ProgressPhotoView;
    imageUrl: string;
}

export type ProgressEntryRecord = {
    id: string;
    recordedOn: string;
    photos: ProgressPhotoRecord[];
    measurement: MeasurementRecord | null;
}

export type ProgressEntryBaseRecord = Omit<
    ProgressEntryRecord,
    "measurement"
>;

export type ProgressPhotoUpload = {
    view: ProgressPhotoView;
    file: File;
}

export type NormalizedProgressEntryValues = {
    recordedOn: string;
    weight: number | null;
    photos: ProgressPhotoUpload[];
}

export type StoredProgressPhotoValues = {
    view: ProgressPhotoView;
    storageKey: string;
};

export type SaveProgressEntryValues = {
    recordedOn: string;
    weight: number | null;
    photos: StoredProgressPhotoValues[];
};

export type ProgressEntrySaveInputValues = {
    recordedOn: string;
    weight: string;
    photos: StoredProgressPhotoValues[];
}
