import {ProgressEntryRecord, ProgressPhotoView} from "@/types/progress";
import type {UserProfile} from "@/types/profile";
import {formatProgressDate} from "@/validation/progress";
import Icon from "@/components/layout/actionComponents/iconComponent";
import PhotoPlaceholder from "@/components/progress/photoPlaceholder";

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
            {entries.map((entry) => (
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
                                    : `${entry.weight} ${weightUnit}`}
                            </p>
                        </div>

                        <button
                            type="button"
                            aria-label={`Remove progress entry from ${formatProgressDate(entry.recordedOn)}`}
                            className="grid size-8 place-items-center rounded-full text-secondary transition hover:bg-surface-subtle hover:text-primary"
                        >
                            <Icon name="close" className="size-4"/>
                        </button>
                    </header>

                    <div className="grid grid-cols-3 overflow-hidden border-t border-divider">
                        {photoViews.map(({view, label}) => (
                            <div key={view} className="border-r border-divider">
                                <PhotoPlaceholder label={label}/>
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    );
}