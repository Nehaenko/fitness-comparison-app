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

const customExercises = [
    {
        externalId: "forma:running",
        name: "Running",
        muscleGroup: "cardiovascular system",
        equipment: "body only",
    },
    {
        externalId: "forma:step-machine",
        name: "Step Machine",
        muscleGroup: "cardiovascular system",
        equipment: "machine",
    },
    {
        externalId: "forma:rowing-machine",
        name: "Rowing Machine",
        muscleGroup: "cardiovascular system",
        equipment: "machine",
    },
    {
        externalId: "forma:negative-pull-up",
        name: "Negative Pull-Up",
        muscleGroup: "lats",
        equipment: "body only",
    },
    {
        externalId: "forma:hollow-rock",
        name: "Hollow Rock",
        muscleGroup: "abdominals",
        equipment: "body only",
    },
];

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
        }))
        .concat(customExercises);

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
