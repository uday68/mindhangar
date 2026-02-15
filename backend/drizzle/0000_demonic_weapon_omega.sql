CREATE TABLE IF NOT EXISTS "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_videos" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"video_id" text NOT NULL,
	"title" text NOT NULL,
	"duration" integer,
	"order_index" integer NOT NULL,
	"transcript" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"synced_at" timestamp,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"session_token" text NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sync_type" text NOT NULL,
	"status" text NOT NULL,
	"items_synced" integer DEFAULT 0,
	"conflicts_detected" integer DEFAULT 0,
	"errors" jsonb,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"video_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"password" text,
	"email_verified" timestamp,
	"provider" text,
	"provider_id" text,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"region" text DEFAULT 'north' NOT NULL,
	"educational_board" text,
	"grade" integer,
	"competitive_exams" jsonb,
	"cultural_context" jsonb,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounts_user_id" ON "accounts" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_provider_account" ON "accounts" ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_videos_course_id" ON "course_videos" ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_user_id" ON "courses" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_courses_updated" ON "courses" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_token" ON "sessions" ("session_token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sync_log_user_id" ON "sync_log" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sync_log_started" ON "sync_log" ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_progress_user_id" ON "user_progress" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_progress_course_id" ON "user_progress" ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_video" ON "user_progress" ("user_id","course_id","video_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_provider" ON "users" ("provider","provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_provider_user" ON "users" ("provider","provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_identifier_token" ON "verification_tokens" ("identifier","token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_videos" ADD CONSTRAINT "course_videos_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sync_log" ADD CONSTRAINT "sync_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
