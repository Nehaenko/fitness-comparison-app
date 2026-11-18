import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import ThemeToggle from "@/components/layout/themeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "light";
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    delete document.documentElement.dataset.theme;
    window.localStorage.clear();
  });

  it("switches to dark mode and saves the preference", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("forma:theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Light mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches an existing dark theme back to light", async () => {
    document.documentElement.dataset.theme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle compact />);

    await user.click(
      screen.getByRole("button", { name: "Switch to light theme" }),
    );

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("forma:theme")).toBe("light");
  });
});
