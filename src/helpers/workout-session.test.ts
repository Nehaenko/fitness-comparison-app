import {describe, expect, it} from "vitest";

import {replaceExerciseForSession} from "@/helpers/workout-session";
import type {Workout} from "@/types/routine-builder";
import type {WorkoutSessionDraft} from "@/types/workout-session";

const workout: Workout = {
    id: "workout-1",
    name: "Upper",
    exercises: [
        {
            id: "template-exercise-1",
            exerciseId: "cable-pushdown",
            name: "Cable Tricep Pushdown",
            muscleGroup: "triceps",
            equipment: "cable",
            sets: 3,
            targetReps: 10,
            targetWeight: 20,
            restSeconds: 90,
        },
    ],
};

const session: WorkoutSessionDraft = {
    id: "session-1",
    workoutTemplateId: "workout-1",
    startedAt: 1,
    exercises: [
        {
            workoutTemplateExerciseId: "template-exercise-1",
            exerciseId: "cable-pushdown",
            sets: [
                {
                    id: "set-1",
                    reps: 10,
                    weight: 20,
                    completed: false,
                },
                {
                    id: "set-2",
                    reps: null,
                    weight: null,
                    completed: false,
                },
                {
                    id: "set-3",
                    reps: null,
                    weight: null,
                    completed: false,
                },
            ],
        },
    ],
};

describe("replaceExerciseForSession", () => {
    it("changes only the active workout and resets incompatible set values", () => {
        const result = replaceExerciseForSession({
            workout,
            session,
            workoutTemplateExerciseId: "template-exercise-1",
            replacement: {
                id: "dumbbell-pushdown",
                name: "Dumbbell Tricep Pushdown",
                muscleGroup: "triceps",
                equipment: "dumbbell",
            },
        });

        expect(result.replacementExercise).toMatchObject({
            id: "template-exercise-1",
            exerciseId: "dumbbell-pushdown",
            name: "Dumbbell Tricep Pushdown",
            targetWeight: null,
        });
        expect(result.session.exercises[0]).toMatchObject({
            workoutTemplateExerciseId: "template-exercise-1",
            exerciseId: "dumbbell-pushdown",
        });
        expect(result.session.exercises[0].sets).toHaveLength(3);
        expect(result.session.exercises[0].sets[0]).toMatchObject({
            reps: 10,
            weight: null,
            completed: false,
        });

        expect(workout.exercises[0].exerciseId).toBe("cable-pushdown");
        expect(session.exercises[0].exerciseId).toBe("cable-pushdown");
    });

    it("refuses to relabel an exercise after a set was completed", () => {
        expect(() => replaceExerciseForSession({
            workout,
            session: {
                ...session,
                exercises: [{
                    ...session.exercises[0],
                    sets: [{...session.exercises[0].sets[0], completed: true}],
                }],
            },
            workoutTemplateExerciseId: "template-exercise-1",
            replacement: {
                id: "dumbbell-pushdown",
                name: "Dumbbell Tricep Pushdown",
                muscleGroup: "triceps",
                equipment: "dumbbell",
            },
        })).toThrow("A completed exercise cannot be replaced");
    });
});
