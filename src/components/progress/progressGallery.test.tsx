import {cleanup, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    deleteProgressAction: vi.fn(),
    refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({refresh: mocks.refresh}),
}));

vi.mock("@/app/(protected)/progress/actions", () => ({
    deleteProgressAction: mocks.deleteProgressAction,
}));

vi.mock("@/components/progress/progressPhotoImage", () => ({
    default: ({alt}: {alt: string}) => <div role="img" aria-label={alt}/>,
}));

import ProgressGallery from "@/components/progress/progressGallery";
import type {ProgressEntryRecord} from "@/types/progress";

const entry: ProgressEntryRecord = {
    id: "11111111-1111-4111-8111-111111111111",
    recordedOn: "2026-11-09",
    measurement: null,
    photos: [
        {
            id: "photo-1",
            view: "front",
            imageUrl: "/api/progress-photos/photo-1",
        },
    ],
};

const photoViews = [
    {view: "front" as const, label: "Front"},
    {view: "side" as const, label: "Side"},
    {view: "back" as const, label: "Back"},
];

describe("ProgressGallery", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.deleteProgressAction.mockResolvedValue({id: entry.id});
    });

    afterEach(cleanup);

    it("shows a confirmation before deleting an entry", async () => {
        const user = userEvent.setup();
        render(
            <ProgressGallery
                entries={[entry]}
                photoViews={photoViews}
            />,
        );

        await user.click(
            screen.getByRole("button", {
                name: "Remove progress entry from 9 November 2026",
            }),
        );

        expect(
            screen.getByRole("button", {
                name: "Delete progress entry from 9 November 2026",
            }),
        ).toBeInTheDocument();
        expect(mocks.deleteProgressAction).not.toHaveBeenCalled();
    });

    it("deletes the confirmed entry and refreshes server data", async () => {
        const user = userEvent.setup();
        render(
            <ProgressGallery
                entries={[entry]}
                photoViews={photoViews}
            />,
        );

        await user.click(
            screen.getByRole("button", {
                name: "Remove progress entry from 9 November 2026",
            }),
        );
        await user.click(
            screen.getByRole("button", {
                name: "Delete progress entry from 9 November 2026",
            }),
        );

        await waitFor(() => {
            expect(mocks.deleteProgressAction).toHaveBeenCalledWith(
                entry.id,
            );
        });
        expect(mocks.refresh).toHaveBeenCalled();
    });
});
