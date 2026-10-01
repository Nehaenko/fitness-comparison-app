export default function formatExerciseDetail(value: string | null) {
    if (!value) {
        return "Other";
    }

    if (value === "body only") {
        return "Bodyweight";
    }

    return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}