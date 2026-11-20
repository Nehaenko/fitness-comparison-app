import {describe, expect, it} from "vitest";

import {
    getCustomExerciseValues,
    getRoutineValues,
    getRoutineWorkoutsData,
    validateRoutineId,
} from "@/validation/routines";

describe("custom exercise validation", () => {
    it("normalises strength exercise details", () => {
        expect(getCustomExerciseValues({
            name: "  Cable Glute Kickback  ",
            type: "strength",
            muscleGroup: "  Glutes ",
            equipment: " Cable ",
        })).toEqual({
            name: "Cable Glute Kickback",
            muscleGroup: "Glutes",
            equipment: "Cable",
        });
    });

    it("uses the cardio group for cardio exercises", () => {
        expect(getCustomExerciseValues({
            name: "Incline Walk",
            type: "cardio",
            muscleGroup: "",
            equipment: "Treadmill",
        })).toEqual({
            name: "Incline Walk",
            muscleGroup: "cardio",
            equipment: "Treadmill",
        });
    });

    it("requires a muscle group for strength exercises", () => {
        expect(() => getCustomExerciseValues({
            name: "Custom Lift",
            type: "strength",
            muscleGroup: "",
            equipment: "",
        })).toThrow("Muscle group is required");
    });
});

const workoutId = "11111111-1111-4111-8111-111111111111";
const configuredExerciseId = "22222222-2222-4222-8222-222222222222";
const exerciseId = "33333333-3333-4333-8333-333333333333";

function createRoutineFormData(workouts: unknown) {
    const formData = new FormData();
    formData.set("name", "Strength Routine");
    formData.set("description", "Three days per week");
    formData.set("workouts", JSON.stringify(workouts));

    return formData;
}

function createWorkout(overrides: Record<string, unknown> = {}) {
    return {
        id: workoutId,
        name: "Upper Body",
        exercises: [
            {
                id: configuredExerciseId,
                exerciseId,
                sets: 3,
                targetReps: 10,
                targetWeight: 220.46,
                restSeconds: 90,
            },
        ],
        ...overrides,
    };
}

describe("routine details validation", () => {
    it("accepts valid routine details", () => {
        const values = getRoutineValues(createRoutineFormData([]));

        expect(values).toEqual({
            name: "Strength Routine",
            description: "Three days per week",
        });
    });

    it("rejects an empty routine name", () => {
        const formData = createRoutineFormData([]);
        formData.set("name", "   ");

        expect(() => getRoutineValues(formData)).toThrow(
            "Routine name is required",
        );
    });

    it("rejects an invalid routine id", () => {
        expect(() => validateRoutineId("not-a-uuid")).toThrow(
            "Invalid routine",
        );
    });
});

describe("routine workouts validation", () => {
    it("normalises positions and converts pounds to kilograms", () => {
        const workouts = getRoutineWorkoutsData(
            createRoutineFormData([createWorkout()]),
            "lb",
        );

        expect(workouts).toEqual([
            {
                id: workoutId,
                name: "Upper Body",
                position: 0,
                exercises: [
                    {
                        id: configuredExerciseId,
                        exerciseId,
                        sets: 3,
                        targetReps: 10,
                        targetWeight: 100,
                        restSeconds: 90,
                        position: 0,
                    },
                ],
            },
        ]);
    });

    it("rejects duplicate workout ids", () => {
        const formData = createRoutineFormData([
            createWorkout(),
            createWorkout(),
        ]);

        expect(() => getRoutineWorkoutsData(formData, "kg")).toThrow(
            "Duplicate builder IDs are not allowed",
        );
    });

    it("rejects invalid exercise values", () => {
        const workout = createWorkout({
            exercises: [
                {
                    id: configuredExerciseId,
                    exerciseId,
                    sets: 0,
                    targetReps: 10,
                    targetWeight: null,
                    restSeconds: 90,
                },
            ],
        });

        expect(() =>
            getRoutineWorkoutsData(
                createRoutineFormData([workout]),
                "kg",
            ),
        ).toThrow("Invalid workout data");
    });

    it("rejects more than ten workouts", () => {
        const workouts = Array.from({length: 11}, (_, index) =>
            createWorkout({
                id: `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`,
                exercises: [],
            }),
        );

        expect(() =>
            getRoutineWorkoutsData(
                createRoutineFormData(workouts),
                "kg",
            ),
        ).toThrow("Invalid workout data");
    });
});
