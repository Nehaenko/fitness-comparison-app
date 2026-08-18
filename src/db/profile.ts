import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";

export type UserProfile = typeof profiles.$inferSelect;
export type WeightUnit = UserProfile["weightUnit"];
export type MeasurementUnit = UserProfile["measurementUnit"];

const defaultDisplayName = "Forma user";

export async function getProfileByUserId(userId: string) {
    const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

    return profile ?? null;
}

export async function createDefaultProfile(
    userId: string,
    displayName?: string | null,
) {
    const safeDisplayName = displayName?.trim() || defaultDisplayName;
    const [createdProfile] = await db
        .insert(profiles)
        .values({
            userId,
            displayName: safeDisplayName,
        })
        .onConflictDoNothing({ target: profiles.userId })
        .returning();

    if (createdProfile) return createdProfile;

    const existingProfile = await getProfileByUserId(userId);

    if (!existingProfile) {
        throw new Error("Unable to create user profile");
    }

    return existingProfile;
}

export async function updateProfileByUserId(
    userId: string,
    values: {
        displayName?: string;
        weightUnit?: WeightUnit;
        measurementUnit?: MeasurementUnit;
    },
) {
    const [profile] = await db
        .update(profiles)
        .set({
            ...values,
            updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId))
        .returning();

    return profile ?? null;
}
