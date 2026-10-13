import {useEffect, useState} from "react";

export default function WorkoutTimer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((current) => current + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
