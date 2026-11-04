import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";

import MeasurementBlock from "@/components/dashboard/measurementBlock";
import type {MeasurementRecord} from "@/types/measurements";

function createMeasurement(
    id: string,
    measuredOn: string,
    overrides: Partial<MeasurementRecord> = {},
): MeasurementRecord {
    return {
        id,
        measuredOn,
        weight: 100,
        waist: 25.4,
        chest: 101.6,
        hips: 50.8,
        thigh: null,
        arm: null,
        ...overrides,
    };
}

const records = [
    createMeasurement("measurement-1", "2026-11-04"),
    createMeasurement("measurement-2", "2026-11-03"),
    createMeasurement("measurement-3", "2026-11-02"),
];

describe("MeasurementBlock", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders the recent entries supplied by the dashboard query", () => {
        render(
            <MeasurementBlock
                records={records}
                profile={{
                    weightUnit: "kg",
                    measurementUnit: "cm",
                }}
            />,
        );

        expect(screen.getByText(/Logged 4 Nov 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Logged 3 Nov 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Logged 2 Nov 2026/)).toBeInTheDocument();
    });

    it("converts stored values into the profile units", () => {
        render(
            <MeasurementBlock
                records={[records[0]]}
                profile={{
                    weightUnit: "lb",
                    measurementUnit: "in",
                }}
            />,
        );

        expect(screen.getByText("220.46")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("40")).toBeInTheDocument();
        expect(screen.getByText("lb")).toBeInTheDocument();
        expect(screen.getAllByText("in")).toHaveLength(3);
    });
});
