CREATE TABLE "body_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"measured_on" date NOT NULL,
	"weight" numeric(8, 2),
	"waist" numeric(8, 2),
	"chest" numeric(8, 2),
	"hips" numeric(8, 2),
	"thigh" numeric(8, 2),
	"arm" numeric(8, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "body_measurements_at_least_one_value_check" CHECK (
                "body_measurements"."weight" IS NOT NULL OR
                "body_measurements"."waist" IS NOT NULL OR
                "body_measurements"."chest" IS NOT NULL OR
                "body_measurements"."hips" IS NOT NULL OR
                "body_measurements"."thigh" IS NOT NULL OR
                "body_measurements"."arm" IS NOT NULL
            ),
	CONSTRAINT "body_measurements_positive_values_check" CHECK (
                ("body_measurements"."weight" IS NULL OR "body_measurements"."weight" > 0) AND
                ("body_measurements"."waist" IS NULL OR "body_measurements"."waist" > 0) AND
                ("body_measurements"."chest" IS NULL OR "body_measurements"."chest" > 0) AND
                ("body_measurements"."hips" IS NULL OR "body_measurements"."hips" > 0) AND
                ("body_measurements"."thigh" IS NULL OR "body_measurements"."thigh" > 0) AND
                ("body_measurements"."arm" IS NULL OR "body_measurements"."arm" > 0)
            )
);
--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "body_measurements_user_measured_on_idx" ON "body_measurements" USING btree ("user_id","measured_on");