type IconName =
    | "close"
    | "dashboard"
    | "routines"
    | "history"
    | "progress"
    | "measurements"
    | "profile"
    | "logout"
    | "delete"
    | "chevron-down"
    | "chevron-right"
    | "reorder"
    | "arrow-left"
    | "check"
    | "timer"
    | "play"
    | "brand"
    | "google"
    | "edit"
    | "star";

export default function Icon({ name, className }: { name: IconName; className?: string }) {
    const common = {
        fill: "none",
        stroke: "currentColor",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        strokeWidth: 1.7,
    };

    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className} {...common}>
            {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
            {name === "dashboard" && (
                <>
                    <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
                    <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
                    <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
                    <rect x="14.5" y="14.5" width="6" height="6" rx="1" />
                </>
            )}
            {name === "routines" && (
                <>
                    <rect x="5" y="4.5" width="14" height="16" rx="2" />
                    <path d="M9 4.5v-1h6v1M9 9h6M9 13h6M9 17h4" />
                </>
            )}
            {name === "history" && (
                <>
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3.25 2" />
                </>
            )}
            {name === "progress" && <path d="m3.5 15 4-4 3 3 4.5-5 5.5 5.5M3.5 20l4-4 3 3 4.5-5 5.5 5.5" />}
            {name === "measurements" && (
                <>
                    <path d="M3 7h7M14 7h7M3 17h7M14 17h7M3 12h3M10 12h11" />
                    <circle cx="12" cy="7" r="2" />
                    <circle cx="8" cy="17" r="2" />
                </>
            )}
            {name === "profile" && (
                <>
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" />
                </>
            )}
            {name === "logout" && (
                <>
                    <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M13 8l4 4-4 4M8 12h9" />
                </>
            )}
            {name === "delete" && (
                <>
                    <path d="M4.5 7h15M9 7V4.5h6V7M7 7l.75 13h8.5L17 7M10 10.5v6M14 10.5v6" />
                </>
            )}
            {name === "chevron-down" && <path d="m8 10 4 4 4-4" />}
            {name === "chevron-right" && <path d="m10 8 4 4-4 4" />}
            {name === "arrow-left" && <path d="M19 12H5M10 7l-5 5 5 5" />}
            {name === "check" && <path d="m5 12 4 4L19 6" />}
            {name === "timer" && (
                <>
                    <circle cx="12" cy="13" r="7.5" />
                    <path d="M12 9.5V13l2.5 1.5M9.5 3h5M12 3v2.5" />
                </>
            )}
            {name === "play" && <path d="m8 5 11 7-11 7V5Z" />}
            {name === "edit" && (
                <>
                    <path d="M13.5 5.5 18.5 10.5M4.5 19.5l3.75-.75L19 8a1.75 1.75 0 0 0 0-2.5l-.5-.5a1.75 1.75 0 0 0-2.5 0L5.25 15.75 4.5 19.5Z" />
                    <path d="M12 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12" />
                </>
            )}
            {name === "star" && <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z" />}
            {name === "brand" && (
                <path
                    d="M7 8.25v7.5M4.5 9.75v4.5M17 8.25v7.5m2.5-6v4.5M7 12h10M10 5.5v2.75m4-2.75v2.75"
                    strokeWidth="1.8"
                />
            )}
            {name === "google" && (
                <>
                    <path stroke="none" fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
                    <path stroke="none" fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
                    <path stroke="none" fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.27.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z" />
                    <path stroke="none" fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
                </>
            )}
            {name === "reorder" && (
                <>
                    <circle cx="8" cy="7" r="1.25" fill="currentColor" stroke="none" />
                    <circle cx="16" cy="7" r="1.25" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="12" r="1.25" fill="currentColor" stroke="none" />
                    <circle cx="16" cy="12" r="1.25" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="17" r="1.25" fill="currentColor" stroke="none" />
                    <circle cx="16" cy="17" r="1.25" fill="currentColor" stroke="none" />
                </>
            )}
        </svg>
    );
}
