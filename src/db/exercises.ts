import "server-only";

import {asc} from "drizzle-orm";

import {db} from "@/db";
import {exercises} from "@/db/schema";

export async function getExercises() {
    return db
        .select({
            id: exercises.id,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            equipment: exercises.equipment,
        })
        .from(exercises)
        .orderBy(asc(exercises.name));
}
