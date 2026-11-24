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
        expect(screen.getAllByRole("link", {name: "Privacy policy"})[0])
            .toHaveAttribute("href", "/privacy");
        expect(screen.getAllByRole("link", {name: "Terms of use"})[0])
            .toHaveAttribute("href", "/terms");
        expect(screen.getByText(/© 2026 Alla Nekhaienko/))
            .toBeInTheDocument();
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
