import {
    cleanup,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    saveMeasurementAction: vi.fn(),
}));

vi.mock("@/app/(protected)/measurements/actions", () => ({
    saveMeasurementAction:
        mocks.saveMeasurementAction,
}));

import LogModal from "@/components/measurements/logModal";

function renderModal() {
    return render(
        <LogModal
            defaultDate="2026-11-04"
            weightUnit="kg"
            measurementUnit="cm"
        />,
    );
}

describe("LogModal focus management", () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("focuses the date field and restores focus after Escape", async () => {
        const user = userEvent.setup();
        renderModal();

        const trigger = screen.getByRole("button", {
            name: "Log measurements",
        });

        await user.click(trigger);

        const dateInput = screen.getByLabelText("Date");
        await waitFor(() => {
            expect(dateInput).toHaveFocus();
        });

        await user.keyboard("{Escape}");

        await waitFor(() => {
            expect(
                screen.queryByRole("dialog", {
                    name: "Log measurements",
                }),
            ).not.toBeInTheDocument();
            expect(trigger).toHaveFocus();
        });
    });

    it("wraps backwards from the first control to the submit button", async () => {
        const user = userEvent.setup();
        renderModal();

        await user.click(
            screen.getByRole("button", {
                name: "Log measurements",
            }),
        );

        await waitFor(() => {
            expect(screen.getByLabelText("Date")).toHaveFocus();
        });

        const closeButtons = screen.getAllByRole("button", {
            name: "Close measurement form",
        });
        const dialogCloseButton = closeButtons[1];

        dialogCloseButton.focus();
        await user.tab({shift: true});

        expect(
            screen.getByRole("button", {name: "Save entry"}),
        ).toHaveFocus();
    });
});
