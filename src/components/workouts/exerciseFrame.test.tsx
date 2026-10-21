import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

import ExerciseFrame from "@/components/workouts/exerciseFrame";
import type {ConfiguredExercise} from "@/types/routine-builder";
import type {PreviousExercisePerformance} from "@/types/history";

const selectedExercise: ConfiguredExercise = {
    id: "configured-1",
    exerciseId: "exercise-1",
    name: "Barbell Squat",
    muscleGroup: "quadriceps",
    equipment: "barbell",
    sets: 2,
    targetReps: 6,
    targetWeight: 100,
    restSeconds: 180,
};

const previousPerformance: PreviousExercisePerformance = {
    exerciseId: "exercise-1",
    completedAt: new Date("2026-10-20T12:00:00Z"),
    sets: [
        {id: "previous-1", position: 0, weight: 100, reps: 6},
        {id: "previous-2", position: 1, weight: null, reps: 8},
    ],
};

describe("ExerciseFrame history", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders the latest previous sets above today's inputs", () => {
        render(
            <ExerciseFrame
                selectedExercise={selectedExercise}
                sets={[
                    {
                        id: "set-1",
                        weight: 100,
                        reps: 6,
                        completed: false,
                    },
                ]}
                previousPerformance={previousPerformance}
                onStartRest={vi.fn()}
                onSetsChange={vi.fn()}
            />,
        );

        expect(
            screen.getByRole("heading", {name: "Previous"}),
        ).toBeInTheDocument();
        expect(screen.getByText(/100 kg/)).toBeInTheDocument();
        expect(screen.getByText(/Bodyweight/)).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {name: "Today"}),
        ).toBeInTheDocument();
    });

    it("does not render an empty previous-performance panel", () => {
        render(
            <ExerciseFrame
                selectedExercise={selectedExercise}
                sets={[]}
                previousPerformance={{
                    ...previousPerformance,
                    sets: [],
                }}
                onStartRest={vi.fn()}
                onSetsChange={vi.fn()}
            />,
        );

        expect(
            screen.queryByRole("heading", {name: "Previous"}),
        ).not.toBeInTheDocument();
    });

    it("shows zero as a placeholder without prefixing typed weight", async () => {
        const user = userEvent.setup();
        const onSetsChange = vi.fn();

        render(
            <ExerciseFrame
                selectedExercise={{
                    ...selectedExercise,
                    targetWeight: null,
                }}
                sets={[
                    {
                        id: "set-1",
                        weight: null,
                        reps: 6,
                        completed: false,
                    },
                ]}
                onStartRest={vi.fn()}
                onSetsChange={onSetsChange}
            />,
        );

        const weightInput = screen.getByRole("spinbutton", {
            name: /Weight for set 1/,
        });

        expect(weightInput).toHaveValue(null);
        expect(weightInput).toHaveAttribute("placeholder", "0");

        await user.type(weightInput, "6");

        expect(onSetsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({weight: 6}),
        ]);
    });
});
