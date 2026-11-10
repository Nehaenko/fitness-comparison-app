import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("@/components/progress/comparisonPhoto", () => ({
    default: ({
                  photo,
                  selectedView,
                  side,
              }: {
        photo?: {id: string};
        selectedView: string;
        side: string;
    }) => (
        <div data-testid={`${side}-photo`}>
            {selectedView}:{photo?.id ?? "missing"}
        </div>
    ),
}));

import ProgressComparison from "@/components/progress/progressComparison";
import type {ProgressEntryRecord} from "@/types/progress";

const entries: ProgressEntryRecord[] = [
    {
        id: "newest",
        recordedOn: "2026-11-10",
        weight: null,
        photos: [
            {id: "new-front", view: "front", imageUrl: "/new-front"},
            {id: "new-side", view: "side", imageUrl: "/new-side"},
        ],
    },
    {
        id: "oldest",
        recordedOn: "2026-11-09",
        weight: null,
        photos: [
            {id: "old-front", view: "front", imageUrl: "/old-front"},
            {id: "old-side", view: "side", imageUrl: "/old-side"},
        ],
    },
];

const photoViews = [
    {view: "front" as const, label: "Front"},
    {view: "side" as const, label: "Side"},
    {view: "back" as const, label: "Back"},
];

describe("ProgressComparison", () => {
    afterEach(cleanup);

    it("starts with the oldest entry before and newest entry after", () => {
        render(
            <ProgressComparison
                entries={entries}
                photoViews={photoViews}
            />,
        );

        expect(screen.getByLabelText("Before")).toHaveValue("oldest");
        expect(screen.getByLabelText("After")).toHaveValue("newest");
        expect(screen.getByTestId("before-photo")).toHaveTextContent(
            "front:old-front",
        );
        expect(screen.getByTestId("after-photo")).toHaveTextContent(
            "front:new-front",
        );
    });

    it("switches both panels to the selected photo view", async () => {
        const user = userEvent.setup();
        render(
            <ProgressComparison
                entries={entries}
                photoViews={photoViews}
            />,
        );

        await user.click(screen.getByRole("button", {name: "Side"}));

        expect(screen.getByTestId("before-photo")).toHaveTextContent(
            "side:old-side",
        );
        expect(screen.getByTestId("after-photo")).toHaveTextContent(
            "side:new-side",
        );
    });

    it("allows either selector to use any available entry", async () => {
        const user = userEvent.setup();
        render(
            <ProgressComparison
                entries={entries}
                photoViews={photoViews}
            />,
        );

        await user.selectOptions(screen.getByLabelText("Before"), "newest");
        await user.selectOptions(screen.getByLabelText("After"), "oldest");

        expect(screen.getByTestId("before-photo")).toHaveTextContent(
            "front:new-front",
        );
        expect(screen.getByTestId("after-photo")).toHaveTextContent(
            "front:old-front",
        );
    });
});
