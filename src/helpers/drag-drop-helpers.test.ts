import {describe, expect, it} from "vitest";

import {moveExercise, moveWorkout} from "@/helpers/drag-drop-helpers";
import type {ConfiguredExercise, Workout} from "@/types/routine-builder";

const exercises: ConfiguredExercise[] = [
    {
        id: "configured-1",
        exerciseId: "exercise-1",
        name: "Bench Press",
        muscleGroup: "chest",
        equipment: "barbell",
        sets: 3,
        targetReps: 10,
        targetWeight: null,
        restSeconds: 90,
    },
    {
        id: "configured-2",
        exerciseId: "exercise-2",
        name: "Barbell Row",
        muscleGroup: "middle back",
        equipment: "barbell",
        sets: 3,
        targetReps: 10,
        targetWeight: null,
        restSeconds: 90,
    },
];

const workouts: Workout[] = [
    {id: "workout-1", name: "Upper", exercises: []},
    {id: "workout-2", name: "Lower", exercises: []},
    {id: "workout-3", name: "Full Body", exercises: []},
];

describe("moveWorkout", () => {
    it("moves a workout without mutating the original array", () => {
        const reordered = moveWorkout(workouts, 0, 2);

        expect(reordered.map((workout) => workout.id)).toEqual([
            "workout-2",
            "workout-3",
            "workout-1",
        ]);
        expect(workouts.map((workout) => workout.id)).toEqual([
            "workout-1",
            "workout-2",
            "workout-3",
        ]);
    });

    it("returns the original array when the source index is invalid", () => {
        expect(moveWorkout(workouts, 10, 0)).toBe(workouts);
    });
});

describe("moveExercise", () => {
    it("reorders configured exercises", () => {
        const reordered = moveExercise(exercises, 1, 0);

        expect(reordered.map((exercise) => exercise.id)).toEqual([
            "configured-2",
            "configured-1",
        ]);
        expect(exercises[0]?.id).toBe("configured-1");
    });
});
