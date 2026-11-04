"use server";

import {revalidatePath} from "next/cache";

import {auth} from "@/auth";
import {upsertMeasurementForUser, deleteMeasurementForUser} from "@/db/measurements";
import {getProfileByUserId} from "@/db/profile";
import type {MeasurementInputValues} from "@/types/measurements";
import {getMeasurementValues} from "@/validation/measurements";

function getFormValue(
    formData: FormData,
    fieldName: string,
) {
    const value = formData.get(fieldName);

    return typeof value === "string"
        ? value
        : "";
}

export async function saveMeasurementAction(
    formData: FormData,
) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const profile = await getProfileByUserId(
        session.user.id,
    );

    const input: MeasurementInputValues = {
        measuredOn: getFormValue(
            formData,
            "measuredOn",
        ),
        weight: getFormValue(
            formData,
            "weight",
        ),
        waist: getFormValue(
            formData,
            "waist",
        ),
        chest: getFormValue(
            formData,
            "chest",
        ),
        hips: getFormValue(
            formData,
            "hips",
        ),
        thigh: getFormValue(
            formData,
            "thigh",
        ),
        arm: getFormValue(
            formData,
            "arm",
        ),
    };

    const values = getMeasurementValues(
        input,
        profile?.weightUnit ?? "kg",
        profile?.measurementUnit ?? "cm",
    );

    const savedMeasurement =
        await upsertMeasurementForUser(
            session.user.id,
            values,
        );

    if (!savedMeasurement) {
        throw new Error(
            "Unable to save measurement",
        );
    }

    revalidatePath("/measurements");
    revalidatePath("/dashboard");

    return {
        id: savedMeasurement.id,
        measuredOn: savedMeasurement.measuredOn,
    };
}

export async function deleteMeasurementAction(measurementId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            measurementId,
        )
    ) {
        throw new Error("Invalid measurement");
    }

    const deletedMeasurement =
        await deleteMeasurementForUser(measurementId, session.user.id);

    if (!deletedMeasurement) {
        throw new Error(
            "Measurement not found or cannot be removed",
        );
    }

    revalidatePath("/measurements");
    revalidatePath("/dashboard");

    return {
        id: deletedMeasurement.id,
    };
}