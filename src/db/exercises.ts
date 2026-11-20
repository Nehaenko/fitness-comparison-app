import "server-only";

import {and, asc, eq, inArray, isNull, or} from "drizzle-orm";

import {db} from "@/db";
import {exercises} from "@/db/schema";

export type CreateCustomExerciseValues = {
    name: string;
    muscleGroup: string;
    equipment: string | null;
};

export async function getExercisesForUser(userId: string) {
    return db
        .select({
            id: exercises.id,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
        })
        .from(exercises)
        .where(
            or(
                isNull(exercises.userId),
                eq(exercises.userId, userId),
            ),
        )
        .orderBy(asc(exercises.name));
}

export async function createCustomExerciseForUser(
    userId: string,
    values: CreateCustomExerciseValues,
) {
    const [exercise] = await db
        .insert(exercises)
        .values({
            userId,
            name: values.name,
            muscleGroup: values.muscleGroup,
            equipment: values.equipment,
        })
        .returning({
            id: exercises.id,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
        });

    return exercise ?? null;
}

export async function canUserUseExercises(
    userId: string,
    exerciseIds: string[],
) {
    const uniqueExerciseIds = [...new Set(exerciseIds)];

    if (uniqueExerciseIds.length === 0) {
        return true;
    }

    const allowedExercises = await db
        .select({id: exercises.id})
        .from(exercises)
        .where(
            and(
                inArray(exercises.id, uniqueExerciseIds),
                or(
                    isNull(exercises.userId),
                    eq(exercises.userId, userId),
                ),
            ),
        );

    return allowedExercises.length === uniqueExerciseIds.length;
}
