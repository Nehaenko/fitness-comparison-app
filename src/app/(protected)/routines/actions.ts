"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
    activateRoutineForUser,
    createRoutineForUser,
    deleteRoutineForUser,
    updateRoutineForUser,
} from "@/db/routines";

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

function validateRoutineId(routineId: string) {
    if (!uuidPattern.test(routineId)) {
        throw new Error("Invalid routine");
    }
}

function getRoutineValues(formData: FormData) {
    const name = formData.get("name");
    const description = formData.get("description");

    if (typeof name !== "string") {
        throw new Error("Routine name is required");
    }

    if (
        description !== null &&
        typeof description !== "string"
    ) {
        throw new Error("Invalid routine description");
    }

    return {
        name,
        description,
    };
}

export async function createRoutineAction(formData: FormData) {
    const userId = await requireAuthenticatedUserId();
    const values = getRoutineValues(formData);

    const routine = await createRoutineForUser(userId, values);

    if (!routine) {
        throw new Error("Unable to create routine");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
    redirect("/routines");
}

export async function updateRoutineAction(
    routineId: string,
    formData: FormData,
) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const values = getRoutineValues(formData);
    const routine = await updateRoutineForUser(
        routineId,
        userId,
        values,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath(`/routines/${routineId}/edit`);
    revalidatePath("/dashboard");

    redirect("/routines");
}

export async function deleteRoutineAction(routineId: string) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const routine = await deleteRoutineForUser(
        routineId,
        userId,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
}

export async function activateRoutineAction(routineId: string) {
    const userId = await requireAuthenticatedUserId();

    validateRoutineId(routineId);

    const routine = await activateRoutineForUser(
        routineId,
        userId,
    );

    if (!routine) {
        throw new Error("Routine not found");
    }

    revalidatePath("/routines");
    revalidatePath("/dashboard");
}
