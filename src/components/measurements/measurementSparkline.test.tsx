import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";

import MeasurementSparkline from "@/components/measurements/measurementSparkline";

describe("MeasurementSparkline", () => {
    afterEach(() => {
        cleanup();
    });

    it("does not render before three values are available", () => {
        render(
            <MeasurementSparkline
                values={[80, 79]}
                label="Weight"
            />,
        );

        expect(
            screen.queryByRole("img", {name: "Weight progress"}),
        ).not.toBeInTheDocument();
    });

    it("renders an accessible neutral sparkline for three values", () => {
        const {container} = render(
            <MeasurementSparkline
                values={[80, 79, 78]}
                label="Weight"
            />,
        );

        const chart = screen.getByRole("img", {
            name: "Weight progress",
        });
        const line = container.querySelector("polyline");

        expect(chart).toHaveClass("text-secondary");
        expect(line).toHaveAttribute(
            "points",
            "2,2 50,16 98,30",
        );
    });

    it("centres a flat series without producing invalid coordinates", () => {
        const {container} = render(
            <MeasurementSparkline
                values={[80, 80, 80]}
                label="Weight"
            />,
        );

        expect(
            container.querySelector("polyline"),
        ).toHaveAttribute(
            "points",
            "2,16 50,16 98,16",
        );
    });
});
