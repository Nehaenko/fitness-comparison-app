import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("next/navigation", () => ({
    usePathname: () => "/dashboard",
}));

import Menu from "@/components/layout/header/menu";

describe("Menu", () => {
    afterEach(cleanup);

    it("does not blur or intercept the page while closed", async () => {
        const user = userEvent.setup();

        render(
            <Menu
                user={{name: "Forma user", email: "forma@example.com"}}
                logoutAction={vi.fn(async () => undefined)}
            />,
        );

        const backdrop = screen.getAllByLabelText("Close menu")[0];

        expect(backdrop).toHaveClass(
            "invisible",
            "pointer-events-none",
        );
        expect(backdrop.className).not.toContain("backdrop-blur");

        await user.click(screen.getByRole("button", {name: "Open menu"}));

        expect(backdrop).toHaveClass(
            "visible",
            "pointer-events-auto",
        );
        expect(backdrop.className).not.toContain("backdrop-blur");
        expect(screen.getByLabelText("Main menu")).toHaveAttribute(
            "aria-hidden",
            "false",
        );
    });
});
