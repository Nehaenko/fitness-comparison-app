import "server-only";

import {db} from "@/db";
import {bodyMeasurements} from "@/db/schema";
import type {NormalizedMeasurementValues, MeasurementRecord} from "@/types/measurements";
import {desc, eq, and} from "drizzle-orm";

function numericValue(value: number | null) {
    return value === null
        ? null
        : value.toString();
}

function parseNumericValue(value:string | null) {
    return value === null ? null : Number(value);
}

export async function upsertMeasurementForUser(
    userId: string,
    values: NormalizedMeasurementValues,
) {
    const insertValues: typeof bodyMeasurements.$inferInsert = {
        userId,
        measuredOn: values.measuredOn,
        weight: numericValue(values.weight),
        waist: numericValue(values.waist),
        chest: numericValue(values.chest),
        hips: numericValue(values.hips),
        thigh: numericValue(values.thigh),
        arm: numericValue(values.arm),
    };

    const updateValues: Partial<
        typeof bodyMeasurements.$inferInsert
    > = {
        updatedAt: new Date(),

        ...(values.weight === null
            ? {}
            : {weight: values.weight.toString()}),

        ...(values.waist === null
            ? {}
            : {waist: values.waist.toString()}),

        ...(values.chest === null
            ? {}
            : {chest: values.chest.toString()}),

        ...(values.hips === null
            ? {}
            : {hips: values.hips.toString()}),

        ...(values.thigh === null
            ? {}
            : {thigh: values.thigh.toString()}),

        ...(values.arm === null
            ? {}
            : {arm: values.arm.toString()}),
    };

    const [savedMeasurement] = await db
        .insert(bodyMeasurements)
        .values(insertValues)
        .onConflictDoUpdate({
            target: [
                bodyMeasurements.userId,
                bodyMeasurements.measuredOn,
            ],
            set: updateValues,
        })
        .returning();

    return savedMeasurement ?? null;
}

export async function getMeasurementsForUser(userId: string): Promise<MeasurementRecord[]> {
    const rows = await db
        .select({
            id: bodyMeasurements.id,
            measuredOn: bodyMeasurements.measuredOn,
            weight: bodyMeasurements.weight,
            waist: bodyMeasurements.waist,
            chest: bodyMeasurements.chest,
            hips: bodyMeasurements.hips,
            thigh: bodyMeasurements.thigh,
            arm: bodyMeasurements.arm,
        })
        .from(bodyMeasurements)
        .where(eq(bodyMeasurements.userId, userId))
        .orderBy(
            desc(bodyMeasurements.measuredOn),
            desc(bodyMeasurements.createdAt),
        );

    return rows.map((row) => ({
        ...row,
        weight: parseNumericValue(row.weight),
        waist: parseNumericValue(row.waist),
        chest: parseNumericValue(row.chest),
        hips: parseNumericValue(row.hips),
        thigh: parseNumericValue(row.thigh),
        arm: parseNumericValue(row.arm)
    }));
}

export async function deleteMeasurementForUser(
    measurementId: string,
    userId: string,
) {
    const [deletedMeasurement] = await db
        .delete(bodyMeasurements)
        .where(
            and(
                eq(bodyMeasurements.id, measurementId),
                eq(bodyMeasurements.userId, userId),
            )
        )
        .returning({
            id: bodyMeasurements.id,
        });

    return deletedMeasurement ?? null;
}