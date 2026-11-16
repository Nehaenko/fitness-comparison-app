import {describe, expect, it} from "vitest";

import {
    getPointerCenter,
    moveExercise,
    moveWorkout,
} from "@/helpers/drag-drop-helpers";
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

describe("getPointerCenter", () => {
    it("tracks horizontal and vertical movement during a two-finger gesture", () => {
        const initialCenter = getPointerCenter(
            {x: 20, y: 40},
            {x: 80, y: 100},
        );
        const movedCenter = getPointerCenter(
            {x: 35, y: 30},
            {x: 95, y: 90},
        );

        expect(initialCenter).toEqual({x: 50, y: 70});
        expect({
            x: movedCenter.x - initialCenter.x,
            y: movedCenter.y - initialCenter.y,
        }).toEqual({x: 15, y: -10});
    });
});
