import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import LogModal from "@/components/measurements/logModal";

const measurementLabels = [
    "Weight",
    "Waist",
    "Chest",
    "Hips",
    "Thigh",
    "Arm",
] as const;

function getLondonDate() {
    const dateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const part = (type: Intl.DateTimeFormatPartTypes) =>
        dateParts.find((datePart) => datePart.type === type)?.value ?? "";

    return `${part("year")}-${part("month")}-${part("day")}`;
}

export default async function MeasurementsPage() {
    const profile = await getAuthenticatedUserProfile();

    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <div className="mx-auto w-full max-w-3xl">
                <header className="flex items-start justify-between gap-5">
                    <div>
                        <h1 className="font-display text-title font-bold">
                            Measurements
                        </h1>
                        <p className="mt-1 text-body text-secondary">
                            Track your body composition over time
                        </p>
                    </div>

                    <LogModal
                        defaultDate={getLondonDate()}
                        weightUnit={profile.weightUnit}
                        measurementUnit={profile.measurementUnit}
                    />
                </header>

                <section className="mt-7 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
                    <h2 className="text-small font-semibold uppercase tracking-wide text-secondary">
                        Latest
                    </h2>

                    <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-7">
                        {measurementLabels.map((label) => {
                            const unit = label === "Weight"
                                ? profile.weightUnit
                                : profile.measurementUnit;

                            return (
                                <article key={label} className="min-w-0">
                                    <h3 className="text-small text-secondary">
                                        {label}
                                    </h3>
                                    <p className="mt-1 flex items-baseline gap-1 font-mono text-heading font-semibold tabular-nums">
                                        <span>—</span>
                                        <span className="font-sans text-small font-normal text-secondary">
                                            {unit}
                                        </span>
                                    </p>
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-7 rounded-control bg-surface-subtle px-4 py-5 text-center">
                        <p className="text-small font-semibold">
                            Your progress chart will appear here
                        </p>
                        <p className="mt-1 text-small text-secondary">
                            Log at least 3 entries for a measurement to see its trend.
                        </p>
                    </div>
                </section>

                <nav
                    aria-label="Measurement history category"
                    className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                    {measurementLabels.map((label, index) => (
                        <button
                            key={label}
                            type="button"
                            aria-pressed={index === 0}
                            className={`shrink-0 rounded-pill px-4 py-2 text-small font-semibold transition ${
                                index === 0
                                    ? "bg-surface-inverse text-inverse"
                                    : "bg-surface-subtle text-secondary hover:bg-surface-muted hover:text-primary"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <section className="mt-6 overflow-hidden rounded-card border border-border bg-surface shadow-card">
                    <header className="bg-surface-subtle px-5 py-4">
                        <h2 className="font-semibold">
                            Weight history
                        </h2>
                    </header>

                    <div className="border-t border-divider px-5 py-8 text-center">
                        <p className="text-small font-semibold">
                            No measurements yet
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-small text-secondary">
                            Log your first entry to start building your measurement history.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
