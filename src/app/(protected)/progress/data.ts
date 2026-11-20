import "server-only";

import {auth} from "@/auth";
import {getProgressEntriesForUser} from "@/db/progress";
import {getMeasurementsForUser} from "@/db/measurements";
import type {ProgressEntryRecord} from "@/types/progress";

export async function getAuthenticatedProgressEntries():
    Promise<ProgressEntryRecord[]> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const [entries, measurements] = await Promise.all([
        getProgressEntriesForUser(session.user.id),
        getMeasurementsForUser(session.user.id),
    ]);

    return entries.map((entry) => ({
        ...entry,
        measurement: measurements.find(
            (measurement) =>
                measurement.measuredOn <= entry.recordedOn,
        ) ?? null,
    }));
}
