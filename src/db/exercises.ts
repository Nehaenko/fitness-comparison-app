import "server-only";

import {asc} from "drizzle-orm";

import {db} from "@/db";
import {exercises} from "@/db/schema";


// getExercises()
// searchExercises(searchText)
// getExerciseById(exerciseId)

// type Exercise = {
//     externalId: string;
//     name: string;
//     muscleGroup: string;
//     equipment: string;
// }

export async function getExercises() {
    return db
        .select()
        .from(exercises)
        .orderBy(asc(exercises.name));
}