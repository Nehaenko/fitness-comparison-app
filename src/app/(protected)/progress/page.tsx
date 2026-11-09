import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import {getAuthenticatedProgressEntries} from "@/app/(protected)/progress/data";
import ProgressStructure from "@/components/progress/progressStructure";

export default async function ProgressPage() {
    const [profile, entries] = await Promise.all([
        getAuthenticatedUserProfile(),
        getAuthenticatedProgressEntries()
    ]);

    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <ProgressStructure
                profile={profile}
                entries={entries}
            />
        </main>
    );
}
