import {
    cleanup,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

const mocks = vi.hoisted(() => ({
    deleteMeasurementAction: vi.fn(),
    saveMeasurementAction: vi.fn(),
}));

vi.mock("@/app/(protected)/measurements/actions", () => ({
    deleteMeasurementAction:
        mocks.deleteMeasurementAction,
    saveMeasurementAction:
        mocks.saveMeasurementAction,
}));

import MeasurementsStructure from "@/components/measurements/measurementsStructure";
import type {MeasurementRecord} from "@/types/measurements";

const measurements: MeasurementRecord[] = [
    {
        id: "measurement-1",
        measuredOn: "2026-11-04",
        weight: 80,
        waist: null,
        chest: null,
        hips: null,
        thigh: null,
        arm: null,
    },
    {
        id: "measurement-2",
        measuredOn: "2026-11-03",
        weight: 81,
        waist: null,
        chest: 100,
        hips: null,
        thigh: null,
        arm: null,
    },
    {
        id: "measurement-3",
        measuredOn: "2026-11-02",
        weight: 82,
        waist: null,
        chest: 99,
        hips: null,
        thigh: null,
        arm: null,
    },
    {
        id: "measurement-4",
        measuredOn: "2026-11-01",
        weight: null,
        waist: null,
        chest: 98,
        hips: null,
        thigh: null,
        arm: null,
    },
];

function renderMeasurements() {
    return render(
        <MeasurementsStructure
            profile={{
                weightUnit: "kg",
                measurementUnit: "cm",
            }}
            measurements={measurements}
        />,
    );
}

describe("MeasurementsStructure", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.deleteMeasurementAction.mockResolvedValue({
            id: "measurement-1",
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("shows the dedicated empty state before any entries are logged", () => {
        render(
            <MeasurementsStructure
                profile={{
                    weightUnit: "kg",
                    measurementUnit: "cm",
                }}
                measurements={[]}
            />,
        );

        expect(
            screen.getByRole("heading", {
                name: "No measurements yet",
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("heading", {
                name: /Latest/,
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("navigation", {
                name: "Measurement history category",
            }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: "Log measurements",
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("dialog", {
                name: "Log measurements",
            }),
        ).not.toBeInTheDocument();
    });

    it("uses one record for the latest date and values", () => {
        renderMeasurements();

        expect(
            screen.getByRole("heading", {
                name: "Latest — 4 Nov 2026",
            }),
        ).toBeInTheDocument();

        const chestCard = screen
            .getByRole("heading", {name: "Chest"})
            .closest("article");

        expect(chestCard).not.toBeNull();
        expect(
            within(chestCard as HTMLElement).getByText("—"),
        ).toBeInTheDocument();
    });

    it("changes the history when a measurement tab is selected", async () => {
        const user = userEvent.setup();
        renderMeasurements();

        await user.click(
            screen.getByRole("button", {name: "Chest"}),
        );

        expect(
            screen.getByRole("heading", {name: "chest history"}),
        ).toBeInTheDocument();
        expect(screen.getByText("1 Nov 2026")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: "Remove measurement from 4 Nov 2026",
            }),
        ).not.toBeInTheDocument();
    });

    it("confirms and submits deletion for the selected record", async () => {
        const user = userEvent.setup();
        vi.spyOn(window, "confirm").mockReturnValue(true);
        renderMeasurements();

        await user.click(
            screen.getByRole("button", {
                name: "Remove measurement from 4 Nov 2026",
            }),
        );

        await waitFor(() => {
            expect(
                mocks.deleteMeasurementAction,
            ).toHaveBeenCalledWith("measurement-1");
        });
    });
});
