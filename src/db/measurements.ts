import "server-only";

import {db} from "@/db";
import {bodyMeasurements} from "@/db/schema";
import type {NormalizedMeasurementValues} from "@/types/measurements";

function numericValue(value: number | null) {
    return value === null
        ? null
        : value.toString();
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