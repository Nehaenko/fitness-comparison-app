export default function PhotoPlaceholder({label}: {label: string}) {
    return (
        <div className="relative flex min-h-44 items-center justify-center bg-surface-subtle text-small text-secondary sm:min-h-56">
            <span className="rounded-pill bg-surface-inverse/75 px-3 py-1 text-label text-inverse">
                {label}
            </span>
        </div>
    );
}