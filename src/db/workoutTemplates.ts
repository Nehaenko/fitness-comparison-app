import "server-only"

import {asc, eq} from "drizzle-orm";

import {db} from "@/db";
import {
    workoutTemplates,
    type WorkoutTemplate,
} from "@/db/schema";
import {getRoutineByIdForUser} from "@/db/routines";

export async function getWorkoutTemplatesByRoutineId(
    routineId: string,
    userId: string
): Promise<WorkoutTemplate[]> {
    const routine = await getRoutineByIdForUser(routineId, userId);

    if (!routine) {
        return [];
    }

    return db
        .select()
        .from(workoutTemplates)
        .where(
            eq(workoutTemplates.routineId, routineId),
        )
        .orderBy(
            asc(workoutTemplates.position),
        );
}