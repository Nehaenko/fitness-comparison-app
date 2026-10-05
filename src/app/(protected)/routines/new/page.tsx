import { getExercises } from "@/db/exercises";
import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import NewRoutineForm from "@/components/routines/newRoutineFrom";

export default async function RoutineNewPage() {
    const [exercises, profile] = await Promise.all([
        getExercises(),
        getAuthenticatedUserProfile(),
    ]);
    return <NewRoutineForm exercises={exercises} weightUnit={profile.weightUnit}/>;
}