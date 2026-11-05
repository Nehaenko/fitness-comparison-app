import type {AdapterAccountType} from "next-auth/adapters";
import {sql} from "drizzle-orm";
import {
    integer,
    pgTable,
    primaryKey,
    text,
    pgEnum,
    timestamp,
    boolean,
    index,
    uniqueIndex,
    uuid,
    check, numeric,
    date,
} from "drizzle-orm/pg-core";

export const weightUnitEnum = pgEnum("weight_unit", ["kg", "lb"]);

export const measurementUnitEnum = pgEnum(
    "measurement_unit",
    ["cm", "in"],
);

export const users = pgTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("email_verified", {mode: "date"}),
    image: text("image"),
});

export const profiles = pgTable("profiles", {
    userId: text("user_id")
        .primaryKey()
        .references(() => users.id, {onDelete: "cascade"}),
    displayName: text("display_name").notNull(),
    weightUnit: weightUnitEnum("weight_unit")
        .notNull()
        .default("kg"),
    measurementUnit: measurementUnitEnum("measurement_unit")
        .notNull()
        .default("cm"),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
        mode: "date",
    })
        .defaultNow()
        .notNull(),
});

export const bodyMeasurements = pgTable(
    "body_measurements",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        measuredOn: date("measured_on", {
            mode: "string",
        }).notNull(),

        weight: numeric("weight", {
            precision: 8,
            scale: 2,
        }),

        waist: numeric("waist", {
            precision: 8,
            scale: 2,
        }),

        chest: numeric("chest", {
            precision: 8,
            scale: 2,
        }),

        hips: numeric("hips", {
            precision: 8,
            scale: 2,
        }),

        thigh: numeric("thigh", {
            precision: 8,
            scale: 2,
        }),

        arm: numeric("arm", {
            precision: 8,
            scale: 2,
        }),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex(
            "body_measurements_user_measured_on_idx",
        ).on(
            table.userId,
            table.measuredOn,
        ),

        check(
            "body_measurements_at_least_one_value_check",
            sql`
                ${table.weight} IS NOT NULL OR
                ${table.waist} IS NOT NULL OR
                ${table.chest} IS NOT NULL OR
                ${table.hips} IS NOT NULL OR
                ${table.thigh} IS NOT NULL OR
                ${table.arm} IS NOT NULL
            `,
        ),

        check(
            "body_measurements_positive_values_check",
            sql`
                (${table.weight} IS NULL OR ${table.weight} > 0) AND
                (${table.waist} IS NULL OR ${table.waist} > 0) AND
                (${table.chest} IS NULL OR ${table.chest} > 0) AND
                (${table.hips} IS NULL OR ${table.hips} > 0) AND
                (${table.thigh} IS NULL OR ${table.thigh} > 0) AND
                (${table.arm} IS NULL OR ${table.arm} > 0)
            `,
        ),
    ],
);

export type BodyMeasurement =
    typeof bodyMeasurements.$inferSelect;

export const progressPhotoViewEnum = pgEnum(
    "progress_photo_view",
    ["front", "side", "back"],
)
export const progressEntries = pgTable(
    "progress_entries",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        recordedOn: date("recorded_on", {
            mode: "string",
        }).notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("progress_entries_user_recorded_on_idx")
            .on(table.userId, table.recordedOn),
    ],
);

export const progressPhotos = pgTable(
    "progress_photos",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        progressEntryId: uuid("progress_entry_id")
            .notNull()
            .references(() => progressEntries.id, {
                onDelete: "cascade",
            }),

        view: progressPhotoViewEnum("view").notNull(),

        storageKey: text("storage_key").notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("progress_photos_entry_view_idx")
            .on(table.progressEntryId, table.view),

        uniqueIndex("progress_photos_storage_key_idx")
            .on(table.storageKey),
    ],
);

export const routines = pgTable("routines", {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id").notNull().references(() => users.id, {
            onDelete: "cascade",
        }),
        name: text("name").notNull(),
        description: text("description"),
        isActive: boolean("is_active").notNull().default(false),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        index("routines_user_id_idx")
            .on(table.userId),

        uniqueIndex("routines_one_active_per_user_idx")
            .on(table.userId)
            .where(sql`${table.isActive}
            = true`),
    ],
);

export type Routine = typeof routines.$inferSelect;

export const workoutTemplates = pgTable("workout_templates", {
        id: uuid("id").defaultRandom().primaryKey(),
        routineId: uuid("routine_id").notNull().references(() => routines.id, {
            onDelete: "cascade",
        }),
        name: text("name").notNull(),
        position: integer("position").notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("workout_templates_routine_position_idx")
            .on(table.routineId, table.position),

        check(
            "workout_templates_position_check",
            sql`${table.position}
            >= 0`,
        ),
    ],
);

export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;

export const exercises = pgTable("exercises", {
        id: uuid("id").defaultRandom().primaryKey(),
        externalId: text("external_id").unique(),
        name: text("name").notNull(),
        muscleGroup: text("muscle_group"),
        equipment: text("equipment"),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        index("exercises_muscle_group_idx").on(table.muscleGroup),

        index("exercises_equipment_idx").on(table.equipment),

        index("exercises_name_idx").on(table.name),
    ],
);

export type Exercise = typeof exercises.$inferSelect;

