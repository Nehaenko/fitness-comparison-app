export default function formatExerciseDetail(value: string | null) {
    if (!value) {
        return "Other";
    }

    if (value === "body only") {
        return "Bodyweight";
    }

    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isCardioExercise(muscleGroup: string | null) {
    const normalizedMuscleGroup = muscleGroup?.toLowerCase() ?? "";

    return normalizedMuscleGroup === "cardio" ||
        normalizedMuscleGroup === "cardiovascular system";
}
