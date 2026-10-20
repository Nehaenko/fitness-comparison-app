import {beforeEach, describe, expect, it} from "vitest";

import {
    loadActiveWorkout,
    removeActiveWorkout,
    saveActiveWorkout,
} from "@/helpers/active-workout-storage";
import type {PersistedActiveWorkout} from "@/types/workout-session";

const storageKey = "forma:active-workout:v1";

const activeWorkout: PersistedActiveWorkout = {
    version: 1,
    workout: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Upper Body",
        exercises: [],
    },
    session: {
        id: "22222222-2222-4222-8222-222222222222",
        workoutTemplateId: "11111111-1111-4111-8111-111111111111",
        startedAt: 1_760_961_600_000,
        exercises: [],
    },
    selectedExerciseId: null,
    restEndsAt: null,
    updatedAt: 1_760_961_610_000,
};

beforeEach(() => {
    window.localStorage.clear();
});

describe("active workout storage", () => {
    it("saves and loads an active workout", () => {
        saveActiveWorkout(activeWorkout);

        expect(loadActiveWorkout()).toEqual(activeWorkout);
    });

    it("removes the active workout", () => {
        saveActiveWorkout(activeWorkout);

        removeActiveWorkout();

        expect(loadActiveWorkout()).toBeNull();
    });

    it("removes invalid JSON instead of throwing", () => {
        window.localStorage.setItem(storageKey, "not-json");

        expect(loadActiveWorkout()).toBeNull();
        expect(window.localStorage.getItem(storageKey)).toBeNull();
    });

    it("removes an unsupported storage version", () => {
        window.localStorage.setItem(
            storageKey,
            JSON.stringify({...activeWorkout, version: 2}),
        );

        expect(loadActiveWorkout()).toBeNull();
        expect(window.localStorage.getItem(storageKey)).toBeNull();
    });
});
