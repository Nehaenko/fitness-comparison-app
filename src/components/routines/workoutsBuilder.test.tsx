import {useState} from "react";
import {cleanup, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.hoisted(() => {
    class ResizeObserverStub {
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    globalThis.ResizeObserver = ResizeObserverStub;
});

import WorkoutsBuilder from "@/components/routines/workoutsBuilder";
import type {Workout} from "@/types/routine-builder";

const initialWorkouts: Workout[] = [
    {
        id: "workout-1",
        name: "Lower Body",
        exercises: [
            {
                id: "configured-1",
                exerciseId: "exercise-1",
                name: "Barbell Squat",
                muscleGroup: "quadriceps",
                equipment: "barbell",
                sets: 3,
                targetReps: 10,
                targetWeight: null,
                restSeconds: 90,
            },
        ],
    },
];

function BuilderHarness() {
    const [workouts, setWorkouts] = useState(initialWorkouts);

    return (
        <WorkoutsBuilder
            workouts={workouts}
            setWorkouts={setWorkouts}
            exercises={[]}
            weightUnit="kg"
        />
    );
}

function CardioBuilderHarness() {
    const [workouts, setWorkouts] = useState<Workout[]>([
        {
            id: "workout-cardio",
            name: "Cardio",
            exercises: [],
        },
    ]);

    return (
        <WorkoutsBuilder
            workouts={workouts}
            setWorkouts={setWorkouts}
            exercises={[
                {
                    id: "running",
                    name: "Running",
                    muscleGroup: "cardiovascular system",
                    equipment: "body only",
                },
            ]}
            weightUnit="kg"
        />
    );
}

describe("WorkoutsBuilder destructive actions", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("keeps a workout when removal is not confirmed", async () => {
        const user = userEvent.setup();
        const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
        render(<BuilderHarness/>);

        await user.click(screen.getByRole("button", {
            name: "Remove Lower Body",
        }));

        expect(confirm).toHaveBeenCalledWith(
            "Remove “Lower Body” and all of its exercises?",
        );
        expect(screen.getByText("Lower Body")).toBeInTheDocument();
    });

    it("asks before removing an exercise", async () => {
        const user = userEvent.setup();
        const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
        render(<BuilderHarness/>);

        await user.click(screen.getByRole("button", {
            name: "Expand Lower Body",
        }));
        await user.click(screen.getByRole("button", {
            name: "Remove Barbell Squat",
        }));

        expect(confirm).toHaveBeenCalledWith(
            "Remove “Barbell Squat” from this workout?",
        );
        expect(screen.queryByText("Barbell Squat")).not.toBeInTheDocument();
    });

    it("does not show sets, reps, rest, or edit controls for cardio", async () => {
        const user = userEvent.setup();
        render(<CardioBuilderHarness/>);

        await user.click(screen.getByRole("button", {
            name: "Expand Cardio",
        }));
        await user.click(screen.getByRole("button", {
            name: /Add exercise/,
        }));
        await user.click(screen.getByText("Running"));

        const runningRow = screen.getByText("Running").closest("div.border-t");

        expect(runningRow).not.toBeNull();
        expect(within(runningRow as HTMLElement).queryByText(/sets/))
            .not.toBeInTheDocument();
        expect(within(runningRow as HTMLElement).queryByText(/reps/))
            .not.toBeInTheDocument();
        expect(within(runningRow as HTMLElement).queryByText(/rest/))
            .not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Edit Running"}))
            .not.toBeInTheDocument();
    });
});
