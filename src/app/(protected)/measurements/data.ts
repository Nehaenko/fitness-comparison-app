import "server-only";

import {auth} from "@/auth";
import {getMeasurementsForUser} from "@/db/measurements";

export async function getAuthenticatedMeasurements() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getMeasurementsForUser(session.user.id);
}