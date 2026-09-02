import {createRoutineAction} from "../actions";
import Link from "next/link";
import PrimaryButton from "@/components/layout/actionComponents/primaryButton";

export default function RoutineNewPage() {
    return (
        <main className="flex-1 px-5 py-7 md:px-12 md:py-14">
            <div className="max-w-5xl">
                <header className="flex gap-4">
                    <Link
                        href="/routines"
                        aria-label="Back to routines"
                        className="mt-2 text-secondary"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="size-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 12H5M10 7l-5 5 5 5"/>
                        </svg>
                    </Link>

                    <div>
                        <h1 className="font-display text-display font-bold text-3xl">
                            New Routine
                        </h1>
                        <p className="mt-1 text-base text-secondary">
                            0 workouts
                        </p>
                    </div>
                </header>

                <form
                    action={createRoutineAction}
                    className="mt-7 space-y-5 rounded-card border border-border bg-surface p-6 shadow-card"
                >
                    <label className="block" htmlFor="routineName">
                        <span className="form-label">
                            Routine name
                        </span>
                        <input
                            id="routineName"
                            name="name"
                            type="text"
                            placeholder="New Routine"
                            autoComplete="off"
                            className="form-control"
                            required
                        />
                    </label>

                    <label className="block" htmlFor="routineDescription">
                        <span className="form-label">
                            Description
                        </span>
                        <textarea
                            id="routineDescription"
                            name="description"
                            placeholder="Describe your routine"
                            rows={1}
                            className="form-control"
                        />
                    </label>

                    <PrimaryButton
                        type="submit"
                        variant="primary"
                        label="Create routine"
                        pendingLabel="Creating..."
                        ariaLabel="Create routine"
                    />
                </form>
            </div>
        </main>
    );
}
