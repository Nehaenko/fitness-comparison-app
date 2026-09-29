import {Exercise} from "@/db/schema";

type ExercisesFormData = {
    exercises: Exercise[];
    handleExerciseModalVisibility: () => void;
}
export default function ExercisesForm({exercises, handleExerciseModalVisibility}: ExercisesFormData) {
    return (
        <>
            <div>
                <button type="button" onClick={handleExerciseModalVisibility}>close</button>
                {exercises.slice(0, 10).map((exercise: Exercise) => (
                    <p key={exercise.id}>{exercise.name}</p>
                ))}
            </div>
        </>
    )
}