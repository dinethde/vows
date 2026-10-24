CREATE TYPE "public"."album_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'read', 'replied', 'archived');--> statement-breakpoint
CREATE TYPE "public"."image_format" AS ENUM('avif', 'webp', 'jpeg');--> statement-breakpoint
CREATE TYPE "public"."photo_status" AS ENUM('pending', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "album" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"couple_names" text,
	"shot_on" date,
	"time_of_day" text,
	"wedding_type" text,
	"location" text,
	"story" text,
	"cover_photo_id" text,
	"cover_focal_x" real,
	"cover_focal_y" real,
	"status" "album_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"sort_index" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"wedding_date" date,
	"wedding_place" text,
	"notes" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"original_key" text NOT NULL,
	"idempotency_key" text,
	"width" integer,
	"height" integer,
	"bytes" bigint,
	"mime" text,
	"thumbhash" text,
	"alt" text,
	"position" integer NOT NULL,
	"status" "photo_status" DEFAULT 'pending' NOT NULL,
	"error_code" text,
	"replaces_photo_id" text,
	"superseded_at" timestamp with time zone,
	"removed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_original_key_unique" UNIQUE("original_key"),
	CONSTRAINT "photo_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "photo_derivative" (
	"id" text PRIMARY KEY NOT NULL,
	"photo_id" text NOT NULL,
	"format" "image_format" NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"key" text NOT NULL,
	"bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photo_derivative_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_clerk_id" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text NOT NULL,
	"diff" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slug_redirect" (
	"id" text PRIMARY KEY NOT NULL,
	"from_slug" text NOT NULL,
	"to_album_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slug_redirect_from_slug_unique" UNIQUE("from_slug")
);
--> statement-breakpoint
ALTER TABLE "album" ADD CONSTRAINT "album_cover_photo_id_photo_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "public"."photo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_album_id_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo" ADD CONSTRAINT "photo_replaces_photo_id_photo_id_fk" FOREIGN KEY ("replaces_photo_id") REFERENCES "public"."photo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_derivative" ADD CONSTRAINT "photo_derivative_photo_id_photo_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slug_redirect" ADD CONSTRAINT "slug_redirect_to_album_id_album_id_fk" FOREIGN KEY ("to_album_id") REFERENCES "public"."album"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "album_published_idx" ON "album" USING btree ("status","sort_index" DESC NULLS LAST,"shot_on" DESC NULLS LAST) WHERE "album"."status" = 'published';--> statement-breakpoint
CREATE INDEX "enquiry_inbox_idx" ON "enquiry" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enquiry_ip_recent_idx" ON "enquiry" USING btree ("ip_hash","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "enquiry_email_recent_idx" ON "enquiry" USING btree ("email","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "photo_album_position_idx" ON "photo" USING btree ("album_id","position") WHERE "photo"."removed_at" is null and "photo"."superseded_at" is null;--> statement-breakpoint
CREATE INDEX "photo_status_idx" ON "photo" USING btree ("status") WHERE "photo"."status" <> 'ready';--> statement-breakpoint
CREATE UNIQUE INDEX "derivative_lookup_idx" ON "photo_derivative" USING btree ("photo_id","format","width");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id","created_at" DESC NULLS LAST);