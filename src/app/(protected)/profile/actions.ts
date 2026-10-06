"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
    createDefaultProfile,
    updateProfileByUserId,
} from "@/db/profile";
import {
    getDisplayName,
    getUnitPreferences,
} from "@/validation/profile";

export async function updateUserName(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const name = getDisplayName(formData);

    await createDefaultProfile(session.user.id, session.user.name);
    await updateProfileByUserId(session.user.id, { displayName: name });

    revalidatePath("/profile");
    revalidatePath("/", "layout");
}

export async function updateUnitPreferences(values: {
    weightUnit: string;
    measurementUnit: string;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const preferences = getUnitPreferences(values);

    await createDefaultProfile(session.user.id, session.user.name);
    await updateProfileByUserId(session.user.id, {
        ...preferences,
    });

    revalidatePath("/profile");
}
