"use server";

import {revalidatePath} from "next/cache";

import {auth} from "@/auth";
import {upsertMeasurementForUser} from "@/db/measurements";
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