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
        measurement: null,
        photos: [
            {id: "new-front", view: "front", imageUrl: "/new-front"},
            {id: "new-side", view: "side", imageUrl: "/new-side"},
        ],
    },
    {
        id: "oldest",
        recordedOn: "2026-11-09",
        measurement: null,
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

const unitProps = {
    weightUnit: "kg" as const,
    measurementUnit: "cm" as const,
};

describe("ProgressComparison", () => {
    afterEach(cleanup);

    it("starts with the oldest entry before and newest entry after", () => {
        render(
            <ProgressComparison
                entries={entries}
                photoViews={photoViews}
                {...unitProps}
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
                {...unitProps}
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
                {...unitProps}
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

    it("shows the matched measurement context for both photos", () => {
        const measuredEntries: ProgressEntryRecord[] = entries.map(
            (entry, index) => ({
                ...entry,
                measurement: {
                    id: `measurement-${index}`,
                    measuredOn: index === 0
                        ? "2026-11-10"
                        : "2026-11-08",
                    weight: index === 0 ? 61.2 : 60,
                    waist: index === 0 ? 64 : 65,
                    chest: 92,
                    hips: 95,
                    thigh: null,
                    arm: 31,
                },
            }),
        );

        render(
            <ProgressComparison
                entries={measuredEntries}
                photoViews={photoViews}
                {...unitProps}
            />,
        );

        const beforeContext = screen.getByRole("region", {
            name: "Before measurement context",
        });
        const afterContext = screen.getByRole("region", {
            name: "After measurement context",
        });

        expect(beforeContext).toHaveTextContent("From 8 Nov 2026");
        expect(beforeContext).toHaveTextContent("60 kg");
        expect(beforeContext).toHaveTextContent("65 cm");
        expect(beforeContext).toHaveTextContent("Thigh—");
        expect(afterContext).toHaveTextContent("From 10 Nov 2026");
        expect(afterContext).toHaveTextContent("61.2 kg");
        expect(afterContext).toHaveTextContent("64 cm");
    });

    it("explains when a photo has no earlier measurements", () => {
        render(
            <ProgressComparison
                entries={entries}
                photoViews={photoViews}
                {...unitProps}
            />,
        );

        expect(screen.getAllByText("No earlier measurements")).toHaveLength(2);
    });
});
