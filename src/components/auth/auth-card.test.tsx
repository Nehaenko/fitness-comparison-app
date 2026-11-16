import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import {AuthCard} from "@/components/auth/auth-card";

vi.mock("@/components/auth/google-auth-button", () => ({
    GoogleAuthButton: () => <button type="button">Continue with Google</button>,
}));

afterEach(cleanup);

describe("AuthCard", () => {
    it("offers public prototype access", () => {
        render(<AuthCard mode="login"/>);

        expect(
            screen.getByRole("link", {name: "Enter prototype"}),
        ).toHaveAttribute("href", "/prototype");
    });

    it("explains that prototype access remains available after an access error", () => {
        render(<AuthCard mode="login" error="AccessDenied"/>);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Private testing is currently full",
        );
        expect(
            screen.getByRole("link", {name: "Enter prototype"}),
        ).toBeInTheDocument();
    });
});
