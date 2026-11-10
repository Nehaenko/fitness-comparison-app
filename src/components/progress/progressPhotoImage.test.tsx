import {cleanup, fireEvent, render, screen} from "@testing-library/react";
import {createElement, type ComponentProps} from "react";
import {afterEach, describe, expect, it, vi} from "vitest";

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

import ProgressPhotoImage from "@/components/progress/progressPhotoImage";

describe("ProgressPhotoImage", () => {
    afterEach(cleanup);

    it("shows a skeleton until the image loads, then fades the image in", () => {
        render(
            <div className="relative">
                <ProgressPhotoImage
                    src="/api/progress-photos/photo-1"
                    alt="Front progress"
                    sizes="50vw"
                />
            </div>,
        );

        expect(screen.getByRole("status")).toHaveTextContent(
            "Loading photo…",
        );

        const image = screen.getByRole("img", {
            name: "Front progress",
        });
        expect(image).toHaveClass("opacity-0");

        fireEvent.load(image);

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(image).toHaveClass("opacity-100");
    });

    it("replaces the skeleton with an error fallback when loading fails", () => {
        render(
            <ProgressPhotoImage
                src="/api/progress-photos/missing"
                alt="Missing progress"
                sizes="50vw"
            />,
        );

        fireEvent.error(
            screen.getByRole("img", {name: "Missing progress"}),
        );

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Photo could not be loaded",
        );
    });

    it("shows the skeleton again when the requested photo changes", () => {
        const {rerender} = render(
            <ProgressPhotoImage
                src="/api/progress-photos/photo-1"
                alt="First progress photo"
                sizes="50vw"
            />,
        );

        fireEvent.load(
            screen.getByRole("img", {name: "First progress photo"}),
        );
        expect(screen.queryByRole("status")).not.toBeInTheDocument();

        rerender(
            <ProgressPhotoImage
                src="/api/progress-photos/photo-2"
                alt="Second progress photo"
                sizes="50vw"
            />,
        );

        expect(screen.getByRole("status")).toHaveTextContent(
            "Loading photo…",
        );
        expect(
            screen.getByRole("img", {name: "Second progress photo"}),
        ).toHaveClass("opacity-0");
    });
});