export const workoutTemplateExercises = pgTable("workout_template_exercises", {
        id: uuid("id").defaultRandom().primaryKey(),
        workoutTemplateId: uuid("workout_template_id").notNull().references(() => workoutTemplates.id, {
            onDelete: "cascade",
        }),
        exerciseId: uuid("exercise_id").notNull()
            .references(() => exercises.id, {
                onDelete: "restrict",
            }),
        position: integer("position").notNull(),
        sets: integer("sets").notNull().default(3),
        targetReps: integer("target_reps").notNull().default(10),
        targetWeight: numeric("target_weight", {
            precision: 8,
            scale: 2,
        }),
        restSeconds: integer("rest_seconds").notNull().default(90),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        }).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("workout_template_exercises_template_position_idx").on(table.workoutTemplateId, table.position),

        index("workout_template_exercises_exercise_id_idx").on(table.exerciseId),

        check(
            "workout_template_exercises_position_check",
            sql`${table.position} >= 0`,
        ),

        check(
            "workout_template_exercises_sets_check",
            sql`${table.sets} > 0`,
        ),

        check(
            "workout_template_exercises_target_reps_check",
            sql`${table.targetReps} > 0`,
        ),

        check(
            "workout_template_exercises_target_weight_check",
            sql`${table.targetWeight} IS NULL OR ${table.targetWeight} >= 0`,
        ),

        check(
            "workout_template_exercises_rest_seconds_check",
            sql`${table.restSeconds} >= 0`,
        ),
    ],
);

export const workoutSessions = pgTable(
    "workout_sessions",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        userId: text("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        routineId: uuid("routine_id")
            .references(() => routines.id, {
                onDelete: "set null",
            }),

        workoutTemplateId: uuid("workout_template_id")
            .references(() => workoutTemplates.id, {
                onDelete: "set null",
            }),

        routineName: text("routine_name")
            .notNull(),

        workoutName: text("workout_name")
            .notNull(),

        startedAt: timestamp("started_at", {
            withTimezone: true,
            mode: "date",
        }).notNull(),

        completedAt: timestamp("completed_at", {
            withTimezone: true,
            mode: "date",
        }).notNull(),

        durationSeconds: integer("duration_seconds")
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("workout_sessions_user_completed_at_idx")
            .on(table.userId, table.completedAt),

        index("workout_sessions_workout_template_id_idx")
            .on(table.workoutTemplateId),

        check(
            "workout_sessions_duration_seconds_check",
            sql`${table.durationSeconds} >= 0`,
        ),

        check(
            "workout_sessions_completed_after_started_check",
            sql`${table.completedAt} >= ${table.startedAt}`,
        ),
    ],
);

export type WorkoutSession =
    typeof workoutSessions.$inferSelect;

export const workoutSessionExercises = pgTable(
    "workout_session_exercises",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        workoutSessionId: uuid("workout_session_id")
            .notNull()
            .references(() => workoutSessions.id, {
                onDelete: "cascade",
            }),

        workoutTemplateExerciseId: uuid(
            "workout_template_exercise_id",
        ).references(() => workoutTemplateExercises.id, {
            onDelete: "set null",
        }),

        exerciseId: uuid("exercise_id")
            .notNull()
            .references(() => exercises.id, {
                onDelete: "restrict",
            }),

        exerciseName: text("exercise_name")
            .notNull(),

        position: integer("position")
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex(
            "workout_session_exercises_session_position_idx",
        ).on(
            table.workoutSessionId,
            table.position,
        ),

        index(
            "workout_session_exercises_exercise_id_idx",
        ).on(table.exerciseId),

        check(
            "workout_session_exercises_position_check",
            sql`${table.position} >= 0`,
        ),
    ],
);

export type WorkoutSessionExercise =
    typeof workoutSessionExercises.$inferSelect;

export const workoutSessionSets = pgTable(
    "workout_session_sets",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        workoutSessionExerciseId: uuid(
            "workout_session_exercise_id",
        )
            .notNull()
            .references(() => workoutSessionExercises.id, {
                onDelete: "cascade",
            }),

        position: integer("position")
            .notNull(),

        weight: numeric("weight", {
            precision: 8,
            scale: 2,
        }),

        reps: integer("reps")
            .notNull(),

        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        uniqueIndex(
            "workout_session_sets_exercise_position_idx",
        ).on(
            table.workoutSessionExerciseId,
            table.position,
        ),

        check(
            "workout_session_sets_position_check",
            sql`${table.position} >= 0`,
        ),

        check(
            "workout_session_sets_weight_check",
            sql`${table.weight} IS NULL OR ${table.weight} >= 0`,
        ),

        check(
            "workout_session_sets_reps_check",
            sql`${table.reps} > 0`,
        ),
    ],
);

export type WorkoutSessionSet =
    typeof workoutSessionSets.$inferSelect;

export const accounts = pgTable(
    "accounts",
    {
        userId: text("user_id")
            .notNull()
            .references(() => users.id, {onDelete: "cascade"}),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("provider_account_id").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ],
);

export const sessions = pgTable("sessions", {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, {onDelete: "cascade"}),
    expires: timestamp("expires", {mode: "date"}).notNull(),
});

export const verificationTokens = pgTable(
    "verification_tokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", {mode: "date"}).notNull(),
    },
    (token) => [
        primaryKey({
            columns: [token.identifier, token.token],
        }),
    ],
);
