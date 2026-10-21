import Link from "next/link";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {WorkoutHistorySummary} from "@/types/history";

type HistoryBlockProps = {
    records: WorkoutHistorySummary[];
};

const completedDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
});

function formatDaysAgo(completedAt: Date, now: Date) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysAgo = Math.max(
        0,
        Math.floor(
            (now.getTime() - completedAt.getTime()) /
            millisecondsPerDay,
        ),
    );

    if (daysAgo === 0) {
        return "Today";
    }

    return `${daysAgo}d ago`;
}

export default function HistoryBlock({records}: HistoryBlockProps) {
    const now = new Date();

    return (
        <div className="divide-y divide-divider">
            {records.map((record) => {
                const durationMinutes = Math.floor(
                    record.durationSeconds / 60,
                );

                return (
                    <Link
                        key={record.id}
                        href={`/history/${record.id}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto_1.25rem] items-center gap-3 py-3 px-5 transition-colors hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none"
                    >
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold">
                                {record.workoutName}
                            </span>
                            <span className="mt-0.5 block text-sm text-secondary">
                                <time dateTime={record.completedAt.toISOString()}>
                                    {completedDateFormatter.format(
                                        record.completedAt,
                                    )}
                                </time>{" "}
                                · {durationMinutes} min · {record.exerciseCount}{" "}
                                {record.exerciseCount === 1
                                    ? "exercise"
                                    : "exercises"}
                            </span>
                        </span>

                        <span className="whitespace-nowrap text-sm text-secondary">
                            {formatDaysAgo(record.completedAt, now)}
                        </span>

                        <Icon
                            name="chevron-right"
                            className="size-5 text-secondary"
                        />
                    </Link>
                );
            })}
        </div>
    );
}
