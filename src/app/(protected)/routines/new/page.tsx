import { getExercises } from "@/db/exercises";
import NewRoutineForm from "@/components/routines/newRoutineFrom";

export default async function RoutineNewPage() {
    const exercises = await getExercises();

    return <NewRoutineForm exercises={exercises} />;
}