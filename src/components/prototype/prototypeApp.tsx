"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import ThemeToggle from "@/components/layout/themeToggle";
import DecimalInput from "@/components/layout/actionComponents/decimalInput";

type PrototypeView =
    | "dashboard"
    | "routines"
    | "workout"
    | "history"
    | "measurements"
    | "progress";

type PrototypeSet = {
    id: string;
    exercise: string;
    weight: number | null;
    reps: number | null;
    completed: boolean;
};

type PrototypeHistoryItem = {
    id: string;
    name: string;
    date: string;
    duration: number;
    exerciseCount: number;
};

type PrototypeState = {
    sets: PrototypeSet[];
    latestWeight: number;
    measurementCount: number;
    history: PrototypeHistoryItem[];
};

const STORAGE_KEY = "forma:prototype:v1";

const initialState: PrototypeState = {
    sets: [
        {id: "squat-1", exercise: "Barbell Squat", weight: 60, reps: 8, completed: false},
        {id: "squat-2", exercise: "Barbell Squat", weight: 60, reps: 8, completed: false},
        {id: "squat-3", exercise: "Barbell Squat", weight: 57.5, reps: 8, completed: false},
        {id: "rdl-1", exercise: "Romanian Deadlift", weight: 55, reps: 10, completed: false},
        {id: "rdl-2", exercise: "Romanian Deadlift", weight: 55, reps: 10, completed: false},
    ],
    latestWeight: 60.1,
    measurementCount: 6,
    history: [
        {id: "history-1", name: "Upper Body A", date: "14 Nov 2026", duration: 58, exerciseCount: 4},
        {id: "history-2", name: "Lower Body A", date: "12 Nov 2026", duration: 65, exerciseCount: 4},
        {id: "history-3", name: "Upper Body B", date: "10 Nov 2026", duration: 52, exerciseCount: 3},
    ],
};

const navigation: {
    view: PrototypeView;
    label: string;
    icon: "dashboard" | "routines" | "history" | "measurements" | "progress" | "play";
}[] = [
    {view: "dashboard", label: "Dashboard", icon: "dashboard"},
    {view: "routines", label: "Routines", icon: "routines"},
    {view: "workout", label: "Workout", icon: "play"},
    {view: "history", label: "History", icon: "history"},
    {view: "measurements", label: "Measurements", icon: "measurements"},
    {view: "progress", label: "Progress", icon: "progress"},
];

function isPrototypeState(value: unknown): value is PrototypeState {
    if (!value || typeof value !== "object") return false;

    const candidate = value as Partial<PrototypeState>;

    return Array.isArray(candidate.sets) &&
        Array.isArray(candidate.history) &&
        typeof candidate.latestWeight === "number" &&
        typeof candidate.measurementCount === "number";
}

function PrototypeNotice({message}: {message: string | null}) {
    if (!message) return null;

    return (
        <div
            role="status"
            className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-sm rounded-control bg-surface-inverse px-4 py-3 text-center text-small font-semibold text-inverse shadow-floating"
        >
            {message}
        </div>
    );
}

