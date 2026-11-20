import { notFound } from "next/navigation";
import { getExercisesForUser } from "@/db/exercises";
import EditRoutineForm from "@/components/routines/editRoutineForm";

import { getAuthenticatedRoutineWithWorkouts } from "../../data";
import {getAuthenticatedUserProfile} from "@/app/(protected)/profile/data";
import {kilogramsToWeight} from "@/helpers/weight-conversion";

export default async function EditRoutine({
                                              params,
                                          }: {
    params: Promise<{ routineId: string }>;
}) {
    const { routineId } = await params;
    const [profile, result] = await Promise.all([
        getAuthenticatedUserProfile(),
        getAuthenticatedRoutineWithWorkouts(routineId),
    ]);

    if (!result) {
        notFound();
    }

    const exercises = await getExercisesForUser(profile.userId);

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
                exercises: workout.exercises.map((exercise) => ({
                    ...exercise,
                    targetWeight: exercise.targetWeight === null
                        ? null
                        : kilogramsToWeight(
                            exercise.targetWeight,
                            profile.weightUnit,
                        ),
                })),
            }))}
            exercises={exercises}
            weightUnit={profile.weightUnit}
        />
    );
}
