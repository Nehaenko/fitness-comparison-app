import "server-only";

import { auth } from "@/auth";
import {
    createDefaultProfile,
    getProfileByUserId,
} from "@/db/profile";

export async function getAuthenticatedUserProfile() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const profile = await getProfileByUserId(session.user.id);

    if (profile) return profile;

    return createDefaultProfile(session.user.id, session.user.name);
}
