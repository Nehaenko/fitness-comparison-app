"use client"

import {Workout} from "@/types/routine-builder";

type InteractiveWorkoutProps = {
    workout: Workout;
}

export default function InteractiveWorkout({workout}: InteractiveWorkoutProps) {
    return (
        <>
            <p>{workout.name}</p>
            <div className="flex">
                <button type="button">Close X</button>
                <button type="button">Finish</button>
            </div>
            <div>
                {workout.exercises.map((exercise) => (
                    <button className="m-2"
                        type="button" key={exercise.id}>
                        {exercise.name}
                    </button>
                ))}
            </div>
        </>
    )
}