import "server-only";

import {auth} from "@/auth";
import {getProgressEntriesForUser} from "@/db/progress";
import type {ProgressEntryRecord} from "@/types/progress";

export async function getAuthenticatedProgressEntries():
    Promise<ProgressEntryRecord[]> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getProgressEntriesForUser(
        session.user.id,
    );
}