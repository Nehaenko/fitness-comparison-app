import {act, render, screen} from "@testing-library/react";
import {afterEach, describe, expect, it, vi} from "vitest";

import WorkoutTimer from "@/components/workouts/workoutTimer";

afterEach(() => {
    vi.useRealTimers();
});

describe("WorkoutTimer", () => {
    it("renders elapsed time from startedAt and catches up", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:01:05.000Z"));

        const startedAt = new Date("2026-10-20T12:00:00.000Z").getTime();

        render(<WorkoutTimer startedAt={startedAt}/>);

        expect(screen.getByText("01:05")).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(5_000);
        });

        expect(screen.getByText("01:10")).toBeInTheDocument();
    });

    it("displays zero when startedAt is in the future", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T12:00:00.000Z"));

        render(<WorkoutTimer startedAt={Date.now() + 10_000}/>);

        expect(screen.getByText("00:00")).toBeInTheDocument();
    });
});
