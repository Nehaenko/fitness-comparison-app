import Link from "next/link";
import { redirect } from "next/navigation";

import PrimaryButton from "@/components/layout/actionComponents/primaryButton";

import {
    activateRoutineAction,
    deleteRoutineAction,
} from "./actions";
import { getAuthenticatedRoutines } from "./data";

export default async function RoutinesPage() {
    const routines = await getAuthenticatedRoutines();

    if (routines.length === 0) {
        redirect("/routines/new");
    }

    return (
        <main className="flex-1 px-5 py-7 md:px-12 md:py-14">
            <div className="max-w-5xl">
                <header className="flex items-center justify-between gap-5">
                    <div>
                        <h1 className="font-display text-display font-bold text-3xl">
                            Routines
                        </h1>
                        <p className="mt-1 text-base text-secondary">
                            Plan and manage your training programmes
                        </p>
                    </div>

                    <Link
                        href="/routines/new"
                        aria-label="Create a new routine"
                        className="grid size-12 shrink-0 place-items-center rounded-control bg-surface-inverse text-2xl text-inverse"
                    >
                        +
                    </Link>
                </header>

                <div className="mt-7 space-y-5">
                    {routines.map((routine) => {
                        const activateAction = activateRoutineAction.bind(
                            null,
                            routine.id,
                        );
                        const deleteAction = deleteRoutineAction.bind(
                            null,
                            routine.id,
                        );

                        return (
                            <article
                                key={routine.id}
                                className={`rounded-card border bg-surface p-6 shadow-card ${
                                    routine.isActive
                                        ? "border-brand"
                                        : "border-border"
                                }`}
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    {routine.isActive && (
                                        <span className="rounded-pill bg-brand-soft px-3 py-1 text-small font-semibold text-brand">
                                            Active
                                        </span>
                                    )}
                                    <h2 className="text-lg font-semibold">
                                        {routine.name}
                                    </h2>
                                </div>

                                {routine.description && (
                                    <p className="mt-2 text-secondary">
                                        {routine.description}
                                    </p>
                                )}

                                <p className="mt-4 text-small text-secondary">
                                    0 workouts
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-divider pt-5">
                                    <Link
                                        href={`/routines/${routine.id}/edit`}
                                        className="flex h-12 items-center rounded-control bg-surface-subtle px-4 font-semibold"
                                    >
                                        Edit
                                    </Link>

                                    {!routine.isActive && (
                                        <form action={activateAction}>
                                            <PrimaryButton
                                                type="submit"
                                                variant="brand"
                                                label="Set active"
                                                pendingLabel="Activating..."
                                                fullWidth={false}
                                            />
                                        </form>
                                    )}

                                    <form action={deleteAction} className="ml-auto">
                                        <PrimaryButton
                                            type="submit"
                                            variant="danger"
                                            label="Delete"
                                            pendingLabel="Deleting..."
                                            fullWidth={false}
                                            iconName="delete"
                                        />
                                    </form>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
