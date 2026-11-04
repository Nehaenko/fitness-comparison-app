import "server-only";

import {auth} from "@/auth";
import {getMeasurementsForUser, getLatestWeightForUser} from "@/db/measurements";

async function requireAuthenticatedUserId() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return session.user.id;
}

export async function getAuthenticatedMeasurements(
    limit?: number,
) {
    const userId =
        await requireAuthenticatedUserId();

    return getMeasurementsForUser(
        userId,
        limit,
    );
}

export async function getAuthenticatedDashboardMeasurements() {
    const userId =
        await requireAuthenticatedUserId();

    const [recentMeasurements, latestWeight] =
        await Promise.all([
            getMeasurementsForUser(userId, 3),
            getLatestWeightForUser(userId),
        ]);

    return {
        recentMeasurements,
        latestWeight,
    };
}