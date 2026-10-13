import {useEffect, useState} from "react";

import Icon from "@/components/layout/actionComponents/iconComponent";

type RestTimerProps = {
    endsAt: number;
    onComplete: () => void;
    onSkip: () => void;
};

function getRemainingSeconds(endsAt: number) {
    return Math.max(
        0,
        Math.ceil((endsAt - Date.now()) / 1000),
    );
}

export default function RestTimer({
    endsAt,
    onComplete,
    onSkip,
}: RestTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        getRemainingSeconds(endsAt),
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const nextRemainingSeconds = getRemainingSeconds(endsAt);

            setRemainingSeconds(nextRemainingSeconds);

            if (nextRemainingSeconds === 0) {
                clearInterval(interval);
                onComplete();
            }
        }, 250);

        return () => clearInterval(interval);
    }, [endsAt, onComplete]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return (
        <aside
            className="fixed bottom-0 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 border-t border-divider bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-floating"
            aria-live="polite"
            aria-label="Rest timer"
        >
            <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
                    <Icon name="timer" className="size-5" />
                </div>

                <div>
                    <p className="text-xs font-semibold text-secondary">
                        Rest timer
                    </p>
                    <p className="font-mono text-heading font-semibold tabular-nums text-primary">
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onSkip}
                    className="ml-auto h-11 rounded-control px-4 text-sm font-semibold text-secondary transition hover:bg-surface-subtle hover:text-primary"
                >
                    Skip
                </button>
            </div>
        </aside>
    );
}
