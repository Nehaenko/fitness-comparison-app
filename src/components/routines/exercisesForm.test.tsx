import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

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
});
