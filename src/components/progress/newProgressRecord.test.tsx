import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {createElement, type ComponentProps} from "react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    createObjectURL: vi.fn(),
    onSaved: vi.fn(),
    refresh: vi.fn(),
    revokeObjectURL: vi.fn(),
    optimizeProgressPhoto: vi.fn(),
    saveProgressEntryAction: vi.fn(),
    uploadPresigned: vi.fn(),
}));

vi.mock("next/image", () => ({
    default: (props: ComponentProps<"img"> & {
        fill?: boolean;
        unoptimized?: boolean;
    }) => {
        const imageProps = {...props};
        delete imageProps.fill;
        delete imageProps.unoptimized;

        return createElement("img", imageProps);
    },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({refresh: mocks.refresh}),
}));

vi.mock("@vercel/blob/client", () => ({
    uploadPresigned: mocks.uploadPresigned,
}));

vi.mock("@/app/(protected)/progress/actions", () => ({
    saveProgressEntryAction:
        mocks.saveProgressEntryAction,
}));

vi.mock("@/helpers/progress-photo-optimization", () => ({
    optimizeProgressPhoto: mocks.optimizeProgressPhoto,
}));

import NewProgressRecord from "@/components/progress/newProgressRecord";

const photoViews = [
    {view: "front" as const, label: "Front"},
    {view: "side" as const, label: "Side"},
    {view: "back" as const, label: "Back"},
];

function renderForm(existingDates: string[] = []) {
    return render(
        <NewProgressRecord
            userId="user-1"
            onSaved={mocks.onSaved}
            photoViews={photoViews}
            existingDates={existingDates}
        />,
    );
}

describe("NewProgressRecord", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.createObjectURL.mockReturnValue("blob:preview");
        mocks.optimizeProgressPhoto.mockImplementation(
            async (file: File) => file,
        );
        mocks.uploadPresigned.mockResolvedValue({
            pathname: "progress-photos/user-1/front.jpg",
        });
        mocks.saveProgressEntryAction.mockResolvedValue({
            id: "progress-1",
            recordedOn: "2026-11-09",
        });

        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            value: mocks.createObjectURL,
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            value: mocks.revokeObjectURL,
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("stops before upload when an entry already exists for the date", async () => {
        const user = userEvent.setup();
        const {container} = renderForm(["2026-11-09"]);
        const dateInput = screen.getByLabelText("Date");
        const frontInput = container.querySelector(
            'input[name="front"]',
        ) as HTMLInputElement;

        fireEvent.change(dateInput, {
            target: {value: "2026-11-09"},
        });
        await user.upload(
            frontInput,
            new File(["front"], "front.jpg", {
                type: "image/jpeg",
            }),
        );

        expect(screen.getByRole("status", {name: "Loading photo"}))
            .toBeInTheDocument();
        expect(screen.queryByLabelText(/Weight/)).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", {name: "Save entry"}),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "A progress entry already exists for this date",
        );
        expect(mocks.uploadPresigned).not.toHaveBeenCalled();
        expect(mocks.saveProgressEntryAction).not.toHaveBeenCalled();
    });

    it("uploads selected photos, saves their storage keys, and returns to the gallery", async () => {
        const user = userEvent.setup();
        const {container} = renderForm();
        const dateInput = screen.getByLabelText("Date");
        const frontInput = container.querySelector(
            'input[name="front"]',
        ) as HTMLInputElement;

        fireEvent.change(dateInput, {
            target: {value: "2026-11-09"},
        });
        await user.upload(
            frontInput,
            new File(["front"], "front.jpg", {
                type: "image/jpeg",
            }),
        );
        await user.click(
            screen.getByRole("button", {name: "Save entry"}),
        );

        await waitFor(() => {
            expect(
                mocks.saveProgressEntryAction,
            ).toHaveBeenCalledWith({
                recordedOn: "2026-11-09",
                weight: "",
                photos: [
                    {
                        view: "front",
                        storageKey:
                            "progress-photos/user-1/front.jpg",
                    },
                ],
            });
        });

        expect(mocks.uploadPresigned).toHaveBeenCalledWith(
            expect.stringMatching(
                /^progress-photos\/user-1\/.+-front$/,
            ),
            expect.any(File),
            {
                access: "private",
                handleUploadUrl: "/api/progress-photos/upload",
            },
        );
        expect(mocks.optimizeProgressPhoto).toHaveBeenCalledOnce();
        expect(mocks.refresh).toHaveBeenCalled();
        expect(mocks.onSaved).toHaveBeenCalledWith("2026-11-09");
        expect(mocks.revokeObjectURL).toHaveBeenCalledWith(
            "blob:preview",
        );
    });
});
