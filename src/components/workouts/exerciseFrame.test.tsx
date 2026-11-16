import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
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
        vi.useRealTimers();
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

    it("allows a complete decimal weight without dropping the decimal point", async () => {
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

        const weightInput = screen.getByRole("textbox", {
            name: /Weight for set 1/,
        });

        expect(weightInput).toHaveValue("");
        expect(weightInput).toHaveAttribute("placeholder", "0");

        await user.type(weightInput, "60.8");

        expect(weightInput).toHaveValue("60.8");

        expect(onSetsChange).toHaveBeenLastCalledWith([
            expect.objectContaining({weight: 60.8}),
        ]);
    });

    it("uses one completion action without set fields for cardio", async () => {
        const user = userEvent.setup();
        const onSetsChange = vi.fn();

        render(
            <ExerciseFrame
                selectedExercise={{
                    ...selectedExercise,
                    name: "Running",
                    muscleGroup: "cardiovascular system",
                    sets: 1,
                    targetReps: 1,
                    restSeconds: 0,
                }}
                sets={[
                    {
                        id: "cardio-set",
                        weight: null,
                        reps: 1,
                        completed: false,
                    },
                ]}
                onStartRest={vi.fn()}
                onSetsChange={onSetsChange}
            />,
        );

        expect(screen.queryByText(/sets done/)).not.toBeInTheDocument();
        expect(screen.queryByText("Add set")).not.toBeInTheDocument();
        expect(screen.queryByText("reps")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", {
            name: "Mark exercise complete",
        }));

        expect(onSetsChange).toHaveBeenCalledWith([
            expect.objectContaining({completed: true}),
        ]);
    });

    it("uses the previous set values as placeholders for the next set", () => {
        render(
            <ExerciseFrame
                selectedExercise={selectedExercise}
                sets={[
                    {
                        id: "set-1",
                        weight: 12.5,
                        reps: 8,
                        completed: true,
                    },
                    {
                        id: "set-2",
                        weight: null,
                        reps: null,
                        completed: false,
                    },
                ]}
                onStartRest={vi.fn()}
                onSetsChange={vi.fn()}
            />,
        );

        expect(screen.getByRole("textbox", {
            name: /Weight for set 2/,
        })).toHaveAttribute("placeholder", "12.5");
        expect(screen.getByRole("spinbutton", {
            name: /Repetitions for set 2/,
        })).toHaveAttribute("placeholder", "8");
    });

    it("briefly shows improvements over the previous matching set", () => {
        vi.useFakeTimers();

        render(
            <ExerciseFrame
                selectedExercise={selectedExercise}
                sets={[
                    {
                        id: "set-1",
                        weight: 105,
                        reps: 8,
                        completed: false,
                    },
                ]}
                previousPerformance={previousPerformance}
                onStartRest={vi.fn()}
                onSetsChange={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", {
            name: "Mark set 1 complete",
        }));

        expect(screen.getByRole("status")).toHaveTextContent(
            "5 kg heavier and 2 more reps than last time",
        );

        act(() => {
            vi.advanceTimersByTime(2_500);
        });

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
