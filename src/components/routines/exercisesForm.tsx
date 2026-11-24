import {useState} from "react";

import {createCustomExerciseAction} from "@/app/(protected)/routines/actions";
import Icon from "@/components/layout/actionComponents/iconComponent";
import formatExerciseDetail from "@/helpers/exercise-formatting";
import type {ExerciseOption} from "@/types/routine-builder";
import type {CustomExerciseInput} from "@/validation/routines";

type ExercisesFormData = {
    exercises: ExerciseOption[];
    handleExerciseModalVisibility: () => void;
    onAddExercise: (exercise: ExerciseOption) => void;
    onExerciseCreated: (exercise: ExerciseOption) => void;
    purpose?: "add" | "replace";
};

const initialCustomExercise: CustomExerciseInput = {
    name: "",
    type: "strength",
    muscleGroup: "",
    equipment: "",
};

export default function ExercisesForm({
                                          exercises,
                                          handleExerciseModalVisibility,
                                          onAddExercise,
                                          onExerciseCreated,
                                          purpose = "add",
                                      }: ExercisesFormData) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState<"browse" | "create">("browse");
    const [customExercise, setCustomExercise] =
        useState<CustomExerciseInput>(initialCustomExercise);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const itemsPerPage = 10;
    const filteredExercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const totalPages = Math.max(
        1,
        Math.ceil(filteredExercises.length / itemsPerPage),
    );
    const currentItems = filteredExercises.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const createExercise = async () => {
        if (isCreating) return;

        setIsCreating(true);
        setCreateError(null);

        try {
            const result = await createCustomExerciseAction(customExercise);

            if (!result.success) {
                setCreateError(result.error);
                return;
            }

            onExerciseCreated(result.exercise);
            onAddExercise(result.exercise);
            handleExerciseModalVisibility();
        } catch {
            setCreateError("Unable to create exercise");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-backdrop backdrop-blur-[3px] sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-modal-title"
        >
            <div className="flex h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-panel bg-surface shadow-floating sm:h-[min(58rem,calc(100dvh-2rem))] sm:rounded-panel">
                <header className="flex items-center justify-between border-b border-divider px-5 py-4">
                    <div className="flex items-center gap-2">
                        {view === "create" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateError(null);
                                    setView("browse");
                                }}
                                aria-label="Back to exercise list"
                                className="grid size-8 place-items-center rounded-full text-primary hover:bg-surface-subtle"
                            >
                                <Icon name="arrow-left" className="size-5"/>
                            </button>
                        ) : null}
                        <h2 id="exercise-modal-title" className="font-semibold text-primary">
                            {view === "create"
                                ? "Create exercise"
                                : purpose === "replace"
                                    ? "Replace exercise"
                                    : "Add exercise"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleExerciseModalVisibility}
                        aria-label="Close exercise selection"
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-primary hover:bg-surface-subtle"
                    >
                        <Icon name="close" className="size-5"/>
                    </button>
                </header>

                {view === "browse" ? (
                    <>
                        <div className="space-y-3 border-b border-divider px-4 py-4">
                            {purpose === "replace" ? (
                                <p className="text-small text-secondary">
                                    This changes only the workout in progress. Your saved routine stays the same.
                                </p>
                            ) : null}
                            <label htmlFor="exercises-search" className="sr-only">
                                Search exercises
                            </label>
                            <input
                                id="exercises-search"
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setCurrentPage(1);
                                }}
                                type="search"
                                placeholder="Search exercises..."
                                className="h-11 w-full rounded-control border border-brand bg-surface px-3 text-small outline-none placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                            />
                            <button
                                type="button"
                                onClick={() => setView("create")}
                                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-brand-soft px-4 text-small font-semibold text-brand transition hover:bg-brand-soft-hover"
                            >
                                <span aria-hidden="true" className="text-lg font-normal leading-none">+</span>
                                Create your own exercise
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
                            {currentItems.length > 0 ? currentItems.map((exercise) => (
                                <button
                                    type="button"
                                    key={exercise.id}
                                    className="flex min-h-16 w-full items-center justify-between gap-4 py-2 text-left"
                                    onClick={() => {
                                        onAddExercise(exercise);
                                        handleExerciseModalVisibility();
                                    }}
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-small font-semibold text-primary">
                                            {exercise.name}
                                        </span>
                                        <span className="mt-0.5 block truncate text-label text-secondary">
                                            {formatExerciseDetail(exercise.muscleGroup)} · {formatExerciseDetail(exercise.equipment)}
                                        </span>
                                    </span>
                                    <span aria-hidden="true" className="shrink-0 text-xl leading-none text-brand">+</span>
                                </button>
                            )) : (
                                <p className="py-12 text-center text-small text-secondary">
                                    No exercises found.
                                </p>
                            )}
                        </div>

                        <footer className="flex items-center justify-between gap-3 border-t border-divider px-5 py-3">
                            <p className="text-label text-secondary">
                                {filteredExercises.length} exercises · Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    className="rounded-control border border-border px-3 py-2 text-label font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    className="rounded-control border border-border px-3 py-2 text-label font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                        <div className="space-y-5">
                            <label className="block" htmlFor="custom-exercise-name">
                                <span className="form-label">Exercise name</span>
                                <input
                                    id="custom-exercise-name"
                                    value={customExercise.name}
                                    onChange={(event) => setCustomExercise((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))}
                                    className="form-control"
                                    placeholder="e.g. Cable glute kickback"
                                    maxLength={100}
                                    autoFocus
                                />
                            </label>

                            <label className="block" htmlFor="custom-exercise-type">
                                <span className="form-label">Exercise type</span>
                                <span className="relative block min-w-0">
                                    <select
                                        id="custom-exercise-type"
                                        value={customExercise.type}
                                        onChange={(event) => setCustomExercise((current) => ({
                                            ...current,
                                            type: event.target.value as CustomExerciseInput["type"],
                                        }))}
                                        className="form-control min-w-0 appearance-none normal-case !pr-10"
                                    >
                                        <option value="strength">Strength</option>
                                        <option value="cardio">Cardio</option>
                                    </select>
                                    <Icon
                                        name="chevron-down"
                                        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary"
                                        strokeWidth={1.5}
                                    />
                                </span>
                            </label>

                            {customExercise.type === "strength" ? (
                                <label className="block" htmlFor="custom-exercise-muscle-group">
                                    <span className="form-label">Muscle group</span>
                                    <input
                                        id="custom-exercise-muscle-group"
                                        value={customExercise.muscleGroup}
                                        onChange={(event) => setCustomExercise((current) => ({
                                            ...current,
                                            muscleGroup: event.target.value,
                                        }))}
                                        className="form-control"
                                        placeholder="e.g. Glutes"
                                        maxLength={60}
                                    />
                                </label>
                            ) : null}

                            <label className="block" htmlFor="custom-exercise-equipment">
                                <span className="form-label">Equipment</span>
                                <input
                                    id="custom-exercise-equipment"
                                    value={customExercise.equipment}
                                    onChange={(event) => setCustomExercise((current) => ({
                                        ...current,
                                        equipment: event.target.value,
                                    }))}
                                    className="form-control"
                                    placeholder="Optional"
                                    maxLength={60}
                                />
                            </label>

                            {createError ? (
                                <p role="alert" className="rounded-control bg-danger-soft px-4 py-3 text-small text-danger">
                                    {createError}
                                </p>
                            ) : null}

                            <button
                                type="button"
                                onClick={createExercise}
                                disabled={isCreating}
                                className="h-12 w-full rounded-control bg-surface-inverse px-5 text-small font-semibold text-inverse transition hover:bg-surface-inverse-control disabled:cursor-wait disabled:opacity-60"
                            >
                                {isCreating
                                    ? "Creating exercise..."
                                    : purpose === "replace"
                                        ? "Create and use exercise"
                                        : "Create and add exercise"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
