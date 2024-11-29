ALTER TABLE "geohub"."storymap_chapter" ADD COLUMN "hillshade" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "geohub"."storymap_chapter" ADD COLUMN "terrain" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "geohub"."storymap" ADD COLUMN "hillshade" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "geohub"."storymap" ADD COLUMN "terrain" boolean DEFAULT false NOT NULL;