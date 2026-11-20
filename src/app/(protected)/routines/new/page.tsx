import { getExercisesForUser } from "@/db/exercises";
import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import NewRoutineForm from "@/components/routines/newRoutineForm";

export default async function RoutineNewPage() {
    const profile = await getAuthenticatedUserProfile();
    const exercises = await getExercisesForUser(profile.userId);

    return <NewRoutineForm exercises={exercises} weightUnit={profile.weightUnit}/>;
}
