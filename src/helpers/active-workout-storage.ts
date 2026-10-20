import type {PersistedActiveWorkout} from "@/types/workout-session";

const ACTIVE_WORKOUT_STORAGE_KEY = "forma:active-workout:v1";

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isPersistedActiveWorkout(
    value: unknown,
): value is PersistedActiveWorkout {
    if (
        !isRecord(value) ||
        value.version !== 1 ||
        !isRecord(value.workout) ||
        typeof value.workout.id !== "string" ||
        typeof value.workout.name !== "string" ||
        !Array.isArray(value.workout.exercises) ||
        !isRecord(value.session) ||
        typeof value.session.id !== "string" ||
        typeof value.session.workoutTemplateId !== "string" ||
        typeof value.session.startedAt !== "number" ||
        !Number.isFinite(value.session.startedAt) ||
        !Array.isArray(value.session.exercises) ||
        (
            value.selectedExerciseId !== null &&
            typeof value.selectedExerciseId !== "string"
        ) ||
        (
            value.restEndsAt !== null &&
            (
                typeof value.restEndsAt !== "number" ||
                !Number.isFinite(value.restEndsAt)
            )
        ) ||
        typeof value.updatedAt !== "number" ||
        !Number.isFinite(value.updatedAt)
    ) {
        return false;
    }

    return true;
}

export function loadActiveWorkout():
    PersistedActiveWorkout | null {
    if (typeof window === "undefined") {
        return null;
    }

    const storedValue = window.localStorage.getItem(
        ACTIVE_WORKOUT_STORAGE_KEY,
    );

    if (!storedValue) {
        return null;
    }

    try {
        const parsedValue: unknown = JSON.parse(storedValue);

        if (!isPersistedActiveWorkout(parsedValue)) {
            window.localStorage.removeItem(
                ACTIVE_WORKOUT_STORAGE_KEY,
            );

            return null;
        }

        return parsedValue;
    } catch {
        window.localStorage.removeItem(
            ACTIVE_WORKOUT_STORAGE_KEY,
        );

        return null;
    }
}

export function saveActiveWorkout(
    activeWorkout: PersistedActiveWorkout,
) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            ACTIVE_WORKOUT_STORAGE_KEY,
            JSON.stringify(activeWorkout),
        );
    } catch {
        // The workout remains usable in memory if storage is unavailable.
    }
}

export function removeActiveWorkout() {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.removeItem(
            ACTIVE_WORKOUT_STORAGE_KEY,
        );
    } catch {
        // Nothing else is required if browser storage is unavailable.
    }
}