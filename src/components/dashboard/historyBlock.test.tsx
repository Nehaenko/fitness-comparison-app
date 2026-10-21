import {cleanup, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import HistoryBlock from "@/components/dashboard/historyBlock";
import type {WorkoutHistorySummary} from "@/types/history";

const records: WorkoutHistorySummary[] = [
    {
        id: "session-1",
        workoutName: "Upper Body",
        completedAt: new Date("2026-10-21T10:00:00Z"),
        durationSeconds: 3599,
        exerciseCount: 1,
    },
    {
        id: "session-2",
        workoutName: "Lower Body",
        completedAt: new Date("2026-10-19T10:00:00Z"),
        durationSeconds: 3900,
        exerciseCount: 4,
    },
];

describe("HistoryBlock", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-21T12:00:00Z"));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    it("renders workout metadata and links to each history record", () => {
        render(<HistoryBlock records={records}/>);

        expect(
            screen.getByRole("link", {name: /Upper Body/i}),
        ).toHaveAttribute("href", "/history/session-1");
        expect(
            screen.getByRole("link", {name: /Lower Body/i}),
        ).toHaveAttribute("href", "/history/session-2");
        expect(screen.getByText(/59 min · 1 exercise/)).toBeInTheDocument();
        expect(screen.getByText(/65 min · 4 exercises/)).toBeInTheDocument();
    });

    it("shows relative completion dates", () => {
        render(<HistoryBlock records={records}/>);

        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getByText("2d ago")).toBeInTheDocument();
    });
});
