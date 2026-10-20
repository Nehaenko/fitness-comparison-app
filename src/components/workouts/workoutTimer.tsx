import {useEffect, useState} from "react";
import {getElapsedSeconds} from "@/helpers/workout-session";

type WorkoutTimerProps = {
    startedAt: number;
}

export default function WorkoutTimer({startedAt}: WorkoutTimerProps) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const updateTimer = () => {
            setSeconds(getElapsedSeconds(startedAt));
        }

        updateTimer();

        const interval = setInterval(
            updateTimer,
            1_000
        );

        return () => {
            window.clearInterval(interval);
        }
    }, [startedAt]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        <p
            className="font-mono text-sm font-semibold tabular-nums text-secondary"
            aria-label={`${minutes} minutes ${remainingSeconds} seconds elapsed`}
        >
            {String(minutes).padStart(2, "0")}:
            {String(remainingSeconds).padStart(2, "0")}
        </p>
    );
}
