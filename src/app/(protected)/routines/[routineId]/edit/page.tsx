import Link from "next/link";
import { notFound } from "next/navigation";

import PrimaryButton from "@/components/layout/actionComponents/primaryButton";

import { updateRoutineAction } from "../../actions";
import { getAuthenticatedRoutineById } from "../../data";

export default async function EditRoutine({
    params,
}: {
    params: Promise<{ routineId: string }>;
}) {
    const { routineId } = await params;
    const routine = await getAuthenticatedRoutineById(routineId);

    if (!routine) {
        notFound();
    }

    const updateAction = updateRoutineAction.bind(null, routine.id);

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
                            <path d="M19 12H5M10 7l-5 5 5 5" />
                        </svg>
                    </Link>

                    <div>
                        <h1 className="font-display text-display font-bold text-3xl">
                            Edit Routine
                        </h1>
                        <p className="mt-1 text-base text-secondary">
                            Update your routine details
                        </p>
                    </div>
                </header>

                <form
                    action={updateAction}
                    className="mt-7 space-y-5 rounded-card border border-border bg-surface p-6 shadow-card"
                >
                    <label className="block" htmlFor="routineName">
                        <span className="form-label">Routine name</span>
                        <input
                            id="routineName"
                            name="name"
                            className="form-control"
                            defaultValue={routine.name}
                            required
                        />
                    </label>

                    <label className="block" htmlFor="routineDescription">
                        <span className="form-label">Description</span>
                        <textarea
                            id="routineDescription"
                            name="description"
                            className="form-control"
                            defaultValue={routine.description ?? ""}
                            rows={1}
                        />
                    </label>

                    <PrimaryButton
                        type="submit"
                        variant="primary"
                        label="Save changes"
                        pendingLabel="Saving..."
                    />
                </form>
            </div>
        </main>
    );
}
