import { db } from "@/db";
import { exercises } from "@/db/schema";

type FreeExercise = {
    id: string;
    name: string;
    equipment: string | null;
    primaryMuscles: string[];
    category: string;
};

const DATASET_URL =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const allowedCategories = new Set([
    "strength",
    "powerlifting",
    "olympic weightlifting",
]);

const allowedEquipment = new Set([
    "barbell",
    "dumbbell",
    "body only",
    "cable",
    "machine",
    "kettlebells",
    "bands",
    "e-z curl bar",
]);

async function importExercises() {
    const response = await fetch(DATASET_URL);

    if (!response.ok) {
        throw new Error(
            `Unable to download exercises: ${response.status}`,
        );
    }

    const sourceExercises =
        (await response.json()) as FreeExercise[];

    const exerciseRows = sourceExercises
        .filter((exercise) =>
            allowedCategories.has(exercise.category),
        )
        .filter(
            (exercise) =>
                exercise.equipment === null ||
                allowedEquipment.has(exercise.equipment),
        )
        .map((exercise) => ({
            externalId: `free-exercise-db:${exercise.id}`,
            name: exercise.name,
            muscleGroup: exercise.primaryMuscles[0] ?? null,
            equipment: exercise.equipment,
        }));

    const batchSize = 200;

    for (
        let index = 0;
        index < exerciseRows.length;
        index += batchSize
    ) {
        const batch = exerciseRows.slice(
            index,
            index + batchSize,
        );

        await db
            .insert(exercises)
            .values(batch)
            .onConflictDoNothing({
                target: exercises.externalId,
            });
    }

    console.log(`Imported ${exerciseRows.length} exercises`);
}

importExercises().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
