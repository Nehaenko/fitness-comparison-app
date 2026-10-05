import {useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";
import type {Exercise} from "@/db/schema";
import formatExerciseDetail from "@/helpers/exercise-formatting";

type ExercisesFormData = {
    exercises: Exercise[];
    handleExerciseModalVisibility: () => void;
    onAddExercise: (exercise: Exercise) => void;
};

const exerciseCategories = [
    {label: "All", value: "all", muscleGroups: []},
    {label: "Chest", value: "chest", muscleGroups: ["chest"]},
    {
        label: "Back",
        value: "back",
        muscleGroups: ["lats", "middle back", "lower back", "traps"],
    },
    {
        label: "Shoulders",
        value: "shoulders",
        muscleGroups: ["shoulders"],
    },
    {label: "Biceps", value: "biceps", muscleGroups: ["biceps"]},
    {label: "Triceps", value: "triceps", muscleGroups: ["triceps"]},
];

export default function ExercisesForm({
                                          exercises,
                                          handleExerciseModalVisibility,
                                          onAddExercise
                                      }: ExercisesFormData) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("all");

    const itemsPerPage = 10;

    const selectedMuscleGroups = exerciseCategories.find(
        (category) => category.value === selectedCategory,
    )?.muscleGroups ?? [];

    const filteredExercises = exercises.filter((exercise) => {
        const matchesSearch = exercise.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesCategory =
            selectedCategory === "all" ||
            selectedMuscleGroups.includes(
                exercise.muscleGroup?.toLowerCase() ?? "",
            );

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredExercises.length / itemsPerPage),
    );

    const currentItems = filteredExercises.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exercise-modal-title"
        >
            <div
                className="flex h-[min(58rem,calc(100dvh-2rem))] w-full flex-col overflow-hidden rounded-panel bg-surface shadow-floating">
                <header className="flex items-center justify-between border-b border-divider px-5 py-4">
                    <h2 id="exercise-modal-title" className="font-semibold text-primary">
                        Add Exercise
                    </h2>

                    <button
                        type="button"
                        onClick={handleExerciseModalVisibility}
                        aria-label="Close exercise selection"
                        className="grid size-8 cursor-pointer place-items-center rounded-full text-primary"
                    >
                        <Icon name="close" className="size-5"/>
                    </button>
                </header>

                <div className="border-b border-divider px-4 py-4">
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
                        className="h-11 w-full rounded-control border border-brand bg-surface px-3 text-small outline-none placeholder:text-secondary"
                    />

                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {exerciseCategories.map((category) => (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(category.value);
                                    setCurrentPage(1);
                                }}
                                key={category.value}
                                className={`shrink-0 rounded-pill px-3 py-1.5 text-label font-semibold ${
                                    selectedCategory === category.value
                                        ? "bg-surface-inverse text-inverse"
                                        : "bg-surface-subtle text-secondary"
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
                    {currentItems.length > 0 ? (
                        currentItems.map((exercise) => (
                            <div
                                key={exercise.id}
                                className="flex min-h-16 items-center justify-between gap-4 py-2"
                                onClick={() => {
                                    onAddExercise(exercise);
                                    handleExerciseModalVisibility();
                                }}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-small font-semibold text-primary">
                                        {exercise.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-label text-secondary">
                                        {formatExerciseDetail(exercise.muscleGroup)} · {formatExerciseDetail(exercise.equipment)}
                                    </p>
                                </div>

                                <button type="button"
                                        className="shrink-0 text-xl leading-none text-brand">
                                    +
                                </button>
                            </div>
                        ))
                    ) : (
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
                            className="rounded-control border border-border px-3 py-2 text-label font-semibold text-primary disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="rounded-control border border-border px-3 py-2 text-label font-semibold text-primary disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
