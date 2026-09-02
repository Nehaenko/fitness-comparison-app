export default function Loading() {
    return (
        <main className="grid min-h-[60vh] place-items-center px-5">
            <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-3 text-secondary"
            >
                <span
                    aria-hidden="true"
                    className="size-9 animate-spin rounded-full border-4 border-brand-soft border-t-brand motion-reduce:animate-none"
                />
                <span className="text-small font-semibold">
                    Loading
                </span>
            </div>
        </main>
    );
}
