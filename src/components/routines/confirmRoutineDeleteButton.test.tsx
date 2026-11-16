import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

import ConfirmRoutineDeleteButton from "@/components/routines/confirmRoutineDeleteButton";

describe("ConfirmRoutineDeleteButton", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("does not submit when routine deletion is cancelled", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn((event: React.FormEvent) => {
            event.preventDefault();
        });
        vi.spyOn(window, "confirm").mockReturnValue(false);

        render(
            <form onSubmit={onSubmit}>
                <ConfirmRoutineDeleteButton routineName="Lower Body"/>
            </form>,
        );

        await user.click(screen.getByRole("button", {
            name: "Delete Lower Body",
        }));

        expect(window.confirm).toHaveBeenCalledWith(
            "Delete “Lower Body”? This cannot be undone.",
        );
        expect(onSubmit).not.toHaveBeenCalled();
    });
});
