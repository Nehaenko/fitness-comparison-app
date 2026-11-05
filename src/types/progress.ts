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
    weight: number | null;
    photos: ProgressPhotoRecord[];
}

export type ProgressPhotoUpload = {
    view: ProgressPhotoView;
    file: File;
}

export type NormalizedProgressEntryValues = {
    recordedOn: string;
    weight: number | null;
    photos: ProgressPhotoUpload[];
}