export default function PrototypeApp() {
    const [view, setView] = useState<PrototypeView>("dashboard");
    const [state, setState] = useState<PrototypeState>(initialState);
    const [storageReady, setStorageReady] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        const restoreTimer = window.setTimeout(() => {
            const storedValue = window.localStorage.getItem(STORAGE_KEY);

            if (storedValue) {
                try {
                    const parsedValue: unknown = JSON.parse(storedValue);
                    if (isPrototypeState(parsedValue)) setState(parsedValue);
                } catch {
                    window.localStorage.removeItem(STORAGE_KEY);
                }
            }

            setStorageReady(true);
        }, 0);

        return () => window.clearTimeout(restoreTimer);
    }, []);

    useEffect(() => {
        if (!storageReady) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state, storageReady]);

    const showNotice = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(null), 2500);
    };

    const changeSet = (
        setId: string,
        changes: Partial<Pick<PrototypeSet, "weight" | "reps" | "completed">>,
    ) => {
        setState((current) => ({
            ...current,
            sets: current.sets.map((set) =>
                set.id === setId ? {...set, ...changes} : set,
            ),
        }));
    };

    const finishWorkout = () => {
        const completedSets = state.sets.filter((set) => set.completed);

        if (completedSets.length === 0) {
            showNotice("Complete at least one set first");
            return;
        }

        const exerciseCount = new Set(
            completedSets.map((set) => set.exercise),
        ).size;
        const date = new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date());

        setState((current) => ({
            ...current,
            sets: current.sets.map((set) => ({...set, completed: false})),
            history: [
                {
                    id: crypto.randomUUID(),
                    name: "Lower Body A",
                    date,
                    duration: 42,
                    exerciseCount,
                },
                ...current.history,
            ],
        }));
        setView("history");
        showNotice("Prototype workout saved");
    };

    const logSampleMeasurement = () => {
        setState((current) => ({
            ...current,
            latestWeight: Math.round((current.latestWeight - 0.1) * 10) / 10,
            measurementCount: current.measurementCount + 1,
        }));
        showNotice("Sample measurement logged");
    };

    const resetPrototype = () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setState(initialState);
        setView("dashboard");
        showNotice("Prototype reset");
    };

    return (
        <div className="flex min-h-screen flex-col bg-canvas text-primary">
            <header className="sticky top-0 z-30 border-b border-border bg-surface">
                <div className="mx-auto flex min-h-19 w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={() => setView("dashboard")}
                        className="flex items-center gap-2.5"
                        aria-label="Prototype dashboard"
                    >
                        <span className="grid size-9 place-items-center rounded-control bg-brand text-on-accent">
                            <Icon name="brand" className="size-5"/>
                        </span>
                        <span className="font-display text-heading font-bold">Forma</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <ThemeToggle compact />
                        <span className="hidden rounded-pill bg-brand-soft px-3 py-1 text-label font-semibold text-brand sm:inline-flex">
                            Prototype
                        </span>
                        <Link
                            href="/login"
                            className="inline-flex h-10 items-center rounded-control border border-border px-3 text-small font-semibold hover:bg-surface-subtle"
                        >
                            Exit
                        </Link>
                    </div>
                </div>
            </header>

            <nav
                aria-label="Prototype features"
                className="border-b border-border bg-surface"
            >
                <div className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
                    {navigation.map((item) => (
                        <button
                            key={item.view}
                            type="button"
                            onClick={() => setView(item.view)}
                            aria-pressed={view === item.view}
                            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-control px-3 text-small font-semibold transition ${
                                view === item.view
                                    ? "bg-brand-soft text-brand"
                                    : "text-primary hover:bg-surface-subtle"
                            }`}
                        >
                            <Icon name={item.icon} className="size-4" strokeWidth={1.25}/>
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-9">
                <section className="mb-5 rounded-control border border-brand/20 bg-brand-soft px-4 py-3 text-small text-primary">
                    Prototype changes stay in this browser. No account, database record, or photo upload is created.
                </section>

                {view === "dashboard" ? (
                    <DashboardView
                        state={state}
                        onNavigate={setView}
                    />
                ) : null}
                {view === "routines" ? (
                    <RoutinesView onStart={() => setView("workout")}/>
                ) : null}
                {view === "workout" ? (
                    <WorkoutView
                        sets={state.sets}
                        onChangeSet={changeSet}
                        onFinish={finishWorkout}
                    />
                ) : null}
                {view === "history" ? <HistoryView history={state.history}/> : null}
                {view === "measurements" ? (
                    <MeasurementsView
                        latestWeight={state.latestWeight}
                        count={state.measurementCount}
                        onLog={logSampleMeasurement}
                    />
                ) : null}
                {view === "progress" ? <ProgressView/> : null}

                <button
                    type="button"
                    onClick={resetPrototype}
                    className="mt-8 text-small font-semibold text-secondary underline underline-offset-4 hover:text-primary"
                >
                    Reset prototype data
                </button>
            </main>

            <PrototypeNotice message={notice}/>
        </div>
    );
}

function PageHeading({title, description}: {title: string; description: string}) {
    return (
        <header>
            <h1 className="font-display text-title font-bold">{title}</h1>
            <p className="mt-1 text-body text-secondary">{description}</p>
        </header>
    );
}

function DashboardView({
    state,
    onNavigate,
}: {
    state: PrototypeState;
    onNavigate: (view: PrototypeView) => void;
}) {
    return (
        <div>
            <PageHeading title="Dashboard" description="A snapshot of your current training"/>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <article className="rounded-card border border-border bg-surface p-4 shadow-card">
                    <p className="text-label font-semibold uppercase text-secondary">This month</p>
                    <p className="mt-2 font-display text-heading font-bold">{state.history.length}</p>
                    <p className="text-small text-secondary">workouts</p>
                </article>
                <article className="rounded-card border border-border bg-surface p-4 shadow-card">
                    <p className="text-label font-semibold uppercase text-secondary">Weight</p>
                    <p className="mt-2 font-display text-heading font-bold">{state.latestWeight}</p>
                    <p className="text-small text-secondary">kg</p>
                </article>
            </div>

            <section className="mt-5 rounded-card bg-surface-inverse p-5 text-inverse shadow-card">
                <p className="text-small text-inverse-muted">Selected workout</p>
                <div className="mt-1 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-body font-semibold">Lower Body A</h2>
                        <p className="mt-1 text-small text-inverse-soft">4 exercises</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onNavigate("workout")}
                        className="inline-flex h-11 items-center gap-2 rounded-control bg-brand px-4 text-small font-semibold text-on-accent"
                    >
                        <Icon name="play" className="size-4"/>
                        Start workout
                    </button>
                </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <header className="flex items-center justify-between border-b border-divider px-5 py-4">
                    <h2 className="font-semibold">Recent workouts</h2>
                    <button
                        type="button"
                        onClick={() => onNavigate("history")}
                        className="text-small font-semibold text-brand"
                    >
                        View all
                    </button>
                </header>
                <HistoryRows history={state.history.slice(0, 3)}/>
            </section>
        </div>
    );
}

function RoutinesView({onStart}: {onStart: () => void}) {
    return (
        <div>
            <PageHeading title="Routines" description="Plan and manage your training programmes"/>
            <article className="mt-6 rounded-card border border-brand bg-surface p-5 shadow-card">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-pill bg-brand-soft px-3 py-1 text-label font-semibold text-brand">Active</span>
                    <h2 className="font-semibold">Upper / Lower Split</h2>
                </div>
                <p className="mt-2 text-small text-secondary">Four balanced workouts for strength and muscle development.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {["Upper Body A", "Lower Body A", "Upper Body B", "Lower Body B"].map((name, index) => (
                        <span key={name} className="rounded-pill bg-surface-subtle px-3 py-1 text-label font-semibold">
                            {index + 1}. {name}
                        </span>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={onStart}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-control bg-surface-inverse px-4 text-small font-semibold text-inverse"
                >
                    <Icon name="play" className="size-4"/>
                    Open sample workout
                </button>
            </article>
        </div>
    );
}

function WorkoutView({
    sets,
    onChangeSet,
    onFinish,
}: {
    sets: PrototypeSet[];
    onChangeSet: (
        id: string,
        changes: Partial<Pick<PrototypeSet, "weight" | "reps" | "completed">>,
    ) => void;
    onFinish: () => void;
}) {
    const completedCount = sets.filter((set) => set.completed).length;
    const exercises = Array.from(new Set(sets.map((set) => set.exercise)));

    return (
        <div>
            <PageHeading
                title="Lower Body A"
                description={`${completedCount} / ${sets.length} sets completed`}
            />
            <div className="mt-6 space-y-5">
                {exercises.map((exercise) => {
                    const exerciseSets = sets.filter((set) => set.exercise === exercise);
                    return (
                        <section key={exercise} className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
                            <header className="bg-surface-subtle px-5 py-4">
                                <h2 className="font-semibold">{exercise}</h2>
                                <p className="mt-1 text-small text-secondary">Previous: 60 kg × 8 reps</p>
                            </header>
                            <div className="divide-y divide-divider">
                                {exerciseSets.map((set, index) => (
                                    <div key={set.id} className="grid grid-cols-[2.5rem_1fr_1fr_2.75rem] items-end gap-2 px-4 py-4">
                                        <span className="pb-3 text-small text-secondary">S{index + 1}</span>
                                        <label className="text-label text-primary">
                                            kg
                                            <DecimalInput
                                                value={set.weight}
                                                onValueChange={(value) => onChangeSet(set.id, {weight: value})}
                                                className="mt-1 h-11 w-full rounded-control border border-border bg-surface-subtle px-3 text-center font-mono text-small"
                                            />
                                        </label>
                                        <label className="text-label text-primary">
                                            reps
                                            <DecimalInput
                                                value={set.reps}
                                                onValueChange={(value) => onChangeSet(set.id, {reps: value})}
                                                className="mt-1 h-11 w-full rounded-control border border-border bg-surface-subtle px-3 text-center font-mono text-small"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => onChangeSet(set.id, {completed: !set.completed})}
                                            aria-label={`${set.completed ? "Reopen" : "Complete"} set ${index + 1} for ${exercise}`}
                                            aria-pressed={set.completed}
                                            className={`grid size-11 place-items-center rounded-control border ${
                                                set.completed
                                                    ? "border-brand bg-brand text-on-accent"
                                                    : "border-border bg-surface-subtle text-primary"
                                            }`}
                                        >
                                            <Icon name="check" className="size-5"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={onFinish}
                className="mt-6 h-12 w-full rounded-control bg-surface-inverse px-5 font-semibold text-inverse"
            >
                Finish prototype workout
            </button>
        </div>
    );
}

function HistoryRows({history}: {history: PrototypeHistoryItem[]}) {
    return (
        <div className="divide-y divide-divider">
            {history.map((item) => (
                <article key={item.id} className="px-5 py-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-small text-secondary">
                        {item.date} · {item.duration} min · {item.exerciseCount} exercises
                    </p>
                </article>
            ))}
        </div>
    );
}

function HistoryView({history}: {history: PrototypeHistoryItem[]}) {
    return (
        <div>
            <PageHeading title="History" description={`${history.length} workouts logged`}/>
            <section className="mt-6 overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <HistoryRows history={history}/>
            </section>
        </div>
    );
}

function MeasurementsView({
    latestWeight,
    count,
    onLog,
}: {
    latestWeight: number;
    count: number;
    onLog: () => void;
}) {
    return (
        <div>
            <div className="flex items-start justify-between gap-4">
                <PageHeading title="Measurements" description={`${count} browser-only sample entries`}/>
                <button
                    type="button"
                    onClick={onLog}
                    className="grid size-12 shrink-0 place-items-center rounded-control bg-surface-inverse text-xl text-inverse"
                    aria-label="Log sample measurement"
                >
                    +
                </button>
            </div>
            <section className="mt-6 rounded-card border border-border bg-surface p-5 shadow-card">
                <p className="text-label font-semibold uppercase text-secondary">Latest</p>
                <div className="mt-5 grid grid-cols-3 gap-5">
                    {[
                        ["Weight", `${latestWeight} kg`, "−0.1"],
                        ["Waist", "64 cm", "−1.0"],
                        ["Hips", "95 cm", "−0.5"],
                    ].map(([label, value, difference]) => (
                        <article key={label}>
                            <h2 className="text-small text-primary">{label}</h2>
                            <p className="mt-1 font-mono text-body font-semibold">{value}</p>
                            <p className="mt-1 font-mono text-small text-secondary">{difference}</p>
                        </article>
                    ))}
                </div>
                <svg viewBox="0 0 300 80" className="mt-6 h-24 w-full" role="img" aria-label="Sample weight trend">
                    <path d="M5 12 C45 24 70 29 105 36 S170 43 205 56 S255 58 295 70" fill="none" stroke="currentColor" strokeWidth="3" className="text-brand"/>
                </svg>
            </section>
        </div>
    );
}

function ProgressView() {
    const [selectedView, setSelectedView] = useState<"front" | "side" | "back">("front");

    return (
        <div>
            <PageHeading title="Progress" description="Explore visual comparison without uploading photos"/>
            <div className="mt-6 grid grid-cols-3 gap-2">
                {(["front", "side", "back"] as const).map((photoView) => (
                    <button
                        key={photoView}
                        type="button"
                        onClick={() => setSelectedView(photoView)}
                        aria-pressed={selectedView === photoView}
                        className={`h-11 rounded-control border text-small font-semibold capitalize ${
                            selectedView === photoView
                                ? "border-surface-inverse bg-surface-inverse text-inverse"
                                : "border-border bg-surface text-primary"
                        }`}
                    >
                        {photoView}
                    </button>
                ))}
            </div>
            <section className="mt-4 grid min-h-96 grid-cols-2 overflow-hidden rounded-card border border-border bg-surface shadow-card">
                <div className="relative grid place-items-center border-r border-divider bg-[linear-gradient(160deg,#dcebe3,#8db8a5)]">
                    <div className="h-56 w-20 rounded-[45%] border border-white/60 bg-white/25"/>
                    <span className="absolute bottom-4 rounded-pill bg-surface-inverse/80 px-3 py-1 text-label text-inverse">12 Mar · Before</span>
                </div>
                <div className="relative grid place-items-center bg-[linear-gradient(160deg,#efe8df,#c9a988)]">
                    <div className="h-56 w-20 rounded-[42%] border border-white/60 bg-white/25"/>
                    <span className="absolute bottom-4 rounded-pill bg-surface-inverse/80 px-3 py-1 text-label text-inverse">14 Nov · After</span>
                </div>
            </section>
            <p className="mt-3 text-center text-small text-secondary">
                Showing the {selectedView} comparison. Real photos are never used in prototype mode.
            </p>
        </div>
    );
}
