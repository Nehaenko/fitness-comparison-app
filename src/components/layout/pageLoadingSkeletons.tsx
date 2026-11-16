function SkeletonBlock({
    className,
}: {
    className: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={`block animate-pulse rounded-control bg-surface-muted motion-reduce:animate-none ${className}`}
        />
    );
}

function LoadingStatus({label}: {label: string}) {
    return (
        <span className="sr-only" role="status" aria-live="polite">
            {label}
        </span>
    );
}

export function ProtectedPageSkeleton() {
    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <LoadingStatus label="Loading page"/>

            <div className="mx-auto w-full max-w-3xl">
                <SkeletonBlock className="h-10 w-44"/>
                <SkeletonBlock className="mt-3 h-5 w-64 max-w-full"/>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    <SkeletonBlock className="h-32 w-full rounded-card"/>
                    <SkeletonBlock className="h-32 w-full rounded-card"/>
                </div>

                <SkeletonBlock className="mt-6 h-64 w-full rounded-card"/>
            </div>
        </main>
    );
}

export function HistoryPageSkeleton() {
    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <LoadingStatus label="Loading workout history"/>

            <div className="mx-auto w-full max-w-3xl">
                <SkeletonBlock className="h-10 w-36"/>
                <SkeletonBlock className="mt-3 h-5 w-32"/>

                <div className="mt-8 space-y-7">
                    {[4, 3].map((rowCount, groupIndex) => (
                        <section key={rowCount}>
                            <SkeletonBlock
                                className={`mb-3 h-4 ${
                                    groupIndex === 0 ? "w-32" : "w-28"
                                }`}
                            />

                            <div className="divide-y divide-divider overflow-hidden rounded-card border border-border bg-surface shadow-card">
                                {Array.from({length: rowCount}).map((_, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="grid min-h-[4.75rem] grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 p-3"
                                    >
                                        <div className="space-y-2">
                                            <SkeletonBlock className="mx-auto h-4 w-6"/>
                                            <SkeletonBlock className="mx-auto h-3 w-8"/>
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <SkeletonBlock
                                                className={`h-4 ${
                                                    rowIndex % 2 === 0
                                                        ? "w-40 max-w-full"
                                                        : "w-32 max-w-full"
                                                }`}
                                            />
                                            <SkeletonBlock className="h-3 w-36 max-w-full"/>
                                        </div>

                                        <SkeletonBlock className="size-4"/>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}

export function HistoryDetailSkeleton() {
    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <LoadingStatus label="Loading workout details"/>

            <div className="mx-auto w-full max-w-3xl">
                <div className="flex items-start gap-4">
                    <SkeletonBlock className="size-10 shrink-0 rounded-full"/>
                    <div className="min-w-0 flex-1">
                        <SkeletonBlock className="h-9 w-52 max-w-full"/>
                        <SkeletonBlock className="mt-3 h-4 w-36"/>
                    </div>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                    {Array.from({length: 3}).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-card border border-border bg-surface px-3 py-6 shadow-card"
                        >
                            <SkeletonBlock className="mx-auto h-8 w-10"/>
                            <SkeletonBlock className="mx-auto mt-3 h-3 w-14"/>
                        </div>
                    ))}
                </div>

                <div className="mt-7 space-y-4">
                    {[3, 3, 2].map((setCount, exerciseIndex) => (
                        <section
                            key={exerciseIndex}
                            className="overflow-hidden rounded-card border border-border bg-surface shadow-card"
                        >
                            <div className="bg-surface-subtle px-5 py-4">
                                <SkeletonBlock
                                    className={`h-5 ${
                                        exerciseIndex === 1 ? "w-36" : "w-44"
                                    }`}
                                />
                            </div>
                            <div className="divide-y divide-divider border-t border-divider">
                                {Array.from({length: setCount}).map((_, setIndex) => (
                                    <div
                                        key={setIndex}
                                        className="grid min-h-14 grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-center gap-3 px-5 py-3"
                                    >
                                        <SkeletonBlock className="h-4 w-6"/>
                                        <SkeletonBlock className="h-4 w-32 max-w-full"/>
                                        <SkeletonBlock className="size-4"/>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}

export function RoutineEditorSkeleton() {
    return (
        <main className="flex-1 px-4 py-7 md:px-12 md:py-14">
            <LoadingStatus label="Loading routine editor"/>

            <div className="max-w-5xl">
                <div className="flex gap-4">
                    <SkeletonBlock className="mt-2 size-5 shrink-0"/>
                    <div className="flex-1">
                        <SkeletonBlock className="h-10 w-48 max-w-full"/>
                        <SkeletonBlock className="mt-3 h-5 w-56 max-w-full"/>
                    </div>
                </div>

                <div className="mt-7 space-y-5 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
                    <div>
                        <SkeletonBlock className="h-4 w-28"/>
                        <SkeletonBlock className="mt-2 h-12 w-full"/>
                    </div>

                    <div>
                        <SkeletonBlock className="h-4 w-24"/>
                        <SkeletonBlock className="mt-2 h-12 w-full"/>
                    </div>

                    {[0, 1].map((workoutIndex) => (
                        <section
                            key={workoutIndex}
                            className="rounded-card border border-border p-4"
                        >
                            <div className="flex items-center gap-3">
                                <SkeletonBlock className="size-5 shrink-0"/>
                                <SkeletonBlock className="size-10 shrink-0 rounded-full"/>
                                <div className="min-w-0 flex-1 space-y-2">
                                    <SkeletonBlock
                                        className={`h-5 ${
                                            workoutIndex === 0 ? "w-40" : "w-32"
                                        } max-w-full`}
                                    />
                                    <SkeletonBlock className="h-3 w-24"/>
                                </div>
                                <SkeletonBlock className="size-5 shrink-0"/>
                            </div>
                        </section>
                    ))}

                    <SkeletonBlock className="h-14 w-full"/>
                    <SkeletonBlock className="h-12 w-full bg-surface-inverse"/>
                </div>
            </div>
        </main>
    );
}

export function RoutinesPageSkeleton() {
    return (
        <main className="flex-1 px-4 py-7 md:px-12 md:py-14">
            <LoadingStatus label="Loading routines"/>

            <div className="max-w-5xl">
                <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0 flex-1">
                        <SkeletonBlock className="h-10 w-40"/>
                        <SkeletonBlock className="mt-3 h-5 w-72 max-w-full"/>
                    </div>
                    <SkeletonBlock className="size-11 shrink-0"/>
                </div>

                <div className="mt-7 space-y-4">
                    {[0, 1, 2].map((routineIndex) => (
                        <article
                            key={routineIndex}
                            className="rounded-card border border-border bg-surface p-5 shadow-card"
                        >
                            <div className="flex items-center gap-2">
                                {routineIndex === 0 ? (
                                    <SkeletonBlock className="h-6 w-16 rounded-pill"/>
                                ) : null}
                                <SkeletonBlock
                                    className={`h-5 ${
                                        routineIndex === 1 ? "w-36" : "w-44"
                                    } max-w-full`}
                                />
                            </div>

                            <SkeletonBlock className="mt-3 h-4 w-64 max-w-full"/>

                            <div className="mt-4 flex gap-2">
                                <SkeletonBlock className="h-7 w-28 rounded-pill"/>
                                <SkeletonBlock className="h-7 w-32 rounded-pill"/>
                            </div>

                            <SkeletonBlock className="mt-3 h-4 w-20"/>

                            <div className="mt-5 flex items-center gap-3 border-t border-divider pt-4">
                                <SkeletonBlock className="h-10 w-24"/>
                                {routineIndex === 0 ? null : (
                                    <SkeletonBlock className="h-10 w-28"/>
                                )}
                                <SkeletonBlock className="ml-auto size-10"/>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
