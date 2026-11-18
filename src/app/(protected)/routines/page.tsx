import Link from "next/link";
import {redirect} from "next/navigation";

import PrimaryButton from "@/components/layout/actionComponents/primaryButton";
import Icon from "@/components/layout/actionComponents/iconComponent";
import ConfirmRoutineDeleteButton from "@/components/routines/confirmRoutineDeleteButton";

import {
    activateRoutineAction,
    deleteRoutineAction,
} from "./actions";
import {getAuthenticatedRoutines} from "./data";

export default async function RoutinesPage() {
    const routines = await getAuthenticatedRoutines();

    if (routines.length === 0) {
        redirect("/routines/new");
    }

    return (
        <main className="flex-1 px-4 py-7 md:px-12 md:py-14">
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
                        prefetch={true}
                        aria-label="Create a new routine"
                        className="grid size-11 shrink-0 place-items-center rounded-control bg-surface-inverse text-xl text-inverse"
                    >
                        +
                    </Link>
                </header>

                <div className="mt-7 space-y-4">
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
                                className={`rounded-card border bg-surface p-5 shadow-card ${
                                    routine.isActive
                                        ? "border-brand"
                                        : "border-border"
                                }`}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {routine.isActive && (
                                        <span
                                            className="rounded-pill bg-brand px-3 py-1 text-label font-semibold text-on-accent">
                                            Active
                                        </span>
                                    )}
                                    <h2 className="text-base font-semibold">
                                        {routine.name}
                                    </h2>
                                </div>

                                {routine.description && (
                                    <p className="mt-2 text-small text-secondary">
                                        {routine.description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {routine.workouts.map((workout, index) => (
                                        <span key={workout.id}
                                            className="rounded-pill bg-surface-subtle px-3 py-1 text-label font-semibold"
                                        >
                                            {index + 1}. {workout.name}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-3 text-small text-secondary">
                                    {routine.workoutCount}{" "}
                                    {routine.workoutCount === 1 ? "workout" : "workouts"}
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-divider pt-4">
                                    <Link
                                        href={`/routines/${routine.id}/edit`}
                                        prefetch={true}
                                        className="flex h-10 items-center gap-2 rounded-control bg-surface-subtle px-4 text-small font-semibold"
                                    >
                                        <Icon name="edit" className="size-4" strokeWidth={1.25}/>
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
                                                compact
                                                iconName="star"
                                            />
                                        </form>
                                    )}

                                    <form action={deleteAction} className="ml-auto">
                                        <ConfirmRoutineDeleteButton
                                            routineName={routine.name}
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
