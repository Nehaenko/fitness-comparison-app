import {cleanup, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, describe, expect, it, vi} from "vitest";

vi.mock("@/components/progress/newProgressRecord", () => ({
    default: ({onSaved}: {onSaved: (recordedOn: string) => void}) => (
        <div>
            New progress form
            <button
                type="button"
                onClick={() => onSaved("2026-11-11")}
            >
                Complete mocked save
            </button>
        </div>
    ),
}));

vi.mock("@/components/progress/progressGallery", () => ({
    default: () => <div>Progress gallery</div>,
}));

vi.mock("@/components/progress/progressComparison", () => ({
    default: () => <div>Progress comparison</div>,
}));

import ProgressStructure from "@/components/progress/progressStructure";
import type {ProgressEntryRecord} from "@/types/progress";

const entries: ProgressEntryRecord[] = [
    {
        id: "entry-2",
        recordedOn: "2026-11-10",
        weight: null,
        photos: [],
    },
    {
        id: "entry-1",
        recordedOn: "2026-11-09",
        weight: null,
        photos: [],
    },
];

const profile = {
    userId: "user-1",
    weightUnit: "kg" as const,
};

describe("ProgressStructure", () => {
    afterEach(cleanup);

    it("opens the add form initially when the gallery is empty", () => {
        render(<ProgressStructure profile={profile} entries={[]}/>);

        expect(screen.getByText("New progress form")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: "Compare progress photos",
            }),
        ).not.toBeInTheDocument();
    });

    it("opens the gallery initially when entries exist", () => {
        render(
            <ProgressStructure
                profile={profile}
                entries={entries.slice(0, 1)}
            />,
        );

        expect(screen.getByText("Progress gallery")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: "Compare progress photos",
            }),
        ).not.toBeInTheDocument();
    });

    it("allows comparison only when at least two entries exist", async () => {
        const user = userEvent.setup();
        render(<ProgressStructure profile={profile} entries={entries}/>);

        const compareButton = screen.getByRole("button", {
            name: "Compare progress photos",
        });

        expect(compareButton).toBeEnabled();
        await user.click(compareButton);

        expect(screen.getByText("Progress comparison")).toBeInTheDocument();
        expect(compareButton).toHaveAttribute("aria-pressed", "true");
        expect(screen.queryByText("Photos and visual comparison"))
            .not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {name: "Back to gallery"}),
        );

        expect(screen.getByText("Progress gallery")).toBeInTheDocument();
    });

    it("opens the add form from an existing gallery", async () => {
        const user = userEvent.setup();
        render(<ProgressStructure profile={profile} entries={entries}/>);

        await user.click(
            screen.getByRole("button", {name: "Add progress entry"}),
        );

        expect(screen.getByText("New progress form")).toBeInTheDocument();
        expect(screen.queryByText("Photos and visual comparison"))
            .not.toBeInTheDocument();
    });

    it("shows a gallery skeleton until refreshed saved data arrives", async () => {
        const user = userEvent.setup();
        const {rerender} = render(
            <ProgressStructure profile={profile} entries={entries}/>,
        );

        await user.click(
            screen.getByRole("button", {name: "Add progress entry"}),
        );
        await user.click(
            screen.getByRole("button", {name: "Complete mocked save"}),
        );

        expect(screen.getByRole("status", {
            name: "Loading saved progress entry",
        })).toBeInTheDocument();

        rerender(
            <ProgressStructure
                profile={profile}
                entries={[
                    {
                        id: "entry-3",
                        recordedOn: "2026-11-11",
                        weight: null,
                        photos: [],
                    },
                    ...entries,
                ]}
            />,
        );

        expect(screen.getByText("Progress gallery")).toBeInTheDocument();
        expect(screen.queryByRole("status", {
            name: "Loading saved progress entry",
        })).not.toBeInTheDocument();
    });
});
