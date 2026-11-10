CREATE TYPE "public"."progress_photo_view" AS ENUM('front', 'side', 'back');--> statement-breakpoint
CREATE TABLE "progress_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recorded_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"progress_entry_id" uuid NOT NULL,
	"view" "progress_photo_view" NOT NULL,
	"storage_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_progress_entry_id_progress_entries_id_fk" FOREIGN KEY ("progress_entry_id") REFERENCES "public"."progress_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "progress_entries_user_recorded_on_idx" ON "progress_entries" USING btree ("user_id","recorded_on");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_photos_entry_view_idx" ON "progress_photos" USING btree ("progress_entry_id","view");--> statement-breakpoint
CREATE UNIQUE INDEX "progress_photos_storage_key_idx" ON "progress_photos" USING btree ("storage_key");