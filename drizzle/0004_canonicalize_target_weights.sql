-- Existing target weights were stored in the user's display unit. Convert
-- values belonging to users whose current preference is pounds into the new
-- canonical kilograms representation.
UPDATE "workout_template_exercises" AS configured_exercise
SET "target_weight" = ROUND(
    (configured_exercise."target_weight" / 2.2046226218)::numeric,
    2
)
FROM "workout_templates" AS workout
INNER JOIN "routines" AS routine
    ON routine."id" = workout."routine_id"
INNER JOIN "profiles" AS profile
    ON profile."user_id" = routine."user_id"
WHERE configured_exercise."workout_template_id" = workout."id"
  AND profile."weight_unit" = 'lb'
  AND configured_exercise."target_weight" IS NOT NULL;
