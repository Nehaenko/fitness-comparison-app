import { notFound } from "next/navigation";

import EditRoutineForm from "@/components/routines/editRoutineForm";

import { getAuthenticatedRoutineWithWorkouts } from "../../data";

export default async function EditRoutine({
                                              params,
                                          }: {
    params: Promise<{ routineId: string }>;
}) {
    const { routineId } = await params;

    const result =
        await getAuthenticatedRoutineWithWorkouts(routineId);

    if (!result) {
        notFound();
    }

    const { routine, workouts } = result;

    return (
        <EditRoutineForm
            routine={{
                id: routine.id,
                name: routine.name,
                description: routine.description,
            }}
            initialWorkouts={workouts.map((workout) => ({
                id: workout.id,
                name: workout.name,
            }))}
        />
    );
}