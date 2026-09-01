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
export type NewRoutine = typeof routines.$inferInsert;

export const workoutTemplates = pgTable("workout_templates", {
        id: uuid("id").defaultRandom().primaryKey(),
        routineId: uuid("routine_id").notNull().references(() => routines.id, {
            onDelete: "cascade",
        }),
        name: text("name").notNull(),
        position: integer("position").notNull(),
        notes: text("notes"),
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
export type NewWorkoutTemplate = typeof workoutTemplates.$inferInsert;

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
export type NewExercise = typeof exercises.$inferInsert;

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
        notes: text("notes"),
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

export type WorkoutTemplateExercise = typeof workoutTemplateExercises.$inferSelect;
export type NewWorkoutTemplateExercise = typeof workoutTemplateExercises.$inferInsert;

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
