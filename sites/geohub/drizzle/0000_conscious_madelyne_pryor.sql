-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE SCHEMA "geohub";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."country" (
	"iso_3" varchar PRIMARY KEY NOT NULL,
	"iso_code" integer NOT NULL,
	"iso_2" varchar,
	"name" varchar NOT NULL,
	"region1_code" integer NOT NULL,
	"region1_name" varchar NOT NULL,
	"region2_code" integer NOT NULL,
	"region2_name" varchar NOT NULL,
	"region3_code" integer NOT NULL,
	"region3_name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."user_settings" (
	"user_email" varchar(100) NOT NULL,
	"settings" json,
	CONSTRAINT "constraint_name" UNIQUE("user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar NOT NULL,
	"key" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."style" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"style" json NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedat" timestamp with time zone DEFAULT now() NOT NULL,
	"layers" json,
	"access_level" integer DEFAULT 1 NOT NULL,
	"created_user" varchar(100),
	"updated_user" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"signupat" timestamp with time zone DEFAULT now() NOT NULL,
	"lastaccessedat" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."dataset" (
	"id" varchar PRIMARY KEY NOT NULL,
	"url" varchar NOT NULL,
	"is_raster" boolean NOT NULL,
	"license" varchar,
	"bounds" geometry(Polygon,4326) NOT NULL,
	"createdat" timestamp with time zone NOT NULL,
	"updatedat" timestamp with time zone,
	"name" varchar,
	"description" varchar,
	"created_user" varchar(100) NOT NULL,
	"updated_user" varchar(100),
	"access_level" integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."superuser" (
	"user_email" varchar(100) PRIMARY KEY NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."stac" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"url" varchar NOT NULL,
	"type" varchar NOT NULL,
	"providers" json,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"created_user" varchar(100) NOT NULL,
	"updatedat" timestamp with time zone,
	"updated_user" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."product" (
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"expression" varchar NOT NULL,
	"description" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."storymap" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"logo" varchar,
	"subtitle" varchar,
	"byline" varchar,
	"footer" varchar,
	"template_id" varchar NOT NULL,
	"style_id" integer,
	"base_style_id" varchar,
	"access_level" integer DEFAULT 1 NOT NULL,
	"createdat" timestamp with time zone NOT NULL,
	"created_user" varchar NOT NULL,
	"updatedat" timestamp with time zone,
	"updated_user" varchar,
	"show_progress" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."storymap_chapter" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"image" varchar,
	"alignment" varchar NOT NULL,
	"map_interactive" boolean DEFAULT false NOT NULL,
	"map_navigation_position" varchar NOT NULL,
	"map_animation" varchar NOT NULL,
	"rotate_animation" boolean DEFAULT false NOT NULL,
	"spinglobe" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"center" geometry(Point,4326) NOT NULL,
	"zoom" double precision NOT NULL,
	"bearing" double precision DEFAULT 0 NOT NULL,
	"pitch" double precision DEFAULT 0 NOT NULL,
	"style_id" integer,
	"base_style_id" varchar,
	"on_chapter_enter" jsonb,
	"on_chapter_exit" jsonb,
	"createdat" timestamp with time zone NOT NULL,
	"created_user" varchar NOT NULL,
	"updatedat" timestamp with time zone,
	"updated_user" varchar,
	"card_hidden" boolean DEFAULT false NOT NULL,
	"legend_position" varchar DEFAULT 'bottom-left',
	"show_legend" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."license" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."dataset_tag" (
	"dataset_id" varchar NOT NULL,
	"tag_id" serial NOT NULL,
	CONSTRAINT "dataset_tag_pkey" PRIMARY KEY("dataset_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."style_favourite" (
	"style_id" integer NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"savedat" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "style_favourite_pkey" PRIMARY KEY("style_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."dataset_favourite" (
	"dataset_id" varchar NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"savedat" timestamp with time zone NOT NULL,
	CONSTRAINT "dataset_favourite_pkey" PRIMARY KEY("dataset_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."storymap_chapters" (
	"storymap_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	CONSTRAINT "storymap_chapters_pkey" PRIMARY KEY("storymap_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."storymap_favourite" (
	"storymap_id" uuid NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"savedat" timestamp with time zone NOT NULL,
	CONSTRAINT "storymap_favourite_pkey" PRIMARY KEY("storymap_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."dataset_permission" (
	"dataset_id" varchar NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"permission" smallint DEFAULT 1 NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedat" timestamp with time zone,
	CONSTRAINT "dataset_permission_pkey" PRIMARY KEY("dataset_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."stac_collection_product" (
	"stac_id" varchar NOT NULL,
	"collection_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"assets" varchar[] NOT NULL,
	"description" varchar,
	CONSTRAINT "stac_collection_product_pkey" PRIMARY KEY("stac_id","collection_id","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."style_permission" (
	"style_id" integer NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"permission" smallint DEFAULT 1 NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedat" timestamp with time zone,
	CONSTRAINT "style_permission_pkey" PRIMARY KEY("style_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."storymap_permission" (
	"storymap_id" uuid NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"permission" smallint DEFAULT 1 NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedat" timestamp with time zone,
	CONSTRAINT "storymap_permission_pkey" PRIMARY KEY("storymap_id","user_email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "geohub"."dataset_defaultstyle" (
	"dataset_id" varchar NOT NULL,
	"layer_id" varchar NOT NULL,
	"layer_type" varchar NOT NULL,
	"source" json NOT NULL,
	"style" json NOT NULL,
	"colormap_name" varchar,
	"classification_method" varchar,
	"created_user" varchar(100) NOT NULL,
	"createdat" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedat" timestamp with time zone,
	"updated_user" varchar(100),
	"classification_method_2" varchar,
	CONSTRAINT "dataset_defaultstyle_pkey" PRIMARY KEY("dataset_id","layer_id","layer_type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."dataset_tag" ADD CONSTRAINT "fk_dataset_to_dataset_tag" FOREIGN KEY ("dataset_id") REFERENCES "geohub"."dataset"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."dataset_tag" ADD CONSTRAINT "fk_tag_to_dataset_tag" FOREIGN KEY ("tag_id") REFERENCES "geohub"."tag"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."style_favourite" ADD CONSTRAINT "FK_style_TO_style_favourite" FOREIGN KEY ("style_id") REFERENCES "geohub"."style"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."dataset_favourite" ADD CONSTRAINT "FK_dataset_TO_dataset_favourite" FOREIGN KEY ("dataset_id") REFERENCES "geohub"."dataset"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."storymap_chapters" ADD CONSTRAINT "fk_storymap_to_storymap_chapters" FOREIGN KEY ("storymap_id") REFERENCES "geohub"."storymap"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."storymap_chapters" ADD CONSTRAINT "fk_storymap_to_storymap_chapter" FOREIGN KEY ("chapter_id") REFERENCES "geohub"."storymap_chapter"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."storymap_favourite" ADD CONSTRAINT "FK_storymap_TO_storymap_favourite" FOREIGN KEY ("storymap_id") REFERENCES "geohub"."storymap"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."dataset_permission" ADD CONSTRAINT "FK_dataset_TO_dataset_permission" FOREIGN KEY ("dataset_id") REFERENCES "geohub"."dataset"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."stac_collection_product" ADD CONSTRAINT "stac_collection_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "geohub"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."style_permission" ADD CONSTRAINT "FK_style_TO_style_permission" FOREIGN KEY ("style_id") REFERENCES "geohub"."style"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."storymap_permission" ADD CONSTRAINT "FK_storymap_TO_storymap_permission" FOREIGN KEY ("storymap_id") REFERENCES "geohub"."storymap"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "geohub"."dataset_defaultstyle" ADD CONSTRAINT "FK_dataset_TO_dataset_id, layer_type" FOREIGN KEY ("dataset_id") REFERENCES "geohub"."dataset"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_idx_key_value" ON "geohub"."tag" USING btree ("key","value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_idx_value" ON "geohub"."tag" USING btree ("value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dataset_bounds_geom_idx" ON "geohub"."dataset" USING gist ("bounds");
