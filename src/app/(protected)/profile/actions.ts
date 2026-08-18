"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import {
    createDefaultProfile,
    updateProfileByUserId,
} from "@/db/profile";

export async function updateUserName(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const value = formData.get("account-name");

    if (typeof value !== "string") {
        throw new Error("Invalid name");
    }

    const name = value.trim();

    if (name.length < 2 || name.length > 50) {
        throw new Error("Name must contain between 2 and 50 characters");
    }

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

    if (values.weightUnit !== "kg" && values.weightUnit !== "lb") {
        throw new Error("Invalid weight unit");
    }

    if (
        values.measurementUnit !== "cm" &&
        values.measurementUnit !== "in"
    ) {
        throw new Error("Invalid measurement unit");
    }

    await createDefaultProfile(session.user.id, session.user.name);
    await updateProfileByUserId(session.user.id, {
        weightUnit: values.weightUnit,
        measurementUnit: values.measurementUnit,
    });

    revalidatePath("/profile");
}
