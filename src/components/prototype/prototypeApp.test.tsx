import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it} from "vitest";

import PrototypeApp from "@/components/prototype/prototypeApp";

describe("PrototypeApp", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(cleanup);

    it("runs a workout flow without requiring an account", async () => {
        const user = userEvent.setup();
        render(<PrototypeApp/>);

        await user.click(
            screen.getByRole("button", {name: "Workout", pressed: false}),
        );
        await user.click(
            screen.getByRole("button", {
                name: "Complete set 1 for Barbell Squat",
            }),
        );
        await user.click(
            screen.getByRole("button", {name: "Finish prototype workout"}),
        );

        expect(
            screen.getByRole("heading", {name: "History"}),
        ).toBeInTheDocument();
        expect(screen.getByText("Prototype workout saved")).toBeInTheDocument();
        expect(screen.getAllByText("Lower Body A").length).toBeGreaterThan(0);
    });

    it("states that prototype changes are browser-only", () => {
        render(<PrototypeApp/>);

        expect(
            screen.getByText(/No account, database record, or photo upload is created/i),
        ).toBeInTheDocument();
    });
});
