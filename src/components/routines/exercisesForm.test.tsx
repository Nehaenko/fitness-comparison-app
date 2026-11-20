import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    createCustomExerciseAction: vi.fn(),
}));

vi.mock("@/app/(protected)/routines/actions", () => ({
    createCustomExerciseAction: mocks.createCustomExerciseAction,
}));

import ExercisesForm from "@/components/routines/exercisesForm";

describe("ExercisesForm", () => {
    afterEach(cleanup);

    it("searches the complete exercise list without category tabs", async () => {
        const user = userEvent.setup();
        render(
            <ExercisesForm
                exercises={[
                    {
                        id: "running",
                        name: "Running",
                        muscleGroup: "cardiovascular system",
                        equipment: "body only",
                    },
                    {
                        id: "hollow-rock",
                        name: "Hollow Rock",
                        muscleGroup: "abdominals",
                        equipment: "body only",
                    },
                ]}
                handleExerciseModalVisibility={vi.fn()}
                onAddExercise={vi.fn()}
                onExerciseCreated={vi.fn()}
            />,
        );

        expect(screen.queryByRole("button", {name: "Chest"}))
            .not.toBeInTheDocument();

        await user.type(
            screen.getByRole("searchbox", {name: "Search exercises"}),
            "hollow",
        );

        expect(screen.getByText("Hollow Rock")).toBeInTheDocument();
        expect(screen.queryByText("Running")).not.toBeInTheDocument();
    });

    it("creates a private exercise and adds it to the workout", async () => {
        const user = userEvent.setup();
        const onAddExercise = vi.fn();
        const onExerciseCreated = vi.fn();
        const closeModal = vi.fn();
        const exercise = {
            id: "custom-exercise",
            name: "Cable Glute Kickback",
            muscleGroup: "Glutes",
            equipment: "Cable",
        };
        mocks.createCustomExerciseAction.mockResolvedValue({
            success: true,
            exercise,
        });

        render(
            <ExercisesForm
                exercises={[]}
                handleExerciseModalVisibility={closeModal}
                onAddExercise={onAddExercise}
                onExerciseCreated={onExerciseCreated}
            />,
        );

        await user.click(screen.getByRole("button", {
            name: "Create your own exercise",
        }));
        await user.type(
            screen.getByRole("textbox", {name: "Exercise name"}),
            "Cable Glute Kickback",
        );
        await user.type(
            screen.getByRole("textbox", {name: "Muscle group"}),
            "Glutes",
        );
        await user.type(
            screen.getByRole("textbox", {name: "Equipment"}),
            "Cable",
        );
        await user.click(screen.getByRole("button", {
            name: "Create and add exercise",
        }));

        expect(mocks.createCustomExerciseAction).toHaveBeenCalledWith({
            name: "Cable Glute Kickback",
            type: "strength",
            muscleGroup: "Glutes",
            equipment: "Cable",
        });
        expect(onExerciseCreated).toHaveBeenCalledWith(exercise);
        expect(onAddExercise).toHaveBeenCalledWith(exercise);
        expect(closeModal).toHaveBeenCalled();
    });
});
