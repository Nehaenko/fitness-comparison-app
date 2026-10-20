CREATE TABLE "workout_session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_session_id" uuid NOT NULL,
	"workout_template_exercise_id" uuid,
	"exercise_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_session_exercises_position_check" CHECK ("workout_session_exercises"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "workout_session_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_session_exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"weight" numeric(8, 2),
	"reps" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_session_sets_position_check" CHECK ("workout_session_sets"."position" >= 0),
	CONSTRAINT "workout_session_sets_weight_check" CHECK ("workout_session_sets"."weight" IS NULL OR "workout_session_sets"."weight" >= 0),
	CONSTRAINT "workout_session_sets_reps_check" CHECK ("workout_session_sets"."reps" > 0)
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"routine_id" uuid,
	"workout_template_id" uuid,
	"routine_name" text NOT NULL,
	"workout_name" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"duration_seconds" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_sessions_duration_seconds_check" CHECK ("workout_sessions"."duration_seconds" >= 0),
	CONSTRAINT "workout_sessions_completed_after_started_check" CHECK ("workout_sessions"."completed_at" >= "workout_sessions"."started_at")
);
--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_workout_session_id_workout_sessions_id_fk" FOREIGN KEY ("workout_session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_workout_template_exercise_id_workout_template_exercises_id_fk" FOREIGN KEY ("workout_template_exercise_id") REFERENCES "public"."workout_template_exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_sets" ADD CONSTRAINT "workout_session_sets_workout_session_exercise_id_workout_session_exercises_id_fk" FOREIGN KEY ("workout_session_exercise_id") REFERENCES "public"."workout_session_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "workout_session_exercises_session_position_idx" ON "workout_session_exercises" USING btree ("workout_session_id","position");--> statement-breakpoint
CREATE INDEX "workout_session_exercises_exercise_id_idx" ON "workout_session_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_session_sets_exercise_position_idx" ON "workout_session_sets" USING btree ("workout_session_exercise_id","position");--> statement-breakpoint
CREATE INDEX "workout_sessions_user_completed_at_idx" ON "workout_sessions" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "workout_sessions_workout_template_id_idx" ON "workout_sessions" USING btree ("workout_template_id");