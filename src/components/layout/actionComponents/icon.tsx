type IconName =
    | "close"
    | "dashboard"
    | "routines"
    | "history"
    | "progress"
    | "measurements"
    | "profile"
    | "logout"
    | "delete";

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
        </svg>
    );
}
