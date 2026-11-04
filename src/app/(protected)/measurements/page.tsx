import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import {getAuthenticatedMeasurements} from "@/app/(protected)/measurements/data";
import MeasurementsStructure from "@/components/measurements/measurementsStructure";

export default async function MeasurementsPage() {
    const [profile, measurements] = await Promise.all([
        getAuthenticatedUserProfile(),
        getAuthenticatedMeasurements()
    ]);

    return (
        <main className="flex-1 bg-canvas px-5 py-8 text-primary md:px-12 md:py-14">
            <MeasurementsStructure profile={profile}
                                   measurements={measurements}/>
        </main>
    );
}
